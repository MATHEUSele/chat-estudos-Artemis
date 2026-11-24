from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Motor de IA — Ollama (rodando no host Windows ou container)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5:0.5b"

    # URLs do frontend permitidas para CORS
    FRONTEND_URL: str = "http://localhost:5173"
    FRONTEND_URLS: str = "http://localhost:5173,http://localhost,https://matheusele.github.io"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origins(self) -> list[str]:
        origins = [item.strip() for item in self.FRONTEND_URLS.split(",") if item.strip()]
        primary = self.FRONTEND_URL.strip()
        if primary and primary not in origins:
            origins.insert(0, primary)
        return origins


settings = Settings()
