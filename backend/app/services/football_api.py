import httpx

from app.core.config import settings

BASE_URL = "https://api.football-data.org/v4"


def fetch_premier_league_matches() -> list[dict]:
    """Fetch all Premier League matches (current season) from football-data.org."""
    response = httpx.get(
        f"{BASE_URL}/competitions/PL/matches",
        headers={"X-Auth-Token": settings.football_api_key},
        timeout=15.0,
    )
    response.raise_for_status()
    return response.json()["matches"]
