# app/settings.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str | None = None

    class Config:
        env_file = ".env"
        env_prefix = ""  # or "APP_"

_settings: Settings | None = None

def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()  # loads from env/.env
    return _settings
