from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class UserPreferences(BaseModel):
    avoid_busy_roads: bool = True
    prefer_smooth_surface: bool = True
    max_gradient: int = 8
    route_type: str = "safest"

class UserStats(BaseModel):
    total_routes: int
    total_distance: int
    contribution_points: int
    ratings_given: int

class User(UserBase):
    id: str
    preferences: Dict[str, Any]
    total_routes: int
    total_distance: int
    contribution_points: int
    ratings_given: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_active: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    bio: Optional[str] = None
    preferences: Dict[str, Any]
    stats: UserStats
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse