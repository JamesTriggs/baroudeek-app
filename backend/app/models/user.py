from sqlalchemy import Column, String, DateTime, Boolean, Integer, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Profile info
    full_name = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    
    # Cycling preferences
    preferences = Column(JSON, default={
        "avoid_busy_roads": True,
        "prefer_smooth_surface": True,
        "max_gradient": 8,
        "route_type": "safest"
    })
    
    # Statistics
    total_routes = Column(Integer, default=0)
    total_distance = Column(Integer, default=0)  # in meters
    contribution_points = Column(Integer, default=0)
    ratings_given = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_active = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    routes = relationship("Route", back_populates="user")
    road_ratings = relationship("RoadRating", back_populates="user")
    session_participations = relationship("SessionParticipant", back_populates="user")