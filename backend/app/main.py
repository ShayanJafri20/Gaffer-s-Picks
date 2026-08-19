import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    admin,
    auth,
    contributions,
    cron,
    leaderboard,
    matches,
    monthly,
    predictions,
    standings,
)
from app.core.config import settings
from app.jobs.scheduler import start_scheduler, stop_scheduler

# Vercel (and most serverless hosts) sets this automatically. There's no
# persistent process for an in-thread scheduler to live in there, so the
# 5-minute sync instead runs via an external cron hitting /cron/sync.
IS_SERVERLESS = bool(os.environ.get("VERCEL"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not IS_SERVERLESS:
        start_scheduler()
    yield
    if not IS_SERVERLESS:
        stop_scheduler()


app = FastAPI(title="Gaffer's Picks API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(matches.router)
app.include_router(predictions.router)
app.include_router(leaderboard.router)
app.include_router(contributions.router)
app.include_router(monthly.router)
app.include_router(standings.router)
app.include_router(admin.router)
app.include_router(cron.router)


@app.get("/health")
def health():
    return {"status": "ok"}
