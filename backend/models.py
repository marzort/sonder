import uuid

from sqlalchemy import (
    String, 
    Boolean, 
    DateTime, 
    ForeignKey,
    CheckConstraint,
    Float,
    func
)

from sqlalchemy.orm import (
    DeclarativeBase, 
    Mapped, 
    mapped_column, 
    relationship
)

from sqlalchemy.dialects.postgresql import UUID

from geoalchemy2 import Geography

from datetime import datetime

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar = relationship("Avatar", uselist=False)

    location_sharing_enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    current_location: Mapped[object | None] = mapped_column(
        Geography(
            geometry_type="POINT",
            srid=4326,
            spatial_index=True
        ),
        nullable=True
    )

    location_accuracy: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    location_updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

class Avatar(Base):
    __tablename__ = "avatars"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    eyes: Mapped[str] = mapped_column(String(50))
    mouth: Mapped[str] = mapped_column(String(50))
    hair: Mapped[str] = mapped_column(String(50))
    clothes: Mapped[str] = mapped_column(String(50))

    skin_color: Mapped[str] = mapped_column(String(6))
    hair_color: Mapped[str] = mapped_column(String(6))
    clothes_color: Mapped[str] = mapped_column(String(6))

class Meeting(Base):
    __tablename__ = "meetings"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    user_a_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    user_b_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    meeting_location: Mapped[object] = mapped_column(
        Geography(
            geometry_type='POINT',
            srid=4326
        ),
        nullable=False
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    ended_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    __table_args__ = (
        CheckConstraint(
            "user_a_id < user_b_id",
            name="meeting_user_order"
        ),
    )