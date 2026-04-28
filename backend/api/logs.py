"""
API Routes — Gestion des logs et streaming SSE (logs, liste projets, statut projet).
"""

import asyncio
import json
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from backend.db.database import get_logs, get_logs_after
from backend.core.project_manager import project_manager

router = APIRouter(prefix="/projects", tags=["logs"])


# ─── Logs ────────────────────────────────────────────────────────────────

@router.get("/{project_id}/logs")
async def get_project_logs(project_id: int, limit: int = 100, offset: int = 0):
    """Récupérer les logs d'un projet (mode classique)."""
    project = await project_manager.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé.")

    logs = await get_logs(project_id, limit=limit, offset=offset)
    return {"logs": logs}


@router.get("/{project_id}/logs/stream")
async def stream_project_logs(project_id: int, request: Request):
    """Streamer les logs d'un projet en SSE."""
    project = await project_manager.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé.")

    async def event_generator():
        last_id = 0

        # Envoyer les logs existants d'abord
        existing_logs = await get_logs(project_id, limit=200)
        existing_logs.reverse()  # ordre chronologique
        for log in existing_logs:
            log_data = json.dumps(log, ensure_ascii=False)
            yield f"data: {log_data}\n\n"
            last_id = max(last_id, log.get("id", 0))

        # Puis streamer les nouveaux logs
        while True:
            if await request.is_disconnected():
                break

            new_logs = await get_logs_after(project_id, last_id)
            for log in new_logs:
                log_data = json.dumps(log, ensure_ascii=False)
                yield f"data: {log_data}\n\n"
                last_id = max(last_id, log.get("id", 0))

            project = await project_manager.get(project_id)
            if project and project.get("status") in ("done", "error"):
                if not new_logs:
                    # On attend un peu pour être sûr qu'aucun log tardif n'arrive
                    await asyncio.sleep(2.0)
                    new_logs_final = await get_logs_after(project_id, last_id)
                    if not new_logs_final:
                        end_event = json.dumps(
                            {"type": "end", "status": project.get("status"), "message": "Streaming terminé."},
                            ensure_ascii=False,
                        )
                        yield f"event: end\ndata: {end_event}\n\n"
                        break

            await asyncio.sleep(0.5)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        },
    )


# ─── SSE liste de tous les projets ───────────────────────────────────────

@router.get("/stream")
async def stream_all_projects(request: Request):
    """
    Streamer la liste de TOUS les projets en SSE.
    Émet uniquement quand quelque chose change (création, suppression,
    changement de statut/progression).
    """
    async def event_generator():
        last_snapshot = None

        # Premier envoi immédiat
        projects = await project_manager.list_all()
        last_snapshot = json.dumps(
            [(p.get("id"), p.get("status"), p.get("progress"),
              p.get("name"), p.get("updated_at")) for p in projects],
            ensure_ascii=False,
            sort_keys=True,
        )
        yield f"data: {json.dumps(projects, ensure_ascii=False)}\n\n"

        while True:
            if await request.is_disconnected():
                break

            projects = await project_manager.list_all()
            snapshot = json.dumps(
                [(p.get("id"), p.get("status"), p.get("progress"),
                  p.get("name"), p.get("updated_at")) for p in projects],
                ensure_ascii=False,
                sort_keys=True,
            )
            if snapshot != last_snapshot:
                last_snapshot = snapshot
                yield f"data: {json.dumps(projects, ensure_ascii=False)}\n\n"

            await asyncio.sleep(0.5)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        },
    )


# ─── SSE statut d'UN projet ──────────────────────────────────────────────

@router.get("/{project_id}/stream")
async def stream_project_status(project_id: int, request: Request):
    """
    Streamer le statut/progression d'UN projet en SSE.
    Émet uniquement quand quelque chose change.
    """
    project = await project_manager.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé.")

    async def event_generator():
        last_snapshot = None

        # Premier envoi immédiat
        proj = await project_manager.get(project_id)
        if proj:
            last_snapshot = json.dumps(
                (proj.get("status"), proj.get("progress"),
                 proj.get("name"), proj.get("updated_at")),
                ensure_ascii=False,
            )
            yield f"data: {json.dumps(proj, ensure_ascii=False)}\n\n"

        while True:
            if await request.is_disconnected():
                break

            proj = await project_manager.get(project_id)
            if not proj:
                break

            snapshot = json.dumps(
                (proj.get("status"), proj.get("progress"),
                 proj.get("name"), proj.get("updated_at")),
                ensure_ascii=False,
            )
            if snapshot != last_snapshot:
                last_snapshot = snapshot
                yield f"data: {json.dumps(proj, ensure_ascii=False)}\n\n"

            await asyncio.sleep(0.5)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        },
    )
