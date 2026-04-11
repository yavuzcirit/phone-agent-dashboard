"""Voice catalog API — list available voices and languages.

Endpoints:
  GET /api/voices            — full catalog with metadata
  GET /api/voices/{voice_id} — single voice details
  GET /api/languages         — distinct languages with voice counts
"""
from dataclasses import asdict

from fastapi import APIRouter, HTTPException

from app.services.voice_catalog import (
    VOICE_CATALOG,
    get_voice,
    list_languages,
)

router = APIRouter(prefix="/voices", tags=["voices"])


@router.get("")
async def list_voices(language: str | None = None):
    """Return all voices, optionally filtered by BCP-47 language code.

    Query params:
      language — e.g. ``en-US``, ``fr-FR`` (optional)
    """
    voices = VOICE_CATALOG
    if language:
        voices = [v for v in voices if v.language_code == language]
    return [asdict(v) for v in voices]


@router.get("/languages")
async def list_voice_languages():
    """Return the distinct languages available in the voice catalog."""
    return list_languages()


@router.get("/{voice_id}")
async def get_voice_detail(voice_id: str):
    """Return metadata for a single voice by its ID."""
    voice = get_voice(voice_id)
    if not voice:
        raise HTTPException(status_code=404, detail=f"Voice '{voice_id}' not found")
    return asdict(voice)
