from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Float, ForeignKey, JSON, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class TransportMode(str, enum.Enum):
    WALKING = "walking"
    CYCLING = "cycling"
    DRIVING = "driving"
    TRANSIT = "transit"


class RouteStatus(str, enum.Enum):
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Route(Base):
    __tablename__ = "routes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Route details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    origin = Column(String, nullable=False)  # Address or coordinates
    destination = Column(String, nullable=False)  # Address or coordinates
    transport_mode = Column(Enum(TransportMode), nullable=False)
    
    # Route metrics
    distance = Column(Float, nullable=True)  # in km
    duration = Column(Float, nullable=True)  # in minutes
    elevation_gain = Column(Float, nullable=True)  # in meters
    safety_score = Column(Float, nullable=True)  # 0-10
    
    # Route data
    waypoints = Column(JSON, nullable=True)  # Array of coordinates
    route_polyline = Column(Text, nullable=True)  # Encoded polyline
    route_summary = Column(JSON, nullable=True)  # Summary data
    
    # Status and tracking
    status = Column(Enum(RouteStatus), default=RouteStatus.PLANNED)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Weather and conditions
    weather_conditions = Column(JSON, nullable=True)
    traffic_conditions = Column(JSON, nullable=True)
    
    # AI recommendations
    ai_recommendations = Column(JSON, nullable=True)
    route_features = Column(JSON, nullable=True)  # scenic, safe, efficient, etc.
    
    # User feedback
    rating = Column(Integer, nullable=True)  # 1-5 stars
    feedback = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="routes")
    route_events = relationship("RouteEvent", back_populates="route")


class RouteEvent(Base):
    __tablename__ = "route_events"
    
    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    event_type = Column(String, nullable=False)  # start, pause, resume, complete, etc.
    location = Column(String, nullable=True)  # Current location
    event_data = Column(JSON, nullable=True)  # Additional event data
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    route = relationship("Route", back_populates="route_events") 