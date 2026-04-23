from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os

app = FastAPI()

OLLAMA_URL = "https://crafty-vividness-chemist.ngrok-free.dev/api/generate"


class AskRequest(BaseModel):
    prompt: str


@app.get("/")
def root():
    return {"status": "ok", "message": "API running"}


@app.get("/ask")
def ask_debug():
    return {"message": "Use POST with JSON"}


@app.post("/ask")
def ask(req: AskRequest):
    r = requests.post(
        OLLAMA_URL,
        json={
            "model": "llama3:8b",
            "prompt": req.prompt,
            "stream": False
        },
        timeout=120
    )

    try:
        return r.json()
    except Exception:
        return {
            "error": "Invalid response from Ollama",
            "raw": r.text
        }