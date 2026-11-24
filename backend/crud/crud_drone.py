# Copyright (c) 2026 Khoa Cao. All rights reserved.

from sqlalchemy.orm import Session
from models.mission import Mission
from schemas.mission import MissionCreate
from models.drone import Drone

#Function to get Drone
def get_all_drones(db: Session):
    return db.query(Drone).all()

def get_drone_by_id(db: Session, drone_id: int):
    return db.query(Drone).filter(Drone.id == drone_id).first()

def update_drone_status(db: Session, db_drone: Drone, new_status: str):
    db_drone.status = new_status
    db.commit()
    db.refresh(db_drone)
    return db_drone