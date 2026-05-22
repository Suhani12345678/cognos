from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

from pr_reviewer import review_pull_request
from ci_predictor import predict_ci_failure
from test_generator import generate_tests
from retro_agent import generate_retrospective
from repo_analyzer import get_repo_stats
from copilot_chat import ask_cognos

app = FastAPI(title="CognOS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────
class PRRequest(BaseModel):
    repo_name: str
    pr_number: int

class CIRequest(BaseModel):
    repo_name: str
    branch: str = "main"

class TestRequest(BaseModel):
    repo_name: str
    pr_number: int

class ChatRequest(BaseModel):
    repo_name: str
    question: str
    history: Optional[list] = []

class RetroRequest(BaseModel):
    repo_name: str
    days: int = 7

# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "CognOS is alive 🚀", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/review-pr")
def review_pr(request: PRRequest):
    try:
        result = review_pull_request(request.repo_name, request.pr_number)
        return {"status": "success", "review": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-ci")
def predict_ci(request: CIRequest):
    try:
        result = predict_ci_failure(request.repo_name, request.branch)
        return {"status": "success", "prediction": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-tests")
def gen_tests(request: TestRequest):
    try:
        result = generate_tests(request.repo_name, request.pr_number)
        return {"status": "success", "tests": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/retrospective")
def retro(request: RetroRequest):
    try:
        result = generate_retrospective(request.repo_name, request.days)
        return {"status": "success", "retrospective": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/repo-stats")
def repo_stats(repo_name: str):
    try:
        result = get_repo_stats(repo_name)
        return {"status": "success", "stats": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
def chat(request: ChatRequest):
    try:
        result = ask_cognos(request.repo_name, request.question, request.history)
        return {"status": "success", "answer": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
