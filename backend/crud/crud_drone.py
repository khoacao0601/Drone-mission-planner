# Copyright (c) 2026 Khoa Cao. All rights reserved.

from sqlalchemy.orm import Session
from models.drone import Drone
from datetime import datetime, timezone

#Function to get Drone
def get_all_drones(db: Session):
    return db.query(Drone).all()

def get_drone_by_id(db: Session, drone_id: int):
    return db.query(Drone).filter(Drone.id == drone_id).first()

def pickup_drone(db: Session, db_drone: Drone, operator_id: int):
    db_drone.status = "IN_MISSION"
    db_drone.current_operator_id = operator_id
    db_drone.picked_up_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_drone)
    return db_drone

def release_drone(db: Session, db_drone: Drone, operator_id: int):
    db_drone.status = "AVAILABLE"
    db_drone.current_operator_id = operator_id
    db_drone.released_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_drone)
    return db_drone