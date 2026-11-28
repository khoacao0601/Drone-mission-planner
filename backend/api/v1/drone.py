# Copyright (c) 2026 Khoa Cao. All rights reserved.

from typing import Annotated, List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from api.dependencies import get_current_user
from core.database import get_db
from models.user import User
from services import drone_service
from schemas.drone import DroneResponse


router = APIRouter(prefix="/drones", tags=["Drones"])

@router.get("", response_model=List[DroneResponse])
@router.get("/", response_model=List[DroneResponse])
def get_drones(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    return drone_service.get_all_drones(db=db)

@router.get("/{drone_id}", response_model=DroneResponse)
def get_drone_detail(
    drone_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    return drone_service.get_drone_details(db=db, drone_id=drone_id)

@router.post("/{drone_id}/pickup", response_model=DroneResponse)
def pickup_drone(
    drone_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    return drone_service.pickup_drone(db=db, drone_id=drone_id, current_user=current_user)

@router.post("/{drone_id}/release", response_model=DroneResponse)
def release_drone(
    drone_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    return drone_service.release_drone(db=db, drone_id=drone_id, current_user=current_user)