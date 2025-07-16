from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import uuid

class SessionParticipant(Base):
    __tablename__ = "session_participants"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign keys
    session_id = Column(String, ForeignKey("collaboration_sessions.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Participant details
    role = Column(String, default="participant")  # owner, moderator, participant
    color = Column(String, nullable=True)  # hex color for cursor/markers
    
    # Session state
    is_active = Column(Boolean, default=True)
    is_connected = Column(Boolean, default=False)
    
    # Cursor position (for real-time collaboration)
    cursor_position = Column(JSON, nullable=True)  # {lat, lng, timestamp}
    
    # Timestamps
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    session = relationship("CollaborationSession", back_populates="participants")
    user = relationship("User", back_populates="session_participations")