from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from app.db.database import Base
import uuid

class Route(Base):
    __tablename__ = "routes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # User who created the route
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Route geometry (LineString)
    geometry = Column(Geometry("LINESTRING", srid=4326), nullable=True)
    
    # Route metrics
    distance = Column(Float, nullable=False)  # in meters
    estimated_time = Column(Integer, nullable=False)  # in seconds
    difficulty = Column(String, nullable=False)  # easy, moderate, hard
    road_quality_score = Column(Float, nullable=False, default=0.0)
    safety_score = Column(Float, nullable=False, default=0.0)
    
    # Elevation data
    elevation_data = Column(JSON, nullable=True)  # {max, min, total_ascent, total_descent, points}
    
    # Route metadata
    is_public = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    tags = Column(JSON, default=list)  # ["scenic", "beginner-friendly", etc.]
    
    # Usage statistics
    view_count = Column(Integer, default=0)
    usage_count = Column(Integer, default=0)
    rating_avg = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="routes")
    waypoints = relationship("Waypoint", back_populates="route", cascade="all, delete-orphan")
    collaboration_sessions = relationship("CollaborationSession", back_populates="route")