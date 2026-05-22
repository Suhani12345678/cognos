import os
from github import Github
from dotenv import load_dotenv
from datetime import datetime, timedelta
from collections import defaultdict

load_dotenv()

gh = Github(os.getenv("GITHUB_TOKEN"))


def get_repo_stats(repo_name: str) -> dict:
    repo = gh.get_repo(repo_name)
    since_30 = datetime.utcnow() - timedelta(days=30)
    since_7 = datetime.utcnow() - timedelta(days=7)

    # Basic info
    info = {
        "name": repo.name,
        "full_name": repo.full_name,
        "description": repo.description,
        "stars": repo.stargazers_count,
        "forks": repo.forks_count,
        "open_issues": repo.open_issues_count,
        "default_branch": repo.default_branch,
        "language": repo.language,
        "created_at": repo.created_at.isoformat(),
        "last_push": repo.pushed_at.isoformat() if repo.pushed_at else None,
    }

    # Commit activity last 30 days
    commits_30 = []
    commit_by_day = defaultdict(int)
    commit_by_author = defaultdict(int)
    for c in repo.get_commits(since=since_30):
        day = c.commit.author.date.strftime("%Y-%m-%d")
        commit_by_day[day] += 1
        commit_by_author[c.commit.author.name] += 1
        commits_30.append(c.sha[:7])

    commits_7 = []
    for c in repo.get_commits(since=since_7):
        commits_7.append(c.sha[:7])

    # PR stats
    open_prs = list(repo.get_pulls(state="open"))
    merged_prs_30 = []
    for pr in repo.get_pulls(state="closed"):
        if pr.merged_at and pr.merged_at >= since_30:
            merged_prs_30.append({
                "title": pr.title,
                "author": pr.user.login,
                "time_to_merge_hours": round(
                    (pr.merged_at - pr.created_at).total_seconds() / 3600, 1
                ),
                "files_changed": pr.changed_files,
            })

    avg_merge_time = 0
    if merged_prs_30:
        avg_merge_time = sum(p["time_to_merge_hours"] for p in merged_prs_30) / len(merged_prs_30)

    # Workflow runs
    workflow_summary = []
    try:
        for wf in repo.get_workflows():
            runs = list(wf.get_runs())[:20]
            if runs:
                conclusions = [r.conclusion for r in runs if r.conclusion]
                failures = sum(1 for c in conclusions if c in ["failure", "timed_out"])
                workflow_summary.append({
                    "name": wf.name,
                    "total_runs": len(conclusions),
                    "failures": failures,
                    "success_rate": round((1 - failures / len(conclusions)) * 100, 1) if conclusions else 100,
                    "last_status": runs[0].conclusion if runs else "unknown",
                })
    except Exception:
        pass

    # Language breakdown (try to get from repo)
    try:
        languages = dict(list(repo.get_languages().items())[:8])
        total_bytes = sum(languages.values())
        lang_percent = {k: round(v / total_bytes * 100, 1) for k, v in languages.items()}
    except Exception:
        lang_percent = {}

    # Commit heatmap data
    heatmap = [{"date": d, "count": c} for d, c in sorted(commit_by_day.items())]

    # Top contributors
    top_contributors = sorted(commit_by_author.items(), key=lambda x: x[1], reverse=True)[:5]

    return {
        "repo_info": info,
        "commit_stats": {
            "last_30_days": len(commits_30),
            "last_7_days": len(commits_7),
            "commits_per_day_avg": round(len(commits_30) / 30, 2),
            "heatmap": heatmap[-30:],
        },
        "pr_stats": {
            "open_prs": len(open_prs),
            "merged_last_30_days": len(merged_prs_30),
            "avg_merge_time_hours": round(avg_merge_time, 1),
            "recent_merged": merged_prs_30[:5],
        },
        "ci_stats": {
            "workflows": workflow_summary,
        },
        "contributors": [{"name": n, "commits": c} for n, c in top_contributors],
        "language_breakdown": lang_percent,
    }
