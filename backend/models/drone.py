# Copyright (c) 2026 Khoa Cao. All rights reserved.

from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, Integer, String, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.user import User

from core.database import Base

class Drone(Base):
    __tablename__ = "drones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    model: Mapped[str] = mapped_column(String, nullable=False)
    serial_number: Mapped[str] = mapped_column(String, nullable=False, unique=True, index=True)
    status: Mapped[str] = mapped_column(String, default="AVAILABLE")
    battery_level: Mapped[int] = mapped_column(Integer, default=100 ,nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    # Hardware Check-out / Check-in tracking
    current_operator_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    current_operator: Mapped[Optional[User]] = relationship("User", foreign_keys=[current_operator_id], lazy="joined")
    picked_up_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    released_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)