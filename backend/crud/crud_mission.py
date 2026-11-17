# Copyright (c) 2026 Khoa Cao. All rights reserved.

from sqlalchemy.orm import Session
from models.mission import Mission
from schemas.mission import MissionCreate

# Function to get Mission
def get_mission(db: Session, user_role: str, user_id: int):
    if user_role == "ADMIN":
        return db.query(Mission).all()

    return db.query(Mission).filter(Mission.assigned_to_id == user_id).all()

def get_mission_by_pilot(db: Session, pilot_id: int):
    return db.query(Mission).filter(Mission.assigned_to_id == pilot_id).all()


def get_mission_by_id(db: Session, mission_id: int):
    return db.query(Mission).filter(Mission.id == mission_id).first()

# Create Mission
def create_mission(db: Session, mission: MissionCreate, created_by_id: int):
    db_mission = Mission(
        name=mission.name,
        description=mission.description,
        horizontal_speed=mission.horizontal_speed,
        altitude_mode=mission.altitude_mode,
        flight_altitude=mission.flight_altitude,
        waypoints=mission.waypoints,
        assigned_to_id=mission.assigned_to_id,
        created_by_id=created_by_id 
    )
    db.add(db_mission)
    db.commit()
    db.refresh(db_mission)
    return db_mission

# Delete Mission
def delete_mission( db: Session, db_mission: Mission):
    db.delete(db_mission)
    db.commit()

# Update Status Mission
def update_mission_status( db: Session, db_mission: Mission, new_status: str ):
    db_mission.status = new_status
    db.commit()
    db.refresh(db_mission)
    return db_mission