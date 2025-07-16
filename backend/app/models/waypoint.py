from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from app.db.database import Base
import uuid

class Waypoint(Base):
    __tablename__ = "waypoints"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    route_id = Column(String, ForeignKey("routes.id"), nullable=False)
    
    # Geographic location
    point = Column(Geometry("POINT", srid=4326), nullable=False)
    
    # Waypoint details
    address = Column(String, nullable=True)
    name = Column(String, nullable=True)
    type = Column(String, nullable=False)  # start, waypoint, end
    order = Column(Integer, nullable=False)
    
    # Additional info
    elevation = Column(Float, nullable=True)
    notes = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    route = relationship("Route", back_populates="waypoints")