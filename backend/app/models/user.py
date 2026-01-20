from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base


class AuthProvider(str, enum.Enum):
    EMAIL = "email"
    GOOGLE = "google"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)  # Null for OAuth users
    name = Column(String(100), nullable=False)
    auth_provider = Column(SQLEnum(AuthProvider), default=AuthProvider.EMAIL)
    google_id = Column(String(100), unique=True, nullable=True)

    # Payment info
    payment_method = Column(String(50), nullable=True)  # kakaopay, toss, bank
    payment_account = Column(String(100), nullable=True)

    # Profile photo (cropped avatar)
    profile_photo_url = Column(String(255), nullable=True)
    full_body_photo_url = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    avatar = relationship("Avatar", back_populates="user", uselist=False)
    badges = relationship("UserBadge", back_populates="user")
    group_participations = relationship("GroupParticipant", back_populates="user")


class Avatar(Base):
    __tablename__ = "avatars"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Avatar parts (3 customizable elements)
    body = Column(String(50), default="yellow_round")
    eyes = Column(String(50), default="original")
    mouth = Column(String(50), default="original")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="avatar")


class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=True)  # Badge earned in which group

    earned_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="badges")
    badge = relationship("Badge")
    group = relationship("Group")
