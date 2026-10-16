# Copyright (c) 2026 Khoa 

from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from core.config import settings
from core.database import get_db
from crud.crud_user import get_user_by_email
from models.user import User

# Let FastAPI know this API need Authorization Token in request header
oauth2 = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

# Get user infos with Token
def get_current_user( token: Annotated[str, Depends(oauth2)], db: Annotated[Session, Depends(get_db)]) -> User:
    try:
        # Decode token by SECRECT_KEY
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token is not legit!"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is not legit or Expired!"
        )

    user = get_user_by_email(db, email=email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not existed!"
        )
    return user

# Check role
def is_admin(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    if current_user.role.upper() != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This is only for ADMIN!"
        )
    return current_user