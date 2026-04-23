from fastapi import FastAPI
import requests

app = FastAPI()

OLLAMA_URL = "http://host.docker.internal:11434/api/generate"

@app.post("/ask")
def ask(prompt: str):
    r = requests.post(OLLAMA_URL, json={
        "model": "llama3",
        "prompt": prompt,
        "stream": False
    })

    return r.json()