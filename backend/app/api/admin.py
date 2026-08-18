from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.security import hash_password
from app.database.connection import get_db
from app.jobs.sync_matches import sync_matches
from app.models.user import User
from app.schemas.user import AdminUserCreate, AdminUserUpdate, UserOut
from app.services.scoring import score_all_finished_matches

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/sync-fixtures")
def trigger_sync_fixtures(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    return sync_matches(db)


@router.post("/recalculate-points")
def trigger_recalculate_points(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    return score_all_finished_matches(db)


@router.get("/users", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    return db.query(User).order_by(User.id).all()


@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: AdminUserCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    user = User(
        username=payload.username,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        is_admin=payload.is_admin,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered",
        )
    db.refresh(user)
    return user


@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    payload: AdminUserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.is_admin is not None and user.id == admin.id and not payload.is_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can't remove your own admin access",
        )

    updates = payload.model_dump(exclude_unset=True)
    if "email" in updates:
        updates["email"] = updates["email"].lower()
    for key, value in updates.items():
        setattr(user, key, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already in use",
        )
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="You can't delete your own account"
        )
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
