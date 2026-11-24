import asyncio
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import main  # noqa: E402
from config import Settings  # noqa: E402


@pytest.fixture()
def security_client(monkeypatch, tmp_path):
    db_file = tmp_path / "test_security.db"
    test_engine = create_async_engine(
        f"sqlite+aiosqlite:///{db_file}",
        connect_args={"check_same_thread": False},
    )
    monkeypatch.setattr(main, "engine", test_engine)
    main.limiter.reset()

    with TestClient(main.app) as client:
        yield client

    main.limiter.reset()
    asyncio.run(test_engine.dispose())


def test_cors_origins_parsing_from_settings():
    cfg = Settings(
        FRONTEND_URLS="https://a.com, https://b.com",
        FRONTEND_URL="https://a.com",
    )
    assert cfg.cors_origins == ["https://a.com", "https://b.com"]


def test_cors_allows_configured_origin(security_client):
    response = security_client.get(
        "/health",
        headers={"Origin": "http://localhost:5173"},
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_cors_blocks_unconfigured_origin(security_client):
    response = security_client.get(
        "/health",
        headers={"Origin": "https://malicious.example.com"},
    )
    assert response.status_code == 200
    assert "access-control-allow-origin" not in response.headers


def test_health_includes_rate_limit_headers(security_client):
    response = security_client.get("/health")
    assert response.status_code == 200
    lower_headers = {k.lower(): v for k, v in response.headers.items()}
    assert "x-ratelimit-limit" in lower_headers
    assert "x-ratelimit-remaining" in lower_headers


def test_health_enforces_configurable_rate_limit(monkeypatch, security_client):
    monkeypatch.setattr(main.settings, "RATE_LIMIT", "2/minute")
    main.limiter.reset()

    first = security_client.get("/health")
    second = security_client.get("/health")
    third = security_client.get("/health")

    assert first.status_code == 200
    assert second.status_code == 200
    assert third.status_code == 429
