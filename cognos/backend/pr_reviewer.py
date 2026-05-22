import os
import json
from github import Github
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

gh = Github(os.getenv("GITHUB_TOKEN"))
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def review_pull_request(repo_name: str, pr_number: int) -> dict:
    repo = gh.get_repo(repo_name)
    pr = repo.get_pull(pr_number)

    files_changed = []
    for f in pr.get_files():
        files_changed.append({
            "filename": f.filename,
            "status": f.status,
            "additions": f.additions,
            "deletions": f.deletions,
            "patch": (f.patch or "")[:3000]
        })

    diff_text = "\n\n".join([
        f"### {f['filename']} ({f['status']}: +{f['additions']} -{f['deletions']})\n{f['patch']}"
        for f in files_changed
    ])

    commits = list(pr.get_commits())
    commit_messages = [c.commit.message for c in commits[-5:]]

    prompt = f"""You are CognOS, an expert AI code reviewer. Analyze this Pull Request deeply.

PR Title: {pr.title}
PR Description: {pr.body or 'No description provided'}
Author: {pr.user.login}
Files Changed: {len(files_changed)}
Recent Commits: {json.dumps(commit_messages)}

Code Diff:
{diff_text}

Provide a thorough review as a JSON object with these exact keys:
{{
  "risk_score": <integer 1-10, 10 = extremely risky>,
  "risk_level": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "summary": "<2-3 sentences: what this PR does>",
  "bugs_found": ["<bug 1>", "<bug 2>"],
  "security_issues": ["<issue 1>"],
  "performance_issues": ["<issue 1>"],
  "code_quality": ["<observation 1>"],
  "suggestions": ["<specific fix 1>", "<specific fix 2>"],
  "positive_aspects": ["<good thing 1>"],
  "verdict": "<APPROVE|REQUEST_CHANGES|NEEDS_DISCUSSION>",
  "verdict_reason": "<one sentence why>"
}}

Return ONLY valid JSON, no markdown."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )

    raw = response.choices[0].message.content.strip()
    # Strip markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    review = json.loads(raw)

    # Post comment back to PR
    verdict_emoji = {"APPROVE": "✅", "REQUEST_CHANGES": "🔴", "NEEDS_DISCUSSION": "🟡"}.get(review.get("verdict", ""), "🔵")
    risk_emoji = {"LOW": "🟢", "MEDIUM": "🟡", "HIGH": "🔴", "CRITICAL": "💀"}.get(review.get("risk_level", ""), "⚪")

    comment = f"""## 🤖 CognOS AI Code Review

{verdict_emoji} **Verdict:** {review.get('verdict')} — {review.get('verdict_reason')}
{risk_emoji} **Risk Score:** {review.get('risk_score')}/10 ({review.get('risk_level')})

### 📋 Summary
{review.get('summary')}

### 🐛 Bugs Found
{chr(10).join(f'- {b}' for b in review.get('bugs_found', ['None found'])) }

### 🔒 Security Issues
{chr(10).join(f'- {s}' for s in review.get('security_issues', ['None found']))}

### ⚡ Performance Issues
{chr(10).join(f'- {p}' for p in review.get('performance_issues', ['None found']))}

### 💡 Suggestions
{chr(10).join(f'- {s}' for s in review.get('suggestions', []))}

### ✨ What's Good
{chr(10).join(f'- {g}' for g in review.get('positive_aspects', []))}

---
*Powered by CognOS AI — Microsoft Build AI Hackathon 2025*"""

    pr.create_issue_comment(comment)
    return review
