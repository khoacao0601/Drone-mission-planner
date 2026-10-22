# Copyright (c) 2026 Khoa Cao. All rights reserved.

from fastapi import HTTPException, status
from jose import JWTError
from sqlalchemy.orm import Session

from core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    validation_password,
)
from crud.crud_user import get_user_by_email
from schemas.user import Token, UserLogin, UserResponse

def authenticate_user(db: Session, credentials: UserLogin) -> tuple[Token, str]:
    # Get User Info
    user_db = get_user_by_email(db, email=credentials.email)

    # Handle exceptions
    if not user_db or not validation_password(credentials.password, str(user_db.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect Email or Password!"
        )

    # Create both Access Token and Refresh Token
    token_payload = {"sub": user_db.email, "role": user_db.role, "id": user_db.id}
    access_token = create_access_token(data=token_payload)
    refresh_token = create_refresh_token(data=token_payload)
    token_data = Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user_db),
    )
    return token_data, refresh_token

def refresh_user_session(db: Session, refresh_token: str | None) -> tuple[Token, str]:
    # 1. Check if cookie exists
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is missing. Please log in again."
        )
    # 2. Decode and verify refresh token
    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type for refresh."
            )
        email: str | None = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload."
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is invalid or expired. Please log in again."
        )
    # 3. Check user exists in database
    user_db = get_user_by_email(db, email=email)
    if not user_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User no longer exists."
        )
    # 4. Token Rotation: create new Access Token and new Refresh Token
    token_payload = {"sub": user_db.email, "role": user_db.role, "id": user_db.id}
    new_access_token = create_access_token(data=token_payload)
    new_refresh_token = create_refresh_token(data=token_payload)
    token_data = Token(
        access_token=new_access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user_db),
    )
    return token_data, new_refresh_token