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


def fetch_premier_league_standings() -> list[dict]:
    """Fetch the current Premier League table from football-data.org."""
    response = httpx.get(
        f"{BASE_URL}/competitions/PL/standings",
        headers={"X-Auth-Token": settings.football_api_key},
        timeout=15.0,
    )
    response.raise_for_status()
    # "TOTAL" is the overall table; the API also has separate HOME/AWAY standings
    total_table = next(
        s for s in response.json()["standings"] if s["type"] == "TOTAL"
    )
    return total_table["table"]
