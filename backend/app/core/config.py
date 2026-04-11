from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # ── Ollama (self-hosted LLM) ───────────────────────────────────────────────
    # Required for the live call conversation engine.
    # Run locally:  ollama serve
    # Pull model:   ollama pull llama3.2:3b
    # In Docker:    set to http://ollama:11434
    ollama_api_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2:3b"

    # ── Piper TTS (self-hosted, offline) ──────────────────────────────────────
    # Directory where Piper ONNX model files are stored.
    # Models are downloaded automatically on first use from HuggingFace.
    # Leave empty to disable audio preview (in-call audio still works via Twilio Polly).
    piper_models_dir: str = "./data/piper_models"

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
