from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import uuid
import secrets

class CollaborationSession(Base):
    __tablename__ = "collaboration_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    route_id = Column(String, ForeignKey("routes.id"), nullable=False)
    
    # Session details
    invite_code = Column(String, unique=True, nullable=False, default=lambda: secrets.token_urlsafe(8))
    name = Column(String, nullable=True)
    max_participants = Column(Integer, default=10)
    
    # Session state
    is_active = Column(Boolean, default=True)
    is_locked = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    
    # Relationships
    route = relationship("Route", back_populates="collaboration_sessions")
    participants = relationship("SessionParticipant", back_populates="session", cascade="all, delete-orphan")