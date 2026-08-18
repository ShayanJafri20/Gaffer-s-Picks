from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.database.connection import get_db
from app.jobs.sync_matches import sync_matches
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/sync-fixtures")
def trigger_sync_fixtures(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    return sync_matches(db)
