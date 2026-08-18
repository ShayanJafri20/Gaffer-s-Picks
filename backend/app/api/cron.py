import logging

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.connection import get_db
from app.jobs.sync_matches import sync_matches

logger = logging.getLogger("cron")

router = APIRouter(prefix="/cron", tags=["cron"])


def verify_cron_secret(x_cron_secret: str = Header(default="")):
    if not settings.cron_secret or x_cron_secret != settings.cron_secret:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid cron secret")


@router.post("/sync")
def cron_sync(db: Session = Depends(get_db), _=Depends(verify_cron_secret)):
    """Triggered by an external scheduler (e.g. cron-job.org) every ~5 minutes.

    Exists because serverless hosting can't run our in-process APScheduler
    reliably - there's no persistent process for it to run in between requests.

    Deliberately returns 200 even when the upstream football API fails (rate
    limit, outage, timeout) - this endpoint's own job is just "reachable and
    authenticated", not "the internet is fully up". Returning a 5xx for an
    upstream hiccup would count as a failure against cron-job.org's
    consecutive-failure auto-disable threshold, and since this app runs
    unattended for the whole season, a multi-hour upstream outage silently
    disabling the sync job forever is worse than one missed cycle.
    """
    try:
        result = sync_matches(db)
        return {"status": "ok", **result}
    except Exception:
        logger.exception("cron sync failed")
        return {"status": "error", "detail": "sync failed, will retry next cycle"}
