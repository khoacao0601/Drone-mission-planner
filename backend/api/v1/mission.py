# Copyright (c) 2026 Khoa Cao. All rights reserved.

from typing import Annotated, List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from api.dependencies import get_current_user, is_admin
from core.database import get_db
from models.user import User
from schemas.mission import MissionCreate, MissionResponse
from services import mission_service

router = APIRouter(prefix="/missions", tags=["Missions"])

# Create mission
@router.post("/", response_model=MissionResponse, status_code=status.HTTP_201_CREATED)

def create_mission(
    mission: MissionCreate,
    db: Annotated[Session, Depends(get_db)],
    isAdmin: Annotated[User, Depends(is_admin)]
):
    return mission_service.create_new_mission(db=db, mission=mission, current_user=isAdmin)


# Get mission depend on role
@router.get("/", response_model=List[MissionResponse])

def get_missions(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    return mission_service.get_mission_for_user(db=db, current_user=current_user)

# Get one mission detail
@router.get("/{mission_id}", response_model=MissionResponse)

def get_mission_detail(
    mission_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    return mission_service.get_mission_detail(db=db, mission_id=mission_id, current_user=current_user)

# Delete mission
@router.delete("/{mission_id}", dependencies=[Depends(is_admin)])

def delete_mission(
    mission_id: int,
    db: Annotated[Session, Depends(get_db)]
):
    return mission_service.delete_mission(db=db, mission_id=mission_id)