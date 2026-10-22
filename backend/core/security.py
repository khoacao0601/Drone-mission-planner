# Copyright (c) 2026 Khoa Cao. All rights reserved.

import bcrypt
from datetime import datetime, timedelta, timezone
from jose import jwt

from core.config import settings

# Hash pass one way
def hash_pass(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")

# Validation password
def validation_password(origin_password: str, hashed_password: str) -> bool:
    pwd_bytes = origin_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)

# Create JWT Token(short: 15 minutes)
def create_access_token(data: dict) -> str:
    to_encode = data.copy()

    # Setup expiration for Token
    expiration = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expiration, "type": "access"})

    # Encrypt Token by SECRET_KEY
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    return encoded_jwt

# Create JWT Refresh Token (long-live: 7 days)
def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expiration = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expiration, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# Decode and verify JWT Token
def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])