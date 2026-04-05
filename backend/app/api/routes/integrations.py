import logging

from fastapi import APIRouter, HTTPException, Query

from app.services.exchange_rate import fetch_exchange_rate_context
from app.services.weather import fetch_weather_context

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.get("/weather")
async def get_weather(city: str = Query(default="Istanbul")):
    try:
        context = await fetch_weather_context(city=city)
        return {"city": city, "context": context}
    except Exception as exc:
        logger.exception("Weather fetch failed")
        raise HTTPException(status_code=502, detail=str(exc))


@router.get("/exchange-rates")
async def get_exchange_rates(base: str = Query(default="TRY")):
    try:
        context = await fetch_exchange_rate_context(base=base)
        return {"base": base, "context": context}
    except Exception as exc:
        logger.exception("Exchange rate fetch failed")
        raise HTTPException(status_code=502, detail=str(exc))
