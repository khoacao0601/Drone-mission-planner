# Copyright (c) 2026 Khoa Cao. All rights reserved.

from datetime import datetime
from pydantic import BaseModel

# Return drone info
class DroneResponse(BaseModel):
    id: int
    name: str
    model: str
    serial_number: str
    status: str
    battery_level: int
    created_at: datetime

    model_config = {"from_attributes": True}