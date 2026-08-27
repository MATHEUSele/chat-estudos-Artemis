from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    FRONTEND_URL: str = "http://localhost:5173" # Vite default
    
    # Proteção de ambiente
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

# Instanciação global e segura
# Se a GEMINI_API_KEY não estiver no .env, o servidor quebrará aqui com um erro claro.
settings = Settings()
