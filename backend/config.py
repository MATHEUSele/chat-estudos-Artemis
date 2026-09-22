from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Motor de IA — Ollama (rodando no host, acessível via host-gateway no Docker)
    OLLAMA_BASE_URL: str = "http://host.docker.internal:11434"
    OLLAMA_MODEL: str = "qwen2.5-coder:7b"

    # URL do frontend (CORS)
    FRONTEND_URL: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
