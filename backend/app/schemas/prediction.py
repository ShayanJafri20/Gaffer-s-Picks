from datetime import datetime

from pydantic import BaseModel, model_validator

from app.models.prediction import PredictionChoice


class PredictionCreate(BaseModel):
    prediction: PredictionChoice
    home_score_prediction: int | None = None
    away_score_prediction: int | None = None

    @model_validator(mode="after")
    def scores_must_match_outcome(self):
        home, away = self.home_score_prediction, self.away_score_prediction
        if (home is None) != (away is None):
            raise ValueError("Provide both an exact home and away score, or neither")
        if home is not None and away is not None:
            if home < 0 or away < 0:
                raise ValueError("Scores can't be negative")
            implied = (
                PredictionChoice.HOME
                if home > away
                else PredictionChoice.AWAY if home < away else PredictionChoice.DRAW
            )
            if implied != self.prediction:
                raise ValueError("Exact score doesn't match the selected outcome")
        return self


class PredictionOut(BaseModel):
    id: int
    match_id: int
    prediction: PredictionChoice
    home_score_prediction: int | None
    away_score_prediction: int | None
    points: int
    created_at: datetime
    updated_at: datetime
    locked_at: datetime | None

    model_config = {"from_attributes": True}
