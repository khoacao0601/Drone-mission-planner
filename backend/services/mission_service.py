# Copyright (c) 2026 Khoa Cao. All rights reserved.

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from crud import crud_mission, crud_drone
from models.user import User
from schemas.mission import MissionCreate, MissionStatus

PILOT_ALLOWED_TRANSITIONS = {
    MissionStatus.ASSIGNED.value: [MissionStatus.ASSIGNED.value, MissionStatus.IN_PROGRESS.value],
    MissionStatus.IN_PROGRESS.value: [MissionStatus.COMPLETED.value],
}

# Create Mission
def create_new_mission(db: Session, mission: MissionCreate, current_user: User):
    return crud_mission.create_mission(db=db, mission=mission, created_by_id=current_user.id)

# Get mission with RBAC filtering
def get_mission_for_user( db: Session, current_user: User):
    if current_user.role == "ADMIN":
        return crud_mission.get_mission(db, current_user.role, current_user.id)

    # for Role Pilot
    return crud_mission.get_mission_by_pilot(db, pilot_id=current_user.id)

# Get mission detail with permission check
def get_mission_detail( db: Session, mission_id: int, current_user: User):
    mission = crud_mission.get_mission_by_id(db, mission_id=mission_id)
    if not mission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mission not found!"
        )

    # user is PILOT, verify the ownership of the mission
    if current_user.role.upper() != "ADMIN" and mission.assigned_to_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this mission"
        )

    return mission

# Delete Mission
def delete_mission( db: Session, mission_id: int ):
    mission = crud_mission.get_mission_by_id(db, mission_id)
    if not mission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mission was not found!"
        )
    crud_mission.delete_mission(db=db, db_mission=mission)
    return { "message": "Mission deleted successfully!"}


# Validate picked-up drone and record audit note if switching to an Alternative Drone
def validate_and_assign_drone(db: Session, mission, target_drone_id: int | None, current_user: User):
    if not target_drone_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please assign a picked-up drone before starting the mission!"
        )
    drone = crud_drone.get_drone_by_id(db, target_drone_id)
    if not drone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drone not found!"
        )
    is_unauthorized_operator = current_user.role != "ADMIN" and drone.current_operator_id != current_user.id
    if drone.status != "IN_MISSION" or is_unauthorized_operator:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must pick up this drone from Fleet Management first!"
        )

    if mission.drone and mission.drone_id != target_drone_id:
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        old_info = f"{mission.drone.name} ({mission.drone.serial_number})"
        new_info = f"{drone.name} ({drone.serial_number})"
        mission.description = (
            f"Assigned Drone: {old_info} (Not available at {now_str}) | "
            f"Alternative Drone: {new_info}"
        )


# Update Mission Status
def update_mission_status(db: Session, mission_id: int, new_status: MissionStatus, current_user: User, drone_id: int | None = None):
    mission = get_mission_detail(db, mission_id=mission_id, current_user=current_user)
    if current_user.role.upper() != "ADMIN":
        allowed_statuses = PILOT_ALLOWED_TRANSITIONS.get(mission.status, [])
        if new_status.value not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update status"
            )

    target_drone_id = drone_id if drone_id is not None else mission.drone_id

    if new_status.value == "IN_PROGRESS" or drone_id is not None:
        validate_and_assign_drone(db, mission, target_drone_id, current_user)

    return crud_mission.update_mission_status(
        db=db,
        db_mission=mission,
        new_status=new_status.value,
        drone_id=target_drone_id
    )
            