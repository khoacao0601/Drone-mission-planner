# Copyright (c) 2026 Khoa Cao. All rights reserved.

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from crud import crud_drone
from models.user import User

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

def pickup_drone(db: Session, drone_id: int, current_user: User):
    drone = get_drone_details(db, drone_id=drone_id)
    if drone.status != "AVAILABLE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Drone is not available for pickup!"
        )
    return crud_drone.pickup_drone(db, drone, operator_id=current_user.id)

def release_drone(db: Session, drone_id: int, current_user: User):
    drone = get_drone_details(db, drone_id=drone_id)
    if drone.status != "IN_MISSION":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Drone is not currently checked out!"
        )
    if current_user.role != "ADMIN" and drone.current_operator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only release a drone that you picked up!"
        )
    return crud_drone.release_drone(db, drone, operator_id=current_user.id)

