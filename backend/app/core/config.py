from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    luron_api_key: str
    luron_base_url: str = "https://luron-backend.onrender.com/api/v1"

    database_url: str = "sqlite+aiosqlite:///./data/callbank.db"
    chroma_persist_dir: str = "./data/chroma"

    openai_api_key: str = ""

    cors_origins: list[str] = ["http://localhost:3000", "http://frontend:3000"]

    log_level: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    return Settings()
