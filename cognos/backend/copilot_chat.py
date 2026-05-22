import os
import json
from github import Github
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

gh = Github(os.getenv("GITHUB_TOKEN"))
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def ask_cognos(repo_name: str, question: str, history: list = []) -> dict:
    repo = gh.get_repo(repo_name)

    # Pull relevant context based on question keywords
    context_parts = []

    q_lower = question.lower()

    # Always include basic repo info
    context_parts.append(f"Repository: {repo.full_name}")
    context_parts.append(f"Language: {repo.language}")
    context_parts.append(f"Open Issues: {repo.open_issues_count}")

    # Pull recent CI info if asked about CI/CD/tests/failures
    if any(w in q_lower for w in ["ci", "test", "fail", "pipeline", "workflow", "build"]):
        try:
            ci_context = []
            for wf in repo.get_workflows():
                runs = list(wf.get_runs())[:5]
                for r in runs:
                    ci_context.append(f"{wf.name}: {r.conclusion or r.status} ({r.created_at.strftime('%Y-%m-%d')})")
            context_parts.append("Recent CI Runs:\n" + "\n".join(ci_context[:10]))
        except Exception:
            pass

    # Pull PR info if asked about PRs/reviews/merge
    if any(w in q_lower for w in ["pr", "pull request", "review", "merge", "open"]):
        prs = []
        for pr in repo.get_pulls(state="open"):
            prs.append(f"#{pr.number} '{pr.title}' by {pr.user.login} ({pr.changed_files} files)")
        if prs:
            context_parts.append("Open PRs:\n" + "\n".join(prs[:10]))

    # Pull commit history if asked about commits/changes/activity
    if any(w in q_lower for w in ["commit", "change", "recent", "activity", "last week", "who", "what"]):
        since = datetime.utcnow() - timedelta(days=14)
        commits = []
        for c in repo.get_commits(since=since):
            commits.append(f"- [{c.commit.author.date.strftime('%m-%d')}] {c.commit.author.name}: {c.commit.message[:100]}")
        context_parts.append("Recent Commits (14 days):\n" + "\n".join(commits[:15]))

    # Pull issues if asked about bugs/issues/problems
    if any(w in q_lower for w in ["issue", "bug", "problem", "ticket", "error"]):
        issues = []
        for issue in repo.get_issues(state="open"):
            if not issue.pull_request:
                labels = [l.name for l in issue.labels]
                issues.append(f"#{issue.number} '{issue.title}' [{', '.join(labels)}]")
        context_parts.append("Open Issues:\n" + "\n".join(issues[:10]))

    context = "\n\n".join(context_parts)

    # Build conversation
    messages = [
        {
            "role": "system",
            "content": f"""You are CognOS, an intelligent AI assistant embedded in a software development intelligence platform. 
You have deep knowledge of the repository and can answer questions about its code, CI/CD health, team activity, PRs, issues, and development patterns.

You speak in a clear, direct, helpful tone — like a senior engineer who knows the codebase inside out.
Always be specific with data when available. Never make up data — say 'I don't have that info' if needed.

Current Repository Context:
{context}

Today: {datetime.utcnow().strftime('%Y-%m-%d')}"""
        }
    ]

    # Add chat history
    for msg in history[-6:]:  # Keep last 6 turns
        messages.append({"role": msg["role"], "content": msg["content"]})

    # Add current question
    messages.append({"role": "user", "content": question})

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0.5,
        max_tokens=800,
    )

    answer = response.choices[0].message.content

    return {
        "answer": answer,
        "context_used": len(context_parts),
        "repo": repo_name,
    }
