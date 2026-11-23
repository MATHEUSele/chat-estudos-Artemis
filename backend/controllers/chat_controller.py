import json
import logging
from fastapi import APIRouter, Query, Request
from fastapi.responses import StreamingResponse
from database import AsyncSessionLocal
from models.ollama_agent import stream_chat_response
from models.session_model import Message
from schemas.chat_schema import ChatMessageRequest

router = APIRouter()
logger = logging.getLogger(__name__)


def _format_sse(payload: str) -> str:
    return f"data: {payload}\n\n"


async def _persist_message(session_id: int, role: str, content: str) -> None:
    async with AsyncSessionLocal() as db:
        db.add(Message(role=role, content=content, session_id=session_id))
        await db.commit()


def _build_sse_response(
    user_message: str, session_id: int, request: Request
) -> StreamingResponse:
    async def event_generator():
        client_disconnected = False
        full_ai_response = ""
        ai_persisted = False

        try:
            await _persist_message(session_id=session_id, role="user", content=user_message)

            async for chunk in stream_chat_response(user_message):
                if await request.is_disconnected():
                    client_disconnected = True
                    logger.info("Cliente desconectou durante o stream SSE.")
                    break

                try:
                    data = json.loads(chunk)
                except json.JSONDecodeError:
                    yield _format_sse(chunk)
                    continue

                event_type = data.get("type")
                if event_type == "text_chunk":
                    full_ai_response += data.get("content", "")
                elif event_type == "end" and full_ai_response and not ai_persisted:
                    await _persist_message(
                        session_id=session_id, role="model", content=full_ai_response
                    )
                    ai_persisted = True

                yield _format_sse(chunk)

            if full_ai_response and not ai_persisted and not client_disconnected:
                await _persist_message(
                    session_id=session_id, role="model", content=full_ai_response
                )

            if not client_disconnected:
                yield _format_sse("[DONE]")
        except Exception as exc:
            logger.error(f"Erro no stream SSE: {exc}")
            yield _format_sse(json.dumps({"type": "error", "content": f"Erro no stream: {exc}"}))
            yield _format_sse("[DONE]")

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/api/chat/stream")
async def stream_chat_get(
    request: Request,
    message: str = Query(..., min_length=1),
    session_id: int = Query(default=1, ge=1),
):
    return _build_sse_response(user_message=message, session_id=session_id, request=request)


@router.post("/api/chat/stream")
async def stream_chat_post(request: Request, payload: ChatMessageRequest):
    return _build_sse_response(
        user_message=payload.message, session_id=payload.session_id, request=request
    )
