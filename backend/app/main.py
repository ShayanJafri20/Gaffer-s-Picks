from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import admin, auth, contributions, leaderboard, matches, predictions

app = FastAPI(title="Prediction Game API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(matches.router)
app.include_router(predictions.router)
app.include_router(leaderboard.router)
app.include_router(contributions.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok"}
