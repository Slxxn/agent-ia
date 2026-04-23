from fastapi import FastAPI
from pydantic import BaseModel
import requests

app = FastAPI()

OLLAMA_URL = "https://crafty-vividness-chemist.ngrok-free.dev/api/generate"


class AskRequest(BaseModel):
    prompt: str


@app.get("/")
def root():
    return {"status": "ok", "message": "API running"}


@app.post("/ask")
def ask(req: AskRequest):
    try:
        r = requests.post(
            OLLAMA_URL,
            json={
                "model": "llama3:8b",
                "prompt": req.prompt,
                "stream": False
            },
            timeout=120
        )

        # debug brut si problème
        try:
            return r.json()
        except Exception:
            return {
                "error": "Invalid JSON from Ollama",
                "status_code": r.status_code,
                "raw_response": r.text
            }

    except Exception as e:
        return {
            "error": "Request failed",
            "details": str(e)
        }
    try:
        r = requests.post(
            OLLAMA_URL,
            json={
                "model": "llama3:8b",
                "prompt": req.prompt,
                "stream": False
            },
            timeout=120
        )

        return r.json()

    except Exception as e:
        return {
            "error": "Request failed",
            "details": str(e)
        }