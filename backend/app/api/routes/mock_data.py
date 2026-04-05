import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Query

from app.services.luron import get_luron_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/mock-data", tags=["mock-data"])


@router.get("")
async def get_mock_calls(count: int = Query(default=50, ge=1, le=200)) -> dict[str, Any]:
    client = get_luron_client()
    try:
        return await client.get_mock_calls(count=count)
    except Exception as exc:
        logger.exception("Failed to fetch mock calls")
        raise HTTPException(status_code=502, detail=str(exc))
