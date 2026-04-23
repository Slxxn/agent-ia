from fastapi import FastAPI
import requests

app = FastAPI()

OLLAMA_URL = "https://crafty-vividness-chemist.ngrok-free.dev/api/generate"

@app.post("/ask")
def ask(prompt: str):
    r = requests.post(OLLAMA_URL, json={
        "model": "llama3",
        "prompt": prompt,
        "stream": False
    })

    return r.json()