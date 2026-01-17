from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base


class AuthProvider(str, enum.Enum):
    EMAIL = "email"
    KAKAO = "kakao"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)  # Null for OAuth users
    name = Column(String(100), nullable=False)
    auth_provider = Column(SQLEnum(AuthProvider), default=AuthProvider.EMAIL)
    kakao_id = Column(String(100), unique=True, nullable=True)

    # Payment info
    payment_method = Column(String(50), nullable=True)  # kakaopay, toss, bank
    payment_account = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    avatar = relationship("Avatar", back_populates="user", uselist=False)
    badges = relationship("UserBadge", back_populates="user")
    group_memberships = relationship("GroupMember", back_populates="user")


class Avatar(Base):
    __tablename__ = "avatars"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # SpongeBob fish avatar parts (3 customizable elements)
    head = Column(String(50), default="default")
    face = Column(String(50), default="default")
    hat = Column(String(50), default="none")

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
