import asyncio
import json
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import main  # noqa: E402
from controllers import chat_controller  # noqa: E402
from database import Base  # noqa: E402
from models.session_model import Message  # noqa: E402


def _parse_sse_events(body_text: str) -> list[str]:
    return [
        line.removeprefix("data: ")
        for line in body_text.splitlines()
        if line.startswith("data: ")
    ]


@pytest.fixture()
def test_client(monkeypatch, tmp_path):
    db_file = tmp_path / "test_artemis.db"
    test_engine = create_async_engine(
        f"sqlite+aiosqlite:///{db_file}",
        connect_args={"check_same_thread": False},
    )
    test_session_local = async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async def _init_db():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    asyncio.run(_init_db())
    monkeypatch.setattr(chat_controller, "AsyncSessionLocal", test_session_local)
    monkeypatch.setattr(main, "engine", test_engine)

    with TestClient(main.app) as client:
        yield client, test_session_local

    asyncio.run(test_engine.dispose())


def _fetch_messages(session_factory, session_id: int) -> list[Message]:
    async def _query():
        async with session_factory() as db:
            result = await db.execute(
                select(Message)
                .where(Message.session_id == session_id)
                .order_by(Message.id)
            )
            return list(result.scalars().all())

    return asyncio.run(_query())


def test_get_chat_stream_sse_tokens_and_persistence(monkeypatch, test_client):
    client, session_factory = test_client

    async def fake_stream(
        prompt: str, interaction_id: str | None = None, model: str | None = None
    ):
        assert prompt == "Oi"
        assert model is None
        yield json.dumps({"type": "text_chunk", "content": "Olá"})
        yield json.dumps({"type": "text_chunk", "content": " Artemis!"})
        yield json.dumps({"type": "end", "content": ""})

    monkeypatch.setattr(chat_controller, "stream_chat_response", fake_stream)

    response = client.get("/api/chat/stream", params={"message": "Oi", "session_id": 1})

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    assert response.headers["cache-control"] == "no-cache"
    assert response.headers["x-accel-buffering"] == "no"

    events = _parse_sse_events(response.text)
    assert events[-1] == "[DONE]"
    parsed = [json.loads(e) for e in events[:-1]]
    assert parsed == [
        {"type": "text_chunk", "content": "Olá"},
        {"type": "text_chunk", "content": " Artemis!"},
        {"type": "end", "content": ""},
    ]

    saved = _fetch_messages(session_factory, session_id=1)
    assert [(m.role, m.content) for m in saved] == [
        ("user", "Oi"),
        ("model", "Olá Artemis!"),
    ]


