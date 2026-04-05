import logging
from typing import Any

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class LuronClient:
    def __init__(self) -> None:
        self._client = httpx.AsyncClient(
            base_url=settings.luron_base_url,
            headers={"x-api-key": settings.luron_api_key},
            timeout=60.0,
        )

    async def make_call(
        self,
        *,
        voice: str,
        prompt: str,
        welcome_message: str,
        phone_number: str,
    ) -> dict[str, Any]:
        payload = {
            "voice": voice,
            "prompt": prompt,
            "welcome_message": welcome_message,
            "phone_number": phone_number,
        }
        logger.info("Initiating call to %s with voice=%s", phone_number, voice)
        response = await self._client.post("/make-call", json=payload)
        response.raise_for_status()
        return response.json()

    async def get_mock_calls(self, count: int = 50) -> dict[str, Any]:
        response = await self._client.get("/mock-calls", params={"count": count})
        response.raise_for_status()
        return response.json()

    async def aclose(self) -> None:
        await self._client.aclose()


_client: LuronClient | None = None


def get_luron_client() -> LuronClient:
    global _client
    if _client is None:
        _client = LuronClient()
    return _client
