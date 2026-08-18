from pydantic import BaseModel


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    total_points: int
    correct_predictions: int
    total_predictions: int


class MyRank(BaseModel):
    rank: int
    total_points: int
    correct_predictions: int
    total_predictions: int
