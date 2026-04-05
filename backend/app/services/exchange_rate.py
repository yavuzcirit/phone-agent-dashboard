import logging

import httpx

logger = logging.getLogger(__name__)

FRANKFURTER_URL = "https://api.frankfurter.dev/v1/latest"
BANKING_PAIRS = ["USD", "EUR", "GBP", "JPY", "CHF"]


async def fetch_exchange_rate_context(base: str = "TRY") -> str:
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(
            FRANKFURTER_URL,
            params={"from": base, "to": ",".join(BANKING_PAIRS)},
        )
        resp.raise_for_status()
        data = resp.json()

    rates = data.get("rates", {})
    date = data.get("date", "today")

    pairs = ", ".join(f"1 {base} = {v:.4f} {k}" for k, v in sorted(rates.items()))
    context = f"Exchange rates as of {date} (base {base}): {pairs}."
    logger.info("Exchange rate context: %s", context)
    return context
