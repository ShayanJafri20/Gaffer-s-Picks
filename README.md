# Gaffer's Picks

A private Premier League prediction game built for a small group of friends. Predict
every gameweek's results, earn points, and climb the leaderboard. 

## How it works

- **Predictions** — before each match kicks off, pick a scoreline (or just an outcome).
  Predictions lock automatically the moment the match starts and can be edited freely
  before that.
- **Points** — +3 for correctly picking the outcome (Home/Draw/Away), +5 for nailing
  the exact scoreline (not stacked with the +3), 0 for a wrong guess. Nothing is ever
  deducted.
- **Gameweeks** — only the current gameweek is open for predictions. Once every match
  in it finishes, the next one unlocks automatically.
- **Leaderboard & winner** — ranks everyone by total points across the whole season.
  Whoever has the most points when the season ends wins. 

## Features

- Email/password auth with JWT sessions
- Real Premier League fixtures, live scores, and standings (via
  [football-data.org](https://www.football-data.org))
- Automatic background sync every 5 minutes — scores, match status, and points all
  update without anyone lifting a finger
- Team crests, kickoff times shown in Pakistan time, Home/Away labels on match cards
- Admin panel: manage users, trigger manual syncs/recalculations, promote admins
- Prediction history page - every pick you've made, grouped by gameweek

## Tech stack

| | |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Python, FastAPI, SQLAlchemy, Alembic |
| Database | PostgreSQL ([Neon](https://neon.tech), serverless/free-tier) |
| Hosting | [Vercel](https://vercel.com) (both frontend and backend, as separate projects) |
| Scheduling | Free external cron ([cron-job.org](https://cron-job.org)) hitting a secret-protected sync endpoint every 5 minutes |

## Project structure

```
backend/
  app/
    api/          route handlers (auth, matches, predictions, leaderboard, admin, ...)
    models/        SQLAlchemy models
    schemas/        Pydantic request/response schemas
    services/       business logic (scoring, gameweeks, football API client)
    jobs/           background sync job + scheduler
    core/            config and security (JWT, password hashing)
  alembic/          database migrations
frontend/
  src/
    pages/          one file per route
    components/     shared UI (Nav, Layout, Logo, RulesModal, ...)
    contexts/        auth state
    lib/             typed API client
scripts/
  daily-update.ps1  backs up production, mirrors it into your local dev database,
                     and restarts local servers - run this whenever you sit down to work
```

## Local development

Requirements: Python 3.12, Node.js, PostgreSQL (a `plgame` conda environment with all
three is assumed by the scripts below - adjust paths if you're set up differently).

```powershell
# One-time: copy env files and fill in real values
cp .env.example backend/.env

# Backend
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Or, if your local database should mirror what's actually on production right now:

```powershell
powershell -File scripts\daily-update.ps1
```

## Environment variables

See `.env.example` for the full list. Required: `DATABASE_URL`, `JWT_SECRET`,
`FOOTBALL_API_KEY` (free key from football-data.org), `FRONTEND_URL` (for CORS),
`CRON_SECRET` (protects the automated sync endpoint).

## Deployment

Both frontend and backend deploy to Vercel as separate projects from this same repo
(Root Directory set to `frontend/` and `backend/` respectively), auto-deploying on
every push to `main`. The database lives on Neon's free tier. An external cron job
hits `POST /cron/sync` every 5 minutes to keep fixtures and scores current - Vercel's
serverless functions have no persistent process for an in-app scheduler to live in,
so this replaces that.

Database schema changes need a manual `alembic upgrade head` run against the
production `DATABASE_URL` after pushing - there's no automatic migration-on-deploy
step in this setup.
