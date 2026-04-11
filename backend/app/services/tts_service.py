"""Text-to-Speech service — self-hosted Piper TTS with lazy model download.

Provider hierarchy:
  1. PiperTTSProvider  — fully offline, zero cost (requires PIPER_MODELS_DIR)
  2. NullTTSProvider   — no-op fallback when Piper is not configured

Piper models are downloaded automatically on first use from:
  https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/

Each model consists of two files:
  <model_name>.onnx       — the ONNX neural network weights
  <model_name>.onnx.json  — voice configuration (sample rate, phonemes, etc.)

Usage:
    provider = get_tts_provider()
    wav_bytes = await provider.synthesize(text="Hello", voice_info=voice)
"""
import asyncio
import io
import logging
import urllib.request
import wave
from abc import ABC, abstractmethod
from pathlib import Path

from app.services.voice_catalog import VoiceInfo

logger = logging.getLogger(__name__)

# Piper model repository base URL (HuggingFace)
_HF_BASE = "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0"


def _model_url(model_name: str, ext: str) -> str:
    """Build HuggingFace download URL for a Piper model file.

    Model names encode the language prefix, e.g. "en_US-lessac-medium"
    → language folder "en/en_US", filename "en_US-lessac-medium.onnx".
    """
    lang_prefix = model_name.split("-")[0]          # "en_US"
    lang_dir = lang_prefix[:2] + "/" + lang_prefix  # "en/en_US"
    return f"{_HF_BASE}/{lang_dir}/{model_name}/{model_name}{ext}"


class TTSProvider(ABC):
    @abstractmethod
    async def synthesize(self, *, text: str, voice_info: VoiceInfo) -> bytes:
        """Return WAV audio bytes for the given text and voice."""
        ...

    @property
    @abstractmethod
    def is_available(self) -> bool: ...


class PiperTTSProvider(TTSProvider):
    """Fully offline TTS using the piper-tts Python package.

    Models are fetched from HuggingFace on first use and cached to disk
    at *models_dir*. Subsequent calls reuse the on-disk model — no network
    access after the initial download.

    Synthesized audio is returned as raw WAV bytes (PCM 16-bit mono).
    """

    def __init__(self, models_dir: str) -> None:
        self._models_dir = Path(models_dir)
        self._models_dir.mkdir(parents=True, exist_ok=True)
        self._voice_cache: dict[str, object] = {}   # model_name → PiperVoice

    @property
    def is_available(self) -> bool:
        return True

    async def synthesize(self, *, text: str, voice_info: VoiceInfo) -> bytes:
        model_name = voice_info.piper_voice
        loop = asyncio.get_event_loop()
        # Both download and synthesis are CPU/IO-bound — run in thread pool
        return await loop.run_in_executor(None, self._synthesize_sync, text, model_name)

    def _synthesize_sync(self, text: str, model_name: str) -> bytes:
        from piper.voice import PiperVoice  # lazy import — not needed at startup

        voice = self._load_voice(model_name)
        buf = io.BytesIO()
        with wave.open(buf, "wb") as wav_file:
            voice.synthesize(text, wav_file)
        return buf.getvalue()

    def _load_voice(self, model_name: str) -> object:
        if model_name not in self._voice_cache:
            from piper.voice import PiperVoice
            onnx_path = self._ensure_model(model_name)
            logger.info("Loading Piper voice: %s", model_name)
            self._voice_cache[model_name] = PiperVoice.load(str(onnx_path))
        return self._voice_cache[model_name]

    def _ensure_model(self, model_name: str) -> Path:
        """Download the .onnx and .onnx.json files if not already on disk."""
        onnx_path = self._models_dir / f"{model_name}.onnx"
        json_path = self._models_dir / f"{model_name}.onnx.json"

        if not onnx_path.exists():
            url = _model_url(model_name, ".onnx")
            logger.info("Downloading Piper model %s from %s", model_name, url)
            urllib.request.urlretrieve(url, onnx_path)
            logger.info("Saved %s (%.1f MB)", onnx_path.name, onnx_path.stat().st_size / 1e6)

        if not json_path.exists():
            url = _model_url(model_name, ".onnx.json")
            logger.info("Downloading Piper config %s", model_name)
            urllib.request.urlretrieve(url, json_path)

        return onnx_path


class NullTTSProvider(TTSProvider):
    """No-op provider — returns empty bytes and logs a warning.

    In-call audio is handled by Twilio's built-in Polly voices (TwiML <Say>),
    so this provider only affects the out-of-band audio preview endpoint.
    """

    @property
    def is_available(self) -> bool:
        return False

    async def synthesize(self, *, text: str, voice_info: VoiceInfo) -> bytes:
        logger.warning(
            "TTS not configured (PIPER_MODELS_DIR not set) — returning empty audio for voice %s",
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
        if settings.piper_models_dir:
            _provider = PiperTTSProvider(models_dir=settings.piper_models_dir)
            logger.info("TTS provider: Piper (models_dir=%s)", settings.piper_models_dir)
        else:
            _provider = NullTTSProvider()
            logger.warning("TTS provider: Null (set PIPER_MODELS_DIR to enable Piper TTS)")
    return _provider
