from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class WaypointSimple(BaseModel):
    id: str
    lat: float
    lng: float
    address: Optional[str] = None

class RouteCreateSimple(BaseModel):
    name: str
    description: Optional[str] = None
    waypoints: List[WaypointSimple]
    distance: float
    estimated_time: int
    difficulty: str = "moderate"
    is_public: bool = True
    geometry: Optional[str] = None  # GeoJSON as string

class RouteUpdateSimple(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None

class RouteResponseSimple(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    waypoints: List[WaypointSimple]
    distance: float
    estimated_time: int
    difficulty: str
    road_quality_score: float
    safety_score: float
    is_public: bool
    tags: List[str]
    view_count: int
    usage_count: int
    rating_avg: float
    rating_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    geometry: Optional[str] = None

    class Config:
        from_attributes = True