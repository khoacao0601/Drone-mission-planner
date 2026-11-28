# Copyright (c) 2026 Khoa Cao. All rights reserved.

from datetime import datetime
from pydantic import BaseModel

from typing import Optional
from schemas.user import UserResponse

# Return drone info
class DroneResponse(BaseModel):
    id: int
    name: str
    model: str
    serial_number: str
    status: str
    battery_level: int
    created_at: datetime
    current_operator_id: Optional[int] = None
    current_operator: Optional[UserResponse] = None
    picked_up_at: Optional[datetime] = None
    released_at: Optional[datetime] = None

    model_config = {"from_attributes": True}