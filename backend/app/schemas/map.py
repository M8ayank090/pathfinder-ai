from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class Location(BaseModel):
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lng: float = Field(..., ge=-180, le=180, description="Longitude")


class PlaceSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=100, description="Search query")
    user_location: Optional[Location] = Field(None, description="User's current location")
    limit: int = Field(15, ge=1, le=50, description="Maximum number of results")


class Place(BaseModel):
    name: str
    type: str
    lat: float
    lng: float
    address: str
    rating: float = Field(..., ge=0, le=5)
    place_id: Optional[str] = None
    osm_type: Optional[str] = None
    osm_id: Optional[str] = None
    distance: Optional[float] = Field(None, ge=0, description="Distance from user in km")


class PlaceSearchResponse(BaseModel):
    places: List[Place]
    total_results: int
    query: str


class RouteCalculationRequest(BaseModel):
    origin: Location = Field(..., description="Starting point")
    destination: Location = Field(..., description="Destination point")
    transport_mode: str = Field("walking", description="Transport mode: walking, cycling, driving")


class RouteStep(BaseModel):
    distance: Dict[str, Any]  # {"text": "100m", "value": 100}
    duration: Dict[str, Any]  # {"text": "60s", "value": 60}
    instruction: str
    maneuver: Dict[str, Any]


class RouteCalculationResponse(BaseModel):
    distance: str  # "2.5 km" or "1500 m"
    duration: str  # "30 min" or "1800 s"
    distance_value: float  # Distance in meters
    duration_value: float  # Duration in seconds
    points: List[List[float]]  # [[lat, lng], [lat, lng], ...]
    steps: List[RouteStep]
    polyline: str  # Encoded polyline
    summary: Dict[str, Any]


class RouteSuggestionRequest(BaseModel):
    origin: Location
    destination: Location
    preferences: Optional[Dict[str, Any]] = Field(None, description="User preferences")
    transport_modes: List[str] = Field(["walking", "cycling", "driving"], description="Preferred transport modes")


class RouteSuggestion(BaseModel):
    transport_mode: str
    distance: float
    duration: float
    safety_score: float = Field(..., ge=0, le=10)
    environmental_score: float = Field(..., ge=0, le=10)
    route_features: List[str]
    description: str
    polyline: str
    points: List[List[float]]


class RouteSuggestionResponse(BaseModel):
    suggestions: List[RouteSuggestion]
    origin: Location
    destination: Location
    total_suggestions: int


class EnvironmentalData(BaseModel):
    aqi: int = Field(..., ge=0, le=500)
    temperature: float
    humidity: float
    wind_speed: float
    visibility: float
    greenery: float = Field(..., ge=0, le=10)
    noise: float = Field(..., ge=0, le=10)
    safety: float = Field(..., ge=0, le=10)
    weather: str
    weather_icon: str


class LocationInfo(BaseModel):
    location: Location
    environmental_data: Optional[EnvironmentalData] = None
    nearby_places: Optional[List[Place]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow) 