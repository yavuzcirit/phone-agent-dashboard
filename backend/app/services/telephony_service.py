"""Telephony service — pluggable outbound calling with Twilio as primary provider.

Provider hierarchy:
  1. TwilioProvider      — production calling (requires TWILIO_* credentials)
  2. SimulatedProvider   — dev/test mode when Twilio is not configured

The provider is selected automatically at startup based on available config.
"""
import asyncio
import logging
import uuid
from abc import ABC, abstractmethod
from typing import Any

logger = logging.getLogger(__name__)


class TelephonyProvider(ABC):
    @abstractmethod
    async def initiate_call(
        self,
        *,
        phone_number: str,
        answer_webhook_url: str,
        status_callback_url: str,
    ) -> dict[str, Any]:
        """Start an outbound call.

        Returns a dict with at minimum:
          - call_sid: str — provider-assigned call identifier
          - status: str   — initial status ("queued", "initiated", "simulated")
        """
        ...

    @property
    @abstractmethod
    def is_available(self) -> bool: ...


class TwilioProvider(TelephonyProvider):
    """Production telephony via Twilio REST API.

    The call flow:
      1. initiate_call() → Twilio dials phone_number
      2. On answer, Twilio POSTs to answer_webhook_url → returns TwiML
      3. Twilio POSTs speech transcriptions to the gather action URL
      4. Twilio POSTs status updates to status_callback_url
    """

    def __init__(self, account_sid: str, auth_token: str, from_number: str) -> None:
        from twilio.rest import Client  # lazy import
        self._client = Client(account_sid, auth_token)
        self._from_number = from_number
        self._account_sid = account_sid

    @property
    def is_available(self) -> bool:
        return bool(self._account_sid)

    async def initiate_call(
        self,
        *,
        phone_number: str,
        answer_webhook_url: str,
        status_callback_url: str,
    ) -> dict[str, Any]:
        logger.info("Twilio: calling %s answer_url=%s", phone_number, answer_webhook_url)
        loop = asyncio.get_event_loop()
        call = await loop.run_in_executor(
            None,
            lambda: self._client.calls.create(
                to=phone_number,
                from_=self._from_number,
                url=answer_webhook_url,
                method="POST",
                status_callback=status_callback_url,
                status_callback_method="POST",
                status_callback_event=["initiated", "ringing", "answered", "completed"],
            ),
        )
        logger.info("Twilio call SID=%s status=%s", call.sid, call.status)
        return {"call_sid": call.sid, "status": call.status}


class SimulatedProvider(TelephonyProvider):
    """Dev/test provider — no real call is placed.

    Returns a deterministic fake SID so the record can be tracked.
    Used automatically when TWILIO_* credentials are absent.
    """

    @property
    def is_available(self) -> bool:
        return True  # always available as the last-resort fallback

    async def initiate_call(
        self,
        *,
        phone_number: str,
        answer_webhook_url: str,
        status_callback_url: str,
    ) -> dict[str, Any]:
        sim_sid = f"SIM{uuid.uuid4().hex[:20].upper()}"
        logger.warning(
            "Simulated call to %s — no Twilio credentials configured. SID=%s",
            phone_number,
            sim_sid,
        )
        return {"call_sid": sim_sid, "status": "simulated"}


# ── Singleton factory ─────────────────────────────────────────────────────────

_provider: TelephonyProvider | None = None


def get_telephony_provider() -> TelephonyProvider:
    """Return the configured telephony provider (singleton)."""
    global _provider
    if _provider is None:
        from app.core.config import get_settings
        settings = get_settings()
        if settings.twilio_account_sid and settings.twilio_auth_token and settings.twilio_phone_number:
            _provider = TwilioProvider(
                account_sid=settings.twilio_account_sid,
                auth_token=settings.twilio_auth_token,
                from_number=settings.twilio_phone_number,
            )
            logger.info("Telephony provider: Twilio (from=%s)", settings.twilio_phone_number)
        else:
            _provider = SimulatedProvider()
            logger.warning("Telephony provider: Simulated (set TWILIO_* env vars for real calls)")
    return _provider
