import logging

from apscheduler.schedulers.background import BackgroundScheduler

from app.database.connection import SessionLocal
from app.jobs.sync_matches import sync_matches

logger = logging.getLogger("scheduler")


def run_sync_job() -> None:
    db = SessionLocal()
    try:
        result = sync_matches(db)
        logger.info("Scheduled sync completed: %s", result)
    except Exception:
        # Football API being down or slow shouldn't crash the app or lose
        # existing data - just log it and let the next 5-minute run retry.
        logger.exception("Scheduled sync failed")
    finally:
        db.close()


scheduler = BackgroundScheduler()


def start_scheduler() -> None:
    scheduler.add_job(run_sync_job, "interval", minutes=5, id="sync_matches", replace_existing=True)
    scheduler.start()


def stop_scheduler() -> None:
    scheduler.shutdown(wait=False)
