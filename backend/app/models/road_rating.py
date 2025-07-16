from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import uuid

class RoadRating(Base):
    __tablename__ = "road_ratings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign keys
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    road_segment_id = Column(String, ForeignKey("road_segments.id"), nullable=False)
    
    # Overall rating (1-5 stars)
    rating = Column(Integer, nullable=False)
    
    # Category-specific ratings (1-5 stars each)
    surface_rating = Column(Integer, nullable=True)
    safety_rating = Column(Integer, nullable=True)
    traffic_rating = Column(Integer, nullable=True)
    scenery_rating = Column(Integer, nullable=True)
    
    # User feedback
    comment = Column(Text, nullable=True)
    
    # Contextual information
    weather_conditions = Column(String, nullable=True)  # sunny, rainy, windy, etc.
    time_of_day = Column(String, nullable=True)  # morning, afternoon, evening, night
    season = Column(String, nullable=True)  # spring, summer, autumn, winter
    
    # Validation
    is_verified = Column(Integer, default=0)  # 0=pending, 1=verified, -1=flagged
    helpful_votes = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="road_ratings")
    road_segment = relationship("RoadSegment", back_populates="ratings")