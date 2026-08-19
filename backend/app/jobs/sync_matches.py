from datetime import datetime

from sqlalchemy.orm import Session

from app.models.match import Match, MatchStatus
from app.services.football_api import fetch_premier_league_matches
from app.services.scoring import score_match

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

    # One round-trip for all existing matches instead of one query per match -
    # with 380 matches, per-match queries were slow enough to blow past the
    # external cron's request timeout and get the whole sync killed.
    existing_by_external_id = {m.external_match_id: m for m in db.query(Match).all()}

    created = 0
    updated = 0
    newly_finished: list[Match] = []

    for raw in raw_matches:
        external_id = str(raw["id"])
        existing = existing_by_external_id.get(external_id)

        score = raw.get("score", {}).get("fullTime", {})

        fields = {
            "gameweek": raw["matchday"],
            "home_team": raw["homeTeam"]["name"],
            "away_team": raw["awayTeam"]["name"],
            "home_team_crest": raw["homeTeam"].get("crest"),
            "away_team_crest": raw["awayTeam"].get("crest"),
            "kickoff_time": datetime.fromisoformat(raw["utcDate"].replace("Z", "+00:00")),
            "home_score": score.get("home"),
            "away_score": score.get("away"),
            "status": STATUS_MAP.get(raw["status"], MatchStatus.SCHEDULED),
        }

        if existing:
            for key, value in fields.items():
                setattr(existing, key, value)
            match = existing
            updated += 1
        else:
            match = Match(external_match_id=external_id, **fields)
            db.add(match)
            created += 1

        if match.status == MatchStatus.FINISHED and not match.points_processed:
            newly_finished.append(match)

    db.commit()

    predictions_scored = 0
    for match in newly_finished:
        predictions_scored += score_match(db, match)

    return {
        "created": created,
        "updated": updated,
        "total_fetched": len(raw_matches),
        "matches_newly_finished": len(newly_finished),
        "predictions_scored": predictions_scored,
    }
