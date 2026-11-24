# Copyright (c) 2026 Khoa Cao. All rights reserved.

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from crud import crud_drone

def get_all_drones(db: Session):
    return crud_drone.get_all_drones(db)

def get_drone_details(db: Session, drone_id: int):
    drone = crud_drone.get_drone_by_id(db, drone_id=drone_id)
    if not drone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drone not found!"
        )
    return drone