def test_post_chat_stream_sse_tokens_and_persistence(monkeypatch, test_client):
    client, session_factory = test_client

    async def fake_stream(
        prompt: str, interaction_id: str | None = None, model: str | None = None
    ):
        assert prompt == "Teste POST"
        assert model is None
        yield json.dumps({"type": "text_chunk", "content": "Resposta "})
        yield json.dumps({"type": "text_chunk", "content": "SSE"})
        yield json.dumps({"type": "end", "content": ""})

    monkeypatch.setattr(chat_controller, "stream_chat_response", fake_stream)

    response = client.post(
        "/api/chat/stream",
        json={"message": "Teste POST", "session_id": 2},
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")

    events = _parse_sse_events(response.text)
    assert events[-1] == "[DONE]"
    parsed = [json.loads(e) for e in events[:-1]]
    assert parsed == [
        {"type": "text_chunk", "content": "Resposta "},
        {"type": "text_chunk", "content": "SSE"},
        {"type": "end", "content": ""},
    ]

    saved = _fetch_messages(session_factory, session_id=2)
    assert [(m.role, m.content) for m in saved] == [
        ("user", "Teste POST"),
        ("model", "Resposta SSE"),
    ]


def test_get_chat_stream_rejects_empty_message(test_client):
    client, _ = test_client
    response = client.get("/api/chat/stream", params={"message": ""})
    assert response.status_code == 422


def test_get_chat_stream_rejects_whitespace_message(test_client):
    client, _ = test_client
    response = client.get("/api/chat/stream", params={"message": "   "})
    assert response.status_code == 422


def test_post_chat_stream_with_messages_list_and_model_override(monkeypatch, test_client):
    client, session_factory = test_client
    captured = {}

    async def fake_stream(
        prompt: str, interaction_id: str | None = None, model: str | None = None
    ):
        captured["prompt"] = prompt
        captured["model"] = model
        yield json.dumps({"type": "text_chunk", "content": "Ok lista"})
        yield json.dumps({"type": "end", "content": ""})

    monkeypatch.setattr(chat_controller, "stream_chat_response", fake_stream)

    response = client.post(
        "/api/chat/stream",
        json={
            "messages": [{"role": "user", "content": "Olá via lista"}],
            "session_id": 4,
            "model": "qwen2.5:0.5b",
        },
    )

    assert response.status_code == 200
    assert captured == {"prompt": "Olá via lista", "model": "qwen2.5:0.5b"}

    events = _parse_sse_events(response.text)
    assert events[-1] == "[DONE]"
    parsed = [json.loads(e) for e in events[:-1]]
    assert parsed == [
        {"type": "text_chunk", "content": "Ok lista"},
        {"type": "end", "content": ""},
    ]

    saved = _fetch_messages(session_factory, session_id=4)
    assert [(m.role, m.content) for m in saved] == [
        ("user", "Olá via lista"),
        ("model", "Ok lista"),
    ]


@pytest.mark.parametrize(
    "invalid_payload",
    [
        {},
        {"message": "   "},
        {"messages": [{"role": "invalid_role", "content": "oi"}]},
        {"message": "oi", "session_id": 0},
    ],
)
def test_post_chat_stream_payload_validation(test_client, invalid_payload):
    client, _ = test_client
    response = client.post("/api/chat/stream", json=invalid_payload)
    assert response.status_code == 422


def test_chat_stream_propagates_error_event(monkeypatch, test_client):
    client, session_factory = test_client

    async def fake_stream(
        prompt: str, interaction_id: str | None = None, model: str | None = None
    ):
        yield json.dumps({"type": "error", "content": "Ollama offline"})
        yield json.dumps({"type": "end", "content": ""})

    monkeypatch.setattr(chat_controller, "stream_chat_response", fake_stream)

    response = client.get("/api/chat/stream", params={"message": "Falha", "session_id": 3})
    assert response.status_code == 200

    events = _parse_sse_events(response.text)
    assert events[-1] == "[DONE]"
    parsed = [json.loads(e) for e in events[:-1]]
    assert parsed == [
        {"type": "error", "content": "Ollama offline"},
        {"type": "end", "content": ""},
    ]

    saved = _fetch_messages(session_factory, session_id=3)
    assert [(m.role, m.content) for m in saved] == [("user", "Falha")]


def test_openapi_schema_exposes_chat_models(test_client):
    client, _ = test_client
    response = client.get("/openapi.json")
    assert response.status_code == 200

    schema = response.json()
    stream_path = schema["paths"]["/api/chat/stream"]
    assert "get" in stream_path
    assert "post" in stream_path
    assert "text/event-stream" in stream_path["get"]["responses"]["200"]["content"]
    assert "text/event-stream" in stream_path["post"]["responses"]["200"]["content"]

    components = schema["components"]["schemas"]
    assert "ChatRequest" in components
    assert "ChatMessage" in components
    assert {"session_id", "model", "message", "messages"}.issubset(
        components["ChatRequest"]["properties"].keys()
    )
    assert {"role", "content"}.issubset(components["ChatMessage"]["properties"].keys())


def test_legacy_websocket_route_removed():
    route_paths = [getattr(route, "path", None) for route in main.app.routes]
    assert "/ws/chat" not in route_paths
