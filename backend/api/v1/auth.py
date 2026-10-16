# Copyright (c) 2026 Khoa Cao. All rights reserved.

from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from schemas.user import Token, UserLogin
from services.auth_service import authenticate_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)

def login(credentials: UserLogin, db: Annotated[Session, Depends(get_db)]):
    # Take request and sent to Service
    return authenticate_user(db=db, credentials=credentials)