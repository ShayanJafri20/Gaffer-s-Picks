from datetime import datetime

from pydantic import BaseModel

from app.models.prediction import PredictionChoice


class PredictionCreate(BaseModel):
    prediction: PredictionChoice


class PredictionOut(BaseModel):
    id: int
    match_id: int
    prediction: PredictionChoice
    points: int
    created_at: datetime
    updated_at: datetime
    locked_at: datetime | None

    model_config = {"from_attributes": True}
