from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class TransportMode(str, Enum):
    WALKING = "walking"
    CYCLING = "cycling"
    DRIVING = "driving"
    TRANSIT = "transit"


class RouteStatus(str, Enum):
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class RouteBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    origin: str = Field(..., min_length=1)
    destination: str = Field(..., min_length=1)
    transport_mode: TransportMode


class RouteCreate(RouteBase):
    waypoints: Optional[List[Dict[str, Any]]] = None
    route_polyline: Optional[str] = None
    route_summary: Optional[Dict[str, Any]] = None


class RouteUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    status: Optional[RouteStatus] = None
    distance: Optional[float] = None
    duration: Optional[float] = None
    elevation_gain: Optional[float] = None
    safety_score: Optional[float] = Field(None, ge=0, le=10)
    weather_conditions: Optional[Dict[str, Any]] = None
    traffic_conditions: Optional[Dict[str, Any]] = None
    ai_recommendations: Optional[Dict[str, Any]] = None
    route_features: Optional[Dict[str, Any]] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    feedback: Optional[str] = None


class RouteEvent(BaseModel):
    event_type: str
    location: Optional[str] = None
    event_data: Optional[Dict[str, Any]] = None
    timestamp: datetime

    class Config:
        from_attributes = True


class Route(RouteBase):
    id: int
    user_id: int
    distance: Optional[float]
    duration: Optional[float]
    elevation_gain: Optional[float]
    safety_score: Optional[float]
    waypoints: Optional[List[Dict[str, Any]]]
    route_polyline: Optional[str]
    route_summary: Optional[Dict[str, Any]]
    status: RouteStatus
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    weather_conditions: Optional[Dict[str, Any]]
    traffic_conditions: Optional[Dict[str, Any]]
    ai_recommendations: Optional[Dict[str, Any]]
    route_features: Optional[Dict[str, Any]]
    rating: Optional[int]
    feedback: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    route_events: List[RouteEvent] = []

    class Config:
        from_attributes = True


class RouteSummary(BaseModel):
    id: int
    title: str
    origin: str
    destination: str
    transport_mode: TransportMode
    distance: Optional[float]
    duration: Optional[float]
    safety_score: Optional[float]
    status: RouteStatus
    created_at: datetime

    class Config:
        from_attributes = True


class RouteSearch(BaseModel):
    origin: str
    destination: str
    transport_mode: Optional[TransportMode] = TransportMode.WALKING
    preferences: Optional[Dict[str, Any]] = None


class RouteRecommendation(BaseModel):
    route_id: int
    title: str
    distance: float
    duration: float
    safety_score: float
    route_features: List[str]
    recommendation_reason: str
    confidence_score: float

    class Config:
        from_attributes = True 