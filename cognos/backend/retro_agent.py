import os
import json
from github import Github
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

gh = Github(os.getenv("GITHUB_TOKEN"))
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_retrospective(repo_name: str, days: int = 7) -> dict:
    repo = gh.get_repo(repo_name)
    since = datetime.utcnow() - timedelta(days=days)

    # Commits
    commits_data = []
    for c in repo.get_commits(since=since):
        commits_data.append({
            "message": c.commit.message[:150],
            "author": c.commit.author.name,
            "date": c.commit.author.date.isoformat(),
            "additions": c.stats.additions if c.stats else 0,
            "deletions": c.stats.deletions if c.stats else 0,
        })

    # PRs merged in period
    merged_prs = []
    open_prs = []
    for pr in repo.get_pulls(state="closed"):
        if pr.merged_at and pr.merged_at >= since:
            merged_prs.append({
                "title": pr.title,
                "author": pr.user.login,
                "files_changed": pr.changed_files,
                "additions": pr.additions,
                "deletions": pr.deletions,
                "review_comments": pr.review_comments,
                "time_to_merge_hours": round(
                    (pr.merged_at - pr.created_at).total_seconds() / 3600, 1
                ),
            })

    for pr in repo.get_pulls(state="open"):
        if pr.created_at >= since:
            open_prs.append({
                "title": pr.title,
                "author": pr.user.login,
                "age_hours": round(
                    (datetime.utcnow() - pr.created_at).total_seconds() / 3600, 1
                ),
            })

    # Issues
    closed_issues = []
    open_issues = []
    for issue in repo.get_issues(state="closed", since=since):
        if not issue.pull_request:
            closed_issues.append({
                "title": issue.title,
                "labels": [l.name for l in issue.labels],
            })
    for issue in repo.get_issues(state="open"):
        if not issue.pull_request and issue.created_at >= since:
            open_issues.append({
                "title": issue.title,
                "labels": [l.name for l in issue.labels],
            })

    # Contributor breakdown
    contributor_map = {}
    for c in commits_data:
        a = c["author"]
        if a not in contributor_map:
            contributor_map[a] = {"commits": 0, "additions": 0, "deletions": 0}
        contributor_map[a]["commits"] += 1
        contributor_map[a]["additions"] += c["additions"]
        contributor_map[a]["deletions"] += c["deletions"]

    prompt = f"""You are CognOS, an AI Scrum Master generating a sprint retrospective report.

Repository: {repo_name}
Period: Last {days} days (since {since.strftime('%Y-%m-%d')})

SPRINT DATA:
- Total Commits: {len(commits_data)}
- PRs Merged: {len(merged_prs)}
- PRs Still Open: {len(open_prs)}
- Issues Closed: {len(closed_issues)}
- Issues Open: {len(open_issues)}

Contributor Activity: {json.dumps(contributor_map, indent=2)}

Merged PRs: {json.dumps(merged_prs[:10], indent=2)}

Open PRs (potential blockers): {json.dumps(open_prs[:5], indent=2)}

Recent Commits (sample): {json.dumps(commits_data[:15], indent=2)}

Generate a comprehensive sprint retrospective as JSON:
{{
  "sprint_health_score": <integer 0-100>,
  "health_label": "<STRUGGLING|NEEDS_IMPROVEMENT|GOOD|EXCELLENT>",
  "executive_summary": "<3-4 sentence summary of the sprint>",
  "velocity": {{
    "commits_per_day": <float>,
    "prs_merged": {len(merged_prs)},
    "issues_closed": {len(closed_issues)},
    "lines_added": <integer>,
    "lines_deleted": <integer>
  }},
  "what_went_well": ["<item1>", "<item2>", "<item3>"],
  "what_needs_improvement": ["<item1>", "<item2>"],
  "blockers_identified": ["<blocker1>"],
  "top_contributors": ["<name: contribution summary>"],
  "action_items_for_next_sprint": [
    {{"item": "<action>", "owner": "<suggested owner or team>", "priority": "<HIGH|MEDIUM|LOW>"}}
  ],
  "risks_to_watch": ["<risk1>", "<risk2>"],
  "team_morale_signals": "<observations about team health from commit patterns>",
  "ai_recommendations": ["<strategic recommendation 1>", "<recommendation 2>"]
}}

Return ONLY valid JSON."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    result = json.loads(raw)
    result["period_days"] = days
    result["data_summary"] = {
        "total_commits": len(commits_data),
        "prs_merged": len(merged_prs),
        "prs_open": len(open_prs),
        "issues_closed": len(closed_issues),
        "issues_open": len(open_issues),
        "contributors": len(contributor_map),
    }
    return result
