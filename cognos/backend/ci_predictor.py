import os
import json
from github import Github
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

gh = Github(os.getenv("GITHUB_TOKEN"))
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def predict_ci_failure(repo_name: str, branch: str = "main") -> dict:
    repo = gh.get_repo(repo_name)

    # Get recent workflow runs
    workflows = repo.get_workflows()
    recent_runs = []
    for wf in workflows:
        runs = wf.get_runs(branch=branch)
        count = 0
        for run in runs:
            if count >= 10:
                break
            recent_runs.append({
                "workflow": wf.name,
                "status": run.status,
                "conclusion": run.conclusion,
                "created_at": run.created_at.isoformat(),
                "run_duration_seconds": (
                    (run.updated_at - run.created_at).seconds
                    if run.updated_at and run.created_at else None
                )
            })
            count += 1

    # Get recent commits to branch
    commits = []
    try:
        branch_obj = repo.get_branch(branch)
        sha = branch_obj.commit.sha
        commit_list = repo.get_commits(sha=sha)
        c_count = 0
        for c in commit_list:
            if c_count >= 5:
                break
            commits.append({
                "message": c.commit.message[:200],
                "author": c.commit.author.name,
                "date": c.commit.author.date.isoformat(),
                "files_changed": c.stats.total if c.stats else 0
            })
            c_count += 1
    except Exception:
        pass

    # Get open PRs targeting branch
    open_prs = []
    for pr in repo.get_pulls(state="open", base=branch):
        open_prs.append({
            "title": pr.title,
            "files_changed": pr.changed_files,
            "additions": pr.additions,
            "deletions": pr.deletions
        })

    # Calculate failure rate from recent runs
    conclusions = [r.get("conclusion") for r in recent_runs if r.get("conclusion")]
    failure_count = sum(1 for c in conclusions if c in ["failure", "timed_out", "error"])
    failure_rate = (failure_count / len(conclusions) * 100) if conclusions else 0

    prompt = f"""You are CognOS, an AI that predicts CI/CD pipeline failures before they happen.

Repository: {repo_name}
Branch: {branch}
Recent CI/CD failure rate: {failure_rate:.1f}%

Recent Workflow Runs (last 10):
{json.dumps(recent_runs, indent=2)}

Recent Commits:
{json.dumps(commits, indent=2)}

Open Pull Requests targeting this branch:
{json.dumps(open_prs, indent=2)}

Based on patterns in the CI history, commit patterns, and PR activity, predict:

Return a JSON object with these exact keys:
{{
  "failure_probability": <integer 0-100, probability next CI run fails>,
  "risk_level": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "predicted_failure_types": ["<type1>", "<type2>"],
  "root_causes": ["<cause1>", "<cause2>"],
  "warning_signals": ["<signal1>", "<signal2>"],
  "recommended_actions": ["<action1>", "<action2>"],
  "estimated_fix_time_minutes": <integer>,
  "confidence": "<LOW|MEDIUM|HIGH>",
  "analysis_summary": "<2-3 sentence summary>"
}}

Return ONLY valid JSON."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    result = json.loads(raw)
    result["actual_failure_rate_percent"] = round(failure_rate, 1)
    result["runs_analyzed"] = len(recent_runs)
    return result
