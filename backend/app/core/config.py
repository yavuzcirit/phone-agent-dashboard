from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # ── OpenAI ────────────────────────────────────────────────────────────────
    # Required for TTS audio preview and AI conversation engine.
    # When absent, Twilio's built-in Polly TTS is used for in-call audio only.
    openai_api_key: str = ""

    # ── Twilio ────────────────────────────────────────────────────────────────
    # Required for real outbound calls.
    # When absent, calls are simulated (no actual dial-out).
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""   # E.164 e.g. +14155552671

    # ── Server ────────────────────────────────────────────────────────────────
    # Public base URL used to build Twilio webhook URLs.
    # In dev: use ngrok → e.g. https://abc123.ngrok-free.app
    # In prod: set to your domain e.g. https://api.callbank.io
    server_base_url: str = "http://localhost:8000"

    # ── Database ──────────────────────────────────────────────────────────────
    database_url: str = "sqlite+aiosqlite:///./data/callbank.db"
    chroma_persist_dir: str = "./data/chroma"

    # ── CORS ──────────────────────────────────────────────────────────────────
    cors_origins: list[str] = ["http://localhost:3000", "http://frontend:3000"]

    # ── Logging ───────────────────────────────────────────────────────────────
    log_level: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    return Settings()
