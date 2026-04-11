import logging
from typing import Any

from fastapi import APIRouter, Query

from app.services.mock_generator import generate_mock_calls

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/mock-data", tags=["mock-data"])


@router.get("")
async def get_mock_calls(count: int = Query(default=50, ge=1, le=200)) -> dict[str, Any]:
    """Generate realistic mock call records using the local voice catalog.

    No external API dependency — data is generated deterministically from
    the built-in voice catalog and sample data pools.
    """
    return generate_mock_calls(count=count)
