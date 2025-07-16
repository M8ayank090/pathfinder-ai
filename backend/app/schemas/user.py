from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    theme: Optional[str] = None
    language: Optional[str] = None
    units: Optional[str] = None
    default_transport: Optional[str] = None
    route_preferences: Optional[Dict[str, Any]] = None
    notifications: Optional[Dict[str, Any]] = None
    privacy: Optional[Dict[str, Any]] = None


class UserPreferences(BaseModel):
    theme: str = "system"
    language: str = "en"
    units: str = "metric"
    default_transport: str = "walking"
    route_preferences: Dict[str, Any] = {
        "avoid_highways": True,
        "prefer_scenic": True,
        "optimize_for_time": False,
        "consider_weather": True,
        "safety_first": True
    }
    notifications: Dict[str, Any] = {
        "route_updates": True,
        "goal_reminders": True,
        "weather_alerts": True,
        "achievement_unlocks": True,
        "weekly_reports": False
    }
    privacy: Dict[str, Any] = {
        "location_sharing": True,
        "route_history": True,
        "analytics_sharing": False,
        "social_features": True
    }


class UserStats(BaseModel):
    total_distance: float = 0.0
    routes_completed: int = 0
    time_saved: float = 0.0
    wellness_score: float = 0.0


class User(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    theme: str
    language: str
    units: str
    default_transport: str
    route_preferences: Dict[str, Any]
    notifications: Dict[str, Any]
    privacy: Dict[str, Any]
    total_distance: float
    routes_completed: int
    time_saved: float
    wellness_score: float
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserProfile(BaseModel):
    id: int
    email: EmailStr
    username: str
    first_name: Optional[str]
    last_name: Optional[str]
    bio: Optional[str]
    stats: UserStats
    preferences: UserPreferences
    created_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None 