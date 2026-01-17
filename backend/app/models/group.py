from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import secrets

from app.database import Base


def generate_invite_code():
    """Generate 8-character unique invite code."""
    return secrets.token_urlsafe(6)[:8].upper()


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(255), nullable=True)

    invite_code = Column(String(20), unique=True, default=generate_invite_code)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User")
    participants = relationship("GroupParticipant", back_populates="group")
    settlements = relationship("Settlement", back_populates="group")


class GroupParticipant(Base):
    __tablename__ = "group_participants"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Display name for this participant in the group
    name = Column(String(100), nullable=False)

    # Role in group (only meaningful when claimed)
    is_admin = Column(Boolean, default=False)

    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    group = relationship("Group", back_populates="participants")
    user = relationship("User", back_populates="group_participations")
