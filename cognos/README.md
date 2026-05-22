# 🧠 CognOS — AI-Native Software Delivery Intelligence

> **Microsoft Build AI Hackathon 2025** | Theme: AI-Powered Production Function

CognOS is an AI brain that sits on top of your GitHub repository and transforms your entire software delivery lifecycle — code reviews, CI/CD health, test generation, team retrospectives, and conversational intelligence — all in one unified platform.

[![Microsoft AI Stack](https://img.shields.io/badge/Microsoft%20AI-Stack-0078D4?logo=microsoft)](https://github.com/microsoft/semantic-kernel)
[![GPT-4o](https://img.shields.io/badge/GPT--4o-Powered-10a37f)](https://openai.com)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Integrated-2088FF?logo=github-actions)](https://github.com/features/actions)
[![Semantic Kernel](https://img.shields.io/badge/Semantic%20Kernel-Microsoft-5C2D91)](https://github.com/microsoft/semantic-kernel)

---

## 🎯 The Problem

Software teams are drowning in fragmented tooling:
- **PRs** reviewed late or superficially — bugs slip through
- **CI failures** discovered too late, costing hours of debugging
- **Test coverage** left to developers who are already stretched
- **Retrospectives** done manually, if at all
- **No single AI brain** that understands your full delivery pipeline

CognOS solves all of this. **One platform. One AI. Full pipeline intelligence.**

---

## ✨ Features

### 🔍 PR Intelligence
- Real-time AI code review on every Pull Request
- Risk scoring (1–10) with risk level classification
- Bug detection, security analysis, performance review
- Auto-posts detailed review comment directly on GitHub PR

### ⚡ CI Failure Predictor
- Predicts CI failure probability before the pipeline runs
- Analyzes historical workflow patterns + recent commits
- Identifies warning signals and recommends preventive actions
- Estimated fix time if failure occurs

### 🧪 Auto Test Generator
- Generates complete, runnable test suites for PR changes
- Supports Python (pytest), JavaScript/TypeScript (Jest), React, Java, Go
- Coverage estimation and test strategy explanation
- Auto-posts test file summary to PR

### 📊 Repository Dashboard
- 30-day commit heatmap and velocity tracking
- PR merge time analytics
- CI/CD success rate per workflow
- Language breakdown and top contributor leaderboard

### 🔄 AI Sprint Retrospective
- Full sprint health score (0–100)
- What went well / needs improvement / blockers
- Auto-generated action items with priority and ownership
- Team morale signals from commit pattern analysis
- Strategic AI recommendations for next sprint

### 💬 CognOS Copilot
- Conversational AI grounded in your actual repo data
- Ask: *"Why did CI fail last week?"*, *"Who's been most active?"*, *"What PRs are risky?"*
- Context-aware: pulls live data from GitHub based on your question
- Full conversation history for multi-turn queries

---

## 🛠️ Microsoft AI Stack

| Component | Technology | Why |
|---|---|---|
| **AI Orchestration** | [Semantic Kernel](https://github.com/microsoft/semantic-kernel) (Microsoft) | Agent orchestration framework |
| **Language Model** | GPT-4o via OpenAI API | State-of-the-art code + language reasoning |
| **Code Intelligence** | [GitHub Copilot](https://github.com/features/copilot) | Used during development |
| **CI/CD Automation** | [GitHub Actions](https://github.com/features/actions) | Webhook triggers for auto-review |
| **Code Analysis** | [GitHub REST API](https://docs.github.com/en/rest) | Repository data access |
| **Frontend Design** | [Fluent UI](https://developer.microsoft.com/en-us/fluentui) (Microsoft design system) | UI components |
| **Deployment** | [GitHub Pages](https://pages.github.com/) | Frontend hosting |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CognOS Platform                      │
├─────────────────┬───────────────────┬───────────────────┤
│   React Frontend │   FastAPI Backend  │   GitHub Actions  │
│   (Dashboard)    │   (AI Engine)      │   (Auto Trigger)  │
├─────────────────┴───────────────────┴───────────────────┤
│                    Core AI Modules                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │PR Reviewer│ │CI Predict│ │Test Gen  │ │Retro Agent │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              CognOS Copilot (Chat AI)               │ │
│  └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│              GitHub API + GPT-4o + Semantic Kernel        │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- GitHub Personal Access Token ([get one here](https://github.com/settings/tokens))
- OpenAI API Key ([get one here](https://platform.openai.com/api-keys))

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/cognos.git
cd cognos
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file in `backend/`:
```env
GITHUB_TOKEN=ghp_your_github_token_here
OPENAI_API_KEY=sk-your_openai_key_here
GITHUB_REPO=username/repo-name
```

Start the backend:
```bash
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file in `frontend/`:
```env
REACT_APP_API_URL=http://localhost:8000
```

Start frontend:
```bash
npm start
```

Dashboard opens at: `http://localhost:3000`

### 4. GitHub Actions (Auto-review on PRs)
Add these secrets to your target repository:
- `COGNOS_API_URL` → your deployed backend URL

Copy `.github/workflows/cognos_pr.yml` to your target repo's `.github/workflows/` folder.

---

## 📁 Project Structure

```
cognos/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── pr_reviewer.py       # PR Intelligence module
│   ├── ci_predictor.py      # CI Failure Prediction
│   ├── test_generator.py    # Auto Test Generator
│   ├── retro_agent.py       # Sprint Retrospective AI
│   ├── repo_analyzer.py     # Repository Stats Engine
│   ├── copilot_chat.py      # CognOS Copilot Chat
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main app with routing
│   │   ├── pages/           # Dashboard, PRReview, CI, Tests, Retro, Chat
│   │   └── components/      # Sidebar, Header, Card components
│   └── package.json
├── .github/
│   └── workflows/
│       └── cognos_pr.yml    # Auto-review workflow
└── README.md
```

---

## 🤖 AI Tools Used

| Tool | Usage |
|---|---|
| **GitHub Copilot** | Used extensively during development for code completion and suggestions |
| **GPT-4o** | Core AI engine for all analysis, review, prediction, and chat features |
| **Semantic Kernel** | Microsoft's AI orchestration framework integrated into backend |

---

## 👥 Team

| Name | Role |
|---|---|
| [Your Name] | Full Stack + AI Integration |

---

## 📊 Evaluation Criteria Coverage

| Criteria | Weight | How CognOS Addresses It |
|---|---|---|
| AI Integration & Intelligence | 25% | GPT-4o powers 6 distinct AI features; Semantic Kernel orchestration |
| System Architecture & Engineering | 25% | FastAPI + React + GitHub API + Actions; modular, scalable design |
| Communication, Presentation & UX | 15% | Professional dark dashboard, intuitive flows, real-time feedback |
| Prototype Readiness & Scalability | 15% | Fully working end-to-end; GitHub Actions auto-scales |
| Problem Depth & Product Clarity | 10% | Solves real pain: $37B lost to unproductive dev workflows annually |
| Market Understanding & Product Fit | 10% | Every software team globally is the market; integrates into existing GitHub workflow |

---

## 📜 License

MIT License — see [LICENSE](LICENSE)

---

*Built with ❤️ for Microsoft Build AI Hackathon 2025*
