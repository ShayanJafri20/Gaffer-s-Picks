import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.database.connection import get_db
from app.models.user import User
from app.schemas.user import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    Token,
    UserLogin,
    UserOut,
    UserRegister,
)
from app.services.email import send_password_reset_email

logger = logging.getLogger("auth")

router = APIRouter(prefix="/auth", tags=["auth"])

RESET_TOKEN_TTL = timedelta(hours=1)


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    user = User(
        username=payload.username,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
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


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password"
        )
    return Token(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/acknowledge-rules", response_model=UserOut)
def acknowledge_rules(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    current_user.has_seen_rules = True
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Always responds the same way regardless of whether the email exists,
    so this endpoint can't be used to check who has an account."""
    user = db.query(User).filter(User.email == payload.email.lower()).first()

    if user is not None:
        raw_token = secrets.token_urlsafe(32)
        user.reset_token_hash = _hash_token(raw_token)
        user.reset_token_expires_at = datetime.now(timezone.utc) + RESET_TOKEN_TTL
        db.commit()

        reset_link = f"{settings.frontend_url}/reset-password?token={raw_token}"
        try:
            send_password_reset_email(user.email, reset_link)
        except Exception:
            logger.exception("Failed to send password reset email to %s", user.email)

    return {"detail": "If that email has an account, a reset link has been sent."}


@router.post("/reset-password", response_model=UserOut)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    token_hash = _hash_token(payload.token)
    user = db.query(User).filter(User.reset_token_hash == token_hash).first()

    if (
        user is None
        or user.reset_token_expires_at is None
        or user.reset_token_expires_at < datetime.now(timezone.utc)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset link"
        )

    user.password_hash = hash_password(payload.new_password)
    user.reset_token_hash = None
    user.reset_token_expires_at = None
    db.commit()
    db.refresh(user)
    return user
