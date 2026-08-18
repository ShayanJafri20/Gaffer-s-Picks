from sqlalchemy.orm import Session

from app.models.match import Match, MatchStatus
from app.models.prediction import Prediction, PredictionChoice

POINTS_FOR_CORRECT_OUTCOME = 3
POINTS_FOR_EXACT_SCORE = 5


def determine_outcome(home_score: int, away_score: int) -> PredictionChoice:
    if home_score > away_score:
        return PredictionChoice.HOME
    if home_score < away_score:
        return PredictionChoice.AWAY
    return PredictionChoice.DRAW


def score_match(db: Session, match: Match) -> int:
    """Award points for every prediction on a finished match.

    Overwrites points rather than incrementing them, so calling this
    again on the same match (e.g. via recalculate-points) is safe and
    always converges on the same result instead of double-counting.
    """
    if match.status != MatchStatus.FINISHED:
        return 0
    if match.home_score is None or match.away_score is None:
        return 0

    outcome = determine_outcome(match.home_score, match.away_score)
    predictions = db.query(Prediction).filter(Prediction.match_id == match.id).all()

    for prediction in predictions:
        exact_score = (
            prediction.home_score_prediction == match.home_score
            and prediction.away_score_prediction == match.away_score
            and prediction.home_score_prediction is not None
        )
        if exact_score:
            prediction.points = POINTS_FOR_EXACT_SCORE
        elif prediction.prediction == outcome:
            prediction.points = POINTS_FOR_CORRECT_OUTCOME
        else:
            prediction.points = 0

    match.points_processed = True
    db.commit()
    return len(predictions)


def score_all_finished_matches(db: Session) -> dict:
    """Recalculate points for every finished match, regardless of points_processed.

    Used by the admin 'recalculate points' action to fix scoring after
    a bug, without needing to touch points_processed bookkeeping by hand.
    """
    finished_matches = (
        db.query(Match)
        .filter(Match.status == MatchStatus.FINISHED)
        .all()
    )

    total_predictions_scored = 0
    for match in finished_matches:
        total_predictions_scored += score_match(db, match)

    return {
        "matches_scored": len(finished_matches),
        "predictions_scored": total_predictions_scored,
    }
