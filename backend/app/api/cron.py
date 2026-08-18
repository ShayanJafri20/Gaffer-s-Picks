from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.connection import get_db
from app.jobs.sync_matches import sync_matches

router = APIRouter(prefix="/cron", tags=["cron"])


def verify_cron_secret(x_cron_secret: str = Header(default="")):
    if not settings.cron_secret or x_cron_secret != settings.cron_secret:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid cron secret")


@router.post("/sync")
def cron_sync(db: Session = Depends(get_db), _=Depends(verify_cron_secret)):
    """Triggered by an external scheduler (e.g. cron-job.org) every ~5 minutes.

    Exists because serverless hosting can't run our in-process APScheduler
    reliably - there's no persistent process for it to run in between requests.
    """
    return sync_matches(db)
