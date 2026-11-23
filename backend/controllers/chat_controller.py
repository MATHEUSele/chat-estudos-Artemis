import json
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import ValidationError
from database import AsyncSessionLocal
from models.ollama_agent import stream_chat_response
from models.session_model import Message
from schemas.chat_schema import ChatMessage, ChatRequest, ChatStreamEvent

router = APIRouter()
logger = logging.getLogger(__name__)

SSE_OPENAPI_RESPONSE = {
    200: {
        "description": "Stream SSE de eventos de chat",
        "content": {
            "text/event-stream": {
                "schema": ChatStreamEvent.model_json_schema(),
            }
        },
    }
}


def _format_sse(payload: str) -> str:
    return f"data: {payload}\n\n"


async def _persist_message(session_id: int, message: ChatMessage) -> None:
    async with AsyncSessionLocal() as db:
        db.add(Message(role=message.role, content=message.content, session_id=session_id))
        await db.commit()


def _build_sse_response(chat_request: ChatRequest, request: Request) -> StreamingResponse:
    async def event_generator():
        client_disconnected = False
        full_ai_response = ""
        ai_persisted = False

        try:
            user_msg = chat_request.latest_user_message
            await _persist_message(
                session_id=chat_request.session_id,
                message=ChatMessage(role="user", content=user_msg.content),
            )

            async for chunk in stream_chat_response(
                user_msg.content, model=chat_request.model
            ):
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
                        session_id=chat_request.session_id,
                        message=ChatMessage(role="model", content=full_ai_response),
                    )
                    ai_persisted = True

                yield _format_sse(chunk)

            if full_ai_response and not ai_persisted and not client_disconnected:
                await _persist_message(
                    session_id=chat_request.session_id,
                    message=ChatMessage(role="model", content=full_ai_response),
                )

            if not client_disconnected:
                yield _format_sse("[DONE]")
        except Exception as exc:
            logger.error(f"Erro no stream SSE: {exc}")
            yield ChatStreamEvent(
                type="error", content=f"Erro no stream: {exc}"
            ).to_sse()
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


@router.get(
    "/api/chat/stream",
    tags=["Chat"],
    summary="Stream de chat via SSE (EventSource)",
    description="Recebe a mensagem via query params e retorna tokens em tempo real via Server-Sent Events.",
    responses=SSE_OPENAPI_RESPONSE,
)
async def stream_chat_get(
    request: Request,
    message: str = Query(..., min_length=1, description="Mensagem do usuário"),
    session_id: int = Query(default=1, ge=1, description="ID da sessão"),
    model: Optional[str] = Query(
        default=None, min_length=1, description="Modelo Ollama opcional"
    ),
):
    try:
        chat_request = ChatRequest(
            message=message,
            session_id=session_id,
            model=model,
        )
    except ValidationError as exc:
        raise HTTPException(
            status_code=422, detail=exc.errors(include_context=False)
        ) from exc

    return _build_sse_response(chat_request=chat_request, request=request)


@router.post(
    "/api/chat/stream",
    tags=["Chat"],
    summary="Stream de chat via SSE (POST)",
    description="Recebe um ChatRequest validado e retorna tokens em tempo real via Server-Sent Events.",
    responses=SSE_OPENAPI_RESPONSE,
)
async def stream_chat_post(request: Request, payload: ChatRequest):
    return _build_sse_response(chat_request=payload, request=request)
