from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os

app = FastAPI()

OLLAMA_URL = "https://crafty-vividness-chemist.ngrok-free.dev/api/generate"

class AskRequest(BaseModel):
    prompt: str

@app.post("/ask")
def ask(req: AskRequest):
    r = requests.post(OLLAMA_URL, json={
        "model": "llama3",
        "prompt": req.prompt,
        "stream": False
    })

    return r.json()