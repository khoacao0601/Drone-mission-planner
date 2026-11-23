# Copyright (c) 2026 Khoa Cao. All rights reserved.

from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from schemas.user import UserResponse
from schemas.drone import DroneResponse
from enum import Enum

# Enum
class MissionStatus(str, Enum):
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class MissionType(str, Enum):
    AREA = "AREA"
    LINEAR = "LINEAR"

# Data for new Mission
class MissionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    horizontal_speed: float = 10.0
    altitude_mode: str = "ASL"
    flight_altitude: float = 50.0
    waypoints: list = []
    assigned_to_id: Optional[int] = None
    mission_type: MissionType = MissionType.AREA
    drone_id: Optional[int] = None


# Return Data for Web
class MissionResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    status: str
    horizontal_speed: float
    altitude_mode: str
    flight_altitude: float
    waypoints: list
    created_by_id: int
    assigned_to_id: Optional[int] = None
    assigned_to: Optional[UserResponse] = None
    created_at: datetime
    mission_type: MissionType = MissionType.AREA
    drone_id: Optional[int] = None
    drone: Optional[DroneResponse] = None

    # let Pydantic read data from SQLAlchemy Model
    model_config = {"from_attributes": True}

class MissionStatusUpdate(BaseModel):
    status: MissionStatus


