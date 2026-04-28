from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/projects", tags=["chat"])

class ChatRequest(BaseModel):
    message: str

@router.post("/{project_id}/chat")
async def chat_with_project(project_id: int, request: ChatRequest):
    try:
        # On importe l'AgentRunner ICI seulement au moment de l'appel
        # pour éviter l'erreur d'import circulaire au démarrage
        from backend.agent.runner import AgentRunner
        
        success = await AgentRunner.handle_chat_message(project_id, request.message)
        return {"success": success, "message": "Message reçu et traité par l'agent"}
    except Exception as e:
        # On affiche l'erreur exacte dans la console pour débugger
        print(f"Erreur Chatbot: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
