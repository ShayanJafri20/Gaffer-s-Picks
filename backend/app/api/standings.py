import time

from fastapi import APIRouter

from app.schemas.standings import StandingsRow
from app.services.football_api import fetch_premier_league_standings

router = APIRouter(prefix="/standings", tags=["standings"])

CACHE_TTL_SECONDS = 60
_cache: dict[str, object] = {"data": None, "fetched_at": 0.0}


@router.get("", response_model=list[StandingsRow])
def get_standings():
    now = time.monotonic()
    if _cache["data"] is None or now - _cache["fetched_at"] > CACHE_TTL_SECONDS:
        raw_table = fetch_premier_league_standings()
        _cache["data"] = [
            StandingsRow(
                position=row["position"],
                team_name=row["team"]["name"],
                team_crest=row["team"].get("crest"),
                played=row["playedGames"],
                won=row["won"],
                draw=row["draw"],
                lost=row["lost"],
                goals_for=row["goalsFor"],
                goals_against=row["goalsAgainst"],
                goal_difference=row["goalDifference"],
                points=row["points"],
            )
            for row in raw_table
        ]
        _cache["fetched_at"] = now
    return _cache["data"]
