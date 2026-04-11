"""Conversation engine — AI response generation for live voice calls.

Uses OpenAI chat completions (gpt-4o-mini) to produce concise, natural
responses suitable for TTS synthesis during a phone call.

Conversation history is passed in by the caller (stored per-call in DB).
"""
import logging
from typing import TypedDict

logger = logging.getLogger(__name__)

# Responses must be short enough to synthesize quickly over the phone
_MAX_TOKENS = 200
_MODEL = "gpt-4o-mini"

# Injected into every call to keep responses phone-appropriate
_PHONE_SYSTEM_SUFFIX = (
    "\n\n[Call guidelines] Keep all responses under 3 sentences. "
    "Speak naturally as you would on a phone call — no markdown, no lists, no code. "
    "If you cannot help, politely offer to transfer to a human agent."
)


class Turn(TypedDict):
    role: str    # "user" | "assistant"
    content: str


class ConversationEngine:
    def __init__(self, api_key: str) -> None:
        from openai import AsyncOpenAI  # lazy import
        self._client = AsyncOpenAI(api_key=api_key)

    async def respond(
        self,
        *,
        system_prompt: str,
        history: list[Turn],
        user_message: str,
    ) -> str:
        """Generate the next assistant turn.

        Args:
            system_prompt: The enriched system prompt for this call.
            history:       Previous turns [[role, content], …].
            user_message:  The latest transcribed user speech.

        Returns:
            The assistant's response as a plain string ready for TTS.
        """
        messages: list[dict] = [
            {"role": "system", "content": system_prompt + _PHONE_SYSTEM_SUFFIX},
        ]
        messages.extend(history)
        messages.append({"role": "user", "content": user_message})

        logger.debug(
            "ConversationEngine: %d history turns, user_msg_len=%d",
            len(history),
            len(user_message),
        )

        response = await self._client.chat.completions.create(
            model=_MODEL,
            messages=messages,  # type: ignore[arg-type]
            max_tokens=_MAX_TOKENS,
            temperature=0.6,
        )
        text = (response.choices[0].message.content or "").strip()
        if not text:
            text = "I'm sorry, I didn't understand that. Could you please repeat?"
        return text


# ── Singleton factory ─────────────────────────────────────────────────────────

_engine: ConversationEngine | None = None


def get_conversation_engine() -> ConversationEngine | None:
    """Return the configured engine, or None if OpenAI is not configured."""
    global _engine
    if _engine is None:
        from app.core.config import get_settings
        settings = get_settings()
        if settings.openai_api_key:
            _engine = ConversationEngine(api_key=settings.openai_api_key)
            logger.info("Conversation engine: OpenAI %s", _MODEL)
        else:
            logger.warning("Conversation engine disabled (no OPENAI_API_KEY)")
    return _engine
