from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import calls, call_webhooks, integrations, knowledge_base, mock_data, voices
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.db.session import init_db

configure_logging()
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Path("./data").mkdir(parents=True, exist_ok=True)
    await init_db()
    yield


app = FastAPI(
    title="CallBank API",
    description=(
        "Voice AI integration suite for Call Bank — "
        "self-hosted voice engine with 35+ voices across 18 languages, "
        "powered by OpenAI TTS and Twilio telephony."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(calls.router, prefix="/api")
app.include_router(call_webhooks.router, prefix="/api")
app.include_router(voices.router, prefix="/api")
app.include_router(mock_data.router, prefix="/api")
app.include_router(knowledge_base.router, prefix="/api")
app.include_router(integrations.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}
