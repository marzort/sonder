from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
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

class Avatar(Base):
    __tablename__ = "avatars"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    hair: Mapped[int] = mapped_column()
    shirt: Mapped[int] = mapped_column()
    hat: Mapped[int] = mapped_column()
    skin_color: Mapped[int] = mapped_column()