import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"

WMO_CODES: dict[int, str] = {
    0: "clear sky",
    1: "mainly clear",
    2: "partly cloudy",
    3: "overcast",
    45: "fog",
    48: "icy fog",
    51: "light drizzle",
    53: "moderate drizzle",
    55: "dense drizzle",
    61: "light rain",
    63: "moderate rain",
    65: "heavy rain",
    71: "light snow",
    73: "moderate snow",
    75: "heavy snow",
    80: "light showers",
    81: "moderate showers",
    82: "violent showers",
    95: "thunderstorm",
    99: "thunderstorm with hail",
}


async def fetch_weather_context(city: str = "Istanbul") -> str:
    async with httpx.AsyncClient(timeout=10.0) as client:
        geo_resp = await client.get(GEOCODE_URL, params={"name": city, "count": 1, "language": "en"})
        geo_resp.raise_for_status()
        geo_data = geo_resp.json()

        if not geo_data.get("results"):
            logger.warning("City not found: %s", city)
            return ""

        location = geo_data["results"][0]
        lat, lon = location["latitude"], location["longitude"]
        country = location.get("country", "")

        weather_resp = await client.get(
            OPEN_METEO_URL,
            params={
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
                "timezone": "auto",
            },
        )
        weather_resp.raise_for_status()
        data = weather_resp.json()

    current = data["current"]
    temp = current["temperature_2m"]
    feels_like = current["apparent_temperature"]
    humidity = current["relative_humidity_2m"]
    wind_speed = current["wind_speed_10m"]
    condition = WMO_CODES.get(current["weather_code"], "unknown conditions")

    context = (
        f"Current weather in {city}, {country}: {condition}, "
        f"{temp}°C (feels like {feels_like}°C), "
        f"humidity {humidity}%, wind {wind_speed} km/h."
    )
    logger.info("Weather context: %s", context)
    return context
