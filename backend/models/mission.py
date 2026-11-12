# Copyright (c) 2026 Khoa Cao. All rights reserved.

from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.user import User

from core.database import Base

class Mission(Base):
    __tablename__ = "missions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="DRAFT")

    # Flight index
    horizontal_speed: Mapped[float] = mapped_column(Float, default=10.0)
    altitude_mode: Mapped[str] = mapped_column(String, default="ASL")
    flight_altitude: Mapped[float] = mapped_column(Float, default=50.0)

    # Waypoints list in JSONB
    waypoints: Mapped[list] = mapped_column(JSONB, default=list)

    # Connection to table Users
    created_by_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_to_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)

    #JOIN get details from Pilot
    assigned_to: Mapped[Optional[User]] = relationship("User", foreign_keys=[assigned_to_id], lazy="joined")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())