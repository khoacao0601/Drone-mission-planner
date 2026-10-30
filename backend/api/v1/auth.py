# Copyright (c) 2026 Khoa Cao. All rights reserved.

from typing import Annotated
from fastapi import APIRouter, Cookie, Depends, Response
from sqlalchemy.orm import Session

from api.dependencies import get_current_user
from core.config import settings
from core.database import get_db
from models.user import User
from schemas.user import Token, UserLogin, UserResponse
from services.auth_service import authenticate_user, refresh_user_session

router = APIRouter(prefix="/auth", tags=["Authentication"])

REFRESH_COOKIE_NAME = "flyby_refresh_token"
REFRESH_COOKIE_PATH = "/api/v1/auth"


# Helper function to set secure HttpOnly cookie
def set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,                                          # prevent JavaScript read (avoid XSS)
        samesite=settings.COOKIE_SAMESITE,                      # avoid CSRF
        secure=settings.COOKIE_SECURE,                          # use var from config
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600, # 7 days by seconds
        path="/",
    )


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, response: Response, db: Annotated[Session, Depends(get_db)]):
    token_data, refresh_token = authenticate_user(db=db, credentials=credentials)
    set_refresh_cookie(response, refresh_token)
    return token_data


@router.post("/refresh", response_model=Token)
def refresh_token(
    response: Response,
    db: Annotated[Session, Depends(get_db)],
    flyby_refresh_token: Annotated[str | None, Cookie()] = None,
):
    token_data, new_refresh_token = refresh_user_session(db=db, refresh_token=flyby_refresh_token)
    set_refresh_cookie(response, new_refresh_token)
    return token_data


@router.post("/logout")
def logout(response: Response):
    # Delete HttpOnly cookie by expiring it immediately
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path="/",
        httponly=True,
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.COOKIE_SECURE
    )
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    return UserResponse.model_validate(current_user)