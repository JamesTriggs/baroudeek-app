from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from app.db.database import Base
import uuid

class RoadSegment(Base):
    __tablename__ = "road_segments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # OpenStreetMap way ID for reference
    osm_way_id = Column(String, nullable=True, index=True)
    
    # Geographic data
    geometry = Column(Geometry("LINESTRING", srid=4326), nullable=False)
    
    # Road characteristics
    road_type = Column(String, nullable=False)  # primary, secondary, tertiary, residential, cycleway
    surface = Column(String, nullable=True)  # asphalt, concrete, gravel, dirt, unknown
    name = Column(String, nullable=True)
    max_speed = Column(Integer, nullable=True)
    
    # Infrastructure
    has_bike_lane = Column(Boolean, default=False)
    has_sidewalk = Column(Boolean, default=False)
    width = Column(Float, nullable=True)  # in meters
    
    # Cycling-specific scores (0-100)
    quality_score = Column(Float, default=50.0)
    safety_score = Column(Float, default=50.0)
    traffic_score = Column(Float, default=50.0)
    surface_score = Column(Float, default=50.0)
    
    # Elevation data
    gradient = Column(Float, nullable=True)  # average gradient in percentage
    elevation_start = Column(Float, nullable=True)
    elevation_end = Column(Float, nullable=True)
    
    # Usage statistics
    usage_count = Column(Integer, default=0)
    rating_count = Column(Integer, default=0)
    rating_avg = Column(Float, default=0.0)
    
    # Metadata
    tags = Column(JSON, default=list)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    ratings = relationship("RoadRating", back_populates="road_segment")