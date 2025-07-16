from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class WaypointBase(BaseModel):
    lat: float
    lng: float
    address: Optional[str] = None
    name: Optional[str] = None
    type: str = "waypoint"
    order: int
    elevation: Optional[float] = None
    notes: Optional[str] = None

class WaypointCreate(WaypointBase):
    pass

class WaypointUpdate(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    address: Optional[str] = None
    name: Optional[str] = None
    type: Optional[str] = None
    order: Optional[int] = None
    elevation: Optional[float] = None
    notes: Optional[str] = None

class Waypoint(WaypointBase):
    id: str
    route_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ElevationProfile(BaseModel):
    max_elevation: float
    min_elevation: float
    total_ascent: float
    total_descent: float
    points: List[Dict[str, float]]

class RouteBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = True
    tags: List[str] = []

class RouteCreate(RouteBase):
    waypoints: List[WaypointCreate]

class RouteUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    tags: Optional[List[str]] = None

class RouteGenerate(BaseModel):
    waypoints: List[WaypointCreate]
    preferences: Dict[str, Any]

class Route(RouteBase):
    id: str
    user_id: str
    distance: float
    estimated_time: int
    difficulty: str
    road_quality_score: float
    safety_score: float
    elevation_data: Optional[Dict[str, Any]] = None
    view_count: int
    usage_count: int
    rating_avg: float
    rating_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    waypoints: List[Waypoint] = []

    class Config:
        from_attributes = True

class RouteResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    distance: float
    estimated_time: int
    difficulty: str
    road_quality_score: float
    safety_score: float
    elevation_data: Optional[Dict[str, Any]] = None
    is_public: bool
    tags: List[str]
    view_count: int
    usage_count: int
    rating_avg: float
    rating_count: int
    created_at: datetime
    waypoints: List[Waypoint]
    geometry: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True