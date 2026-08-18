from datetime import datetime

from sqlalchemy.orm import Session

from app.models.match import Match, MatchStatus
from app.services.football_api import fetch_premier_league_matches

STATUS_MAP = {
    "SCHEDULED": MatchStatus.SCHEDULED,
    "TIMED": MatchStatus.SCHEDULED,
    "IN_PLAY": MatchStatus.LIVE,
    "PAUSED": MatchStatus.LIVE,
    "FINISHED": MatchStatus.FINISHED,
    "POSTPONED": MatchStatus.POSTPONED,
    "SUSPENDED": MatchStatus.POSTPONED,
    "CANCELLED": MatchStatus.POSTPONED,
}


def sync_matches(db: Session) -> dict:
    """Fetch Premier League matches and upsert them into the matches table.

    Safe to call repeatedly: existing matches (matched by external_match_id)
    are updated in place rather than duplicated.
    """
    raw_matches = fetch_premier_league_matches()

    created = 0
    updated = 0

    for raw in raw_matches:
        external_id = str(raw["id"])
        existing = (
            db.query(Match).filter(Match.external_match_id == external_id).first()
        )

        score = raw.get("score", {}).get("fullTime", {})

        fields = {
            "gameweek": raw["matchday"],
            "home_team": raw["homeTeam"]["name"],
            "away_team": raw["awayTeam"]["name"],
            "kickoff_time": datetime.fromisoformat(raw["utcDate"].replace("Z", "+00:00")),
            "home_score": score.get("home"),
            "away_score": score.get("away"),
            "status": STATUS_MAP.get(raw["status"], MatchStatus.SCHEDULED),
        }

        if existing:
            for key, value in fields.items():
                setattr(existing, key, value)
            updated += 1
        else:
            db.add(Match(external_match_id=external_id, **fields))
            created += 1

    db.commit()
    return {"created": created, "updated": updated, "total_fetched": len(raw_matches)}
