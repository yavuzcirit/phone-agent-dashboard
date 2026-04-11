"""Conversation engine — AI response generation via self-hosted Ollama.

Uses the Ollama REST API (http://localhost:11434 by default) with the
OpenAI-compatible /api/chat endpoint. Default model: llama3.2:3b
(~2 GB RAM, fast inference, good quality for phone call responses).

To pull the model into Ollama before first use:
    ollama pull llama3.2:3b

Conversation history is passed in by the caller (stored per-call in DB).
"""
import logging
from typing import TypedDict

import httpx

logger = logging.getLogger(__name__)

_MAX_TOKENS = 200   # keep responses short for phone delivery
_PHONE_SYSTEM_SUFFIX = (
    "\n\n[Call guidelines] Keep all responses under 3 sentences. "
    "Speak naturally as you would on a phone call — no markdown, no lists, no code. "
    "If you cannot help, politely offer to transfer to a human agent."
)


class Turn(TypedDict):
    role: str      # "user" | "assistant"
    content: str


class OllamaConversationEngine:
    """Sends chat turns to a local Ollama server and returns the response text."""

    def __init__(self, base_url: str, model: str) -> None:
        self._client = httpx.AsyncClient(
            base_url=base_url.rstrip("/"),
            timeout=httpx.Timeout(connect=5.0, read=30.0, write=10.0, pool=5.0),
        )
        self._model = model
        logger.info("Conversation engine: Ollama model=%s url=%s", model, base_url)

    async def respond(
        self,
        *,
        system_prompt: str,
        history: list[Turn],
        user_message: str,
    ) -> str:
        """Generate the next assistant turn.

        Args:
            system_prompt: Enriched system prompt for this call.
            history:       Previous turns in OpenAI message format.
            user_message:  Latest transcribed user speech.

        Returns:
            Plain-text assistant response ready for TTS synthesis.
        """
        messages: list[dict] = [
            {"role": "system", "content": system_prompt + _PHONE_SYSTEM_SUFFIX},
        ]
        messages.extend(history)
        messages.append({"role": "user", "content": user_message})

        logger.debug(
            "Ollama request: model=%s history_turns=%d user_len=%d",
            self._model, len(history), len(user_message),
        )

        response = await self._client.post(
            "/api/chat",
            json={
                "model": self._model,
                "messages": messages,
                "stream": False,
                "options": {
                    "num_predict": _MAX_TOKENS,
                    "temperature": 0.6,
                    "stop": ["\n\n", "###"],
                },
            },
        )
        response.raise_for_status()
        text = response.json()["message"]["content"].strip()

        if not text:
            text = "I'm sorry, I didn't understand that. Could you please repeat?"
        return text

    async def aclose(self) -> None:
        await self._client.aclose()


# ── Singleton factory ─────────────────────────────────────────────────────────

_engine: OllamaConversationEngine | None = None


def get_conversation_engine() -> OllamaConversationEngine | None:
    """Return the configured Ollama engine, or None if not configured."""
    global _engine
    if _engine is None:
        from app.core.config import get_settings
        settings = get_settings()
        if settings.ollama_api_url:
            _engine = OllamaConversationEngine(
                base_url=settings.ollama_api_url,
                model=settings.ollama_model,
            )
        else:
            logger.warning("Conversation engine disabled (OLLAMA_API_URL not set)")
    return _engine
