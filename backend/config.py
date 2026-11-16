from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Motor de IA — Ollama (rodando no host Windows)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5-coder:1.5b"

    # URL do frontend (CORS)
    FRONTEND_URL: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
