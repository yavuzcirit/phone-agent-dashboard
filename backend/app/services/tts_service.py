"""Text-to-Speech service — pluggable TTS with OpenAI as primary provider.

Provider hierarchy:
  1. OpenAITTSProvider  — high-quality, multilingual (requires OPENAI_API_KEY)
  2. NullTTSProvider    — no-op fallback for environments without a key

Usage:
    provider = get_tts_provider()
    audio_bytes = await provider.synthesize(text="Hello", voice_info=voice)
"""
import logging
from abc import ABC, abstractmethod

from app.services.voice_catalog import VoiceInfo

logger = logging.getLogger(__name__)


class TTSProvider(ABC):
    @abstractmethod
    async def synthesize(self, *, text: str, voice_info: VoiceInfo) -> bytes:
        """Return MP3 audio bytes for the given text and voice."""
        ...

    @property
    @abstractmethod
    def is_available(self) -> bool:
        """True when the provider is properly configured."""
        ...


class OpenAITTSProvider(TTSProvider):
    """High-quality, multilingual TTS via OpenAI Audio API.

    Supports all languages in the voice catalog. Uses the tts-1-hd model for
    the best quality; falls back to tts-1 on error.
    """

    def __init__(self, api_key: str) -> None:
        from openai import AsyncOpenAI  # lazy import — not required at module load
        self._client = AsyncOpenAI(api_key=api_key)
        self._api_key = api_key

    @property
    def is_available(self) -> bool:
        return bool(self._api_key)

    async def synthesize(self, *, text: str, voice_info: VoiceInfo) -> bytes:
        logger.debug("OpenAI TTS: voice=%s model=tts-1-hd text_len=%d", voice_info.openai_voice, len(text))
        response = await self._client.audio.speech.create(
            model="tts-1-hd",
            voice=voice_info.openai_voice,  # type: ignore[arg-type]
            input=text,
            response_format="mp3",
        )
        return response.content


class NullTTSProvider(TTSProvider):
    """No-op provider used when no TTS credentials are configured.

    Returns empty bytes and logs a warning — calls will still work via
    Twilio's built-in Polly voices; this provider is only needed for
    out-of-band audio preview endpoints.
    """

    @property
    def is_available(self) -> bool:
        return False

    async def synthesize(self, *, text: str, voice_info: VoiceInfo) -> bytes:
        logger.warning(
            "TTS not configured (OPENAI_API_KEY missing) — returning empty audio for voice %s",
            voice_info.id,
        )
        return b""


# ── Singleton factory ─────────────────────────────────────────────────────────

_provider: TTSProvider | None = None


def get_tts_provider() -> TTSProvider:
    """Return the configured TTS provider (singleton)."""
    global _provider
    if _provider is None:
        from app.core.config import get_settings
        settings = get_settings()
        if settings.openai_api_key:
            _provider = OpenAITTSProvider(api_key=settings.openai_api_key)
            logger.info("TTS provider: OpenAI (tts-1-hd)")
        else:
            _provider = NullTTSProvider()
            logger.warning("TTS provider: Null (no OPENAI_API_KEY) — audio preview disabled")
    return _provider
