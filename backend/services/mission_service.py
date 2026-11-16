# Copyright (c) 2026 Khoa Cao. All rights reserved.

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from crud import crud_mission
from models.user import User
from schemas.mission import MissionCreate, MissionStatus

PILOT_ALLOWED_TRANSITIONS = {
    MissionStatus.ASSIGNED.value: [MissionStatus.IN_PROGRESS.value],
    MissionStatus.IN_PROGRESS.value: [MissionStatus.COMPLETED.value],
}

# Create Mission
def create_new_mission( db: Session, mission: MissionCreate, current_user: User):
    return crud_mission.create_mission( db=db, mission=mission, created_by_id=current_user.id)

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
def delete_mission( db: Session, mission_id: int):
    mission = crud_mission.get_mission_by_id(db, mission_id)
    if not mission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mission was not found!"
        )

    crud_mission.delete_mission(db=db, db_mission=mission)
    return { "message": "Mission deleted successfully!"}


# Update Mission Status
def update_mission_status(db: Session, mission_id: int, new_status: MissionStatus, current_user: User):
    mission = get_mission_detail(db, mission_id=mission_id, current_user=current_user)
    if current_user.role.upper() != "ADMIN":
        allowed_statuses = PILOT_ALLOWED_TRANSITIONS.get(mission.status, [])
        if new_status.value not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update status"
            )
    return crud_mission.update_mission_status(db=db, db_mission=mission, new_status=new_status.value)