from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Preferences
    theme = Column(String, default="system")  # light, dark, system
    language = Column(String, default="en")
    units = Column(String, default="metric")  # metric, imperial
    default_transport = Column(String, default="walking")
    
    # Route preferences
    route_preferences = Column(JSON, default={
        "avoid_highways": True,
        "prefer_scenic": True,
        "optimize_for_time": False,
        "consider_weather": True,
        "safety_first": True
    })
    
    # Notification settings
    notifications = Column(JSON, default={
        "route_updates": True,
        "goal_reminders": True,
        "weather_alerts": True,
        "achievement_unlocks": True,
        "weekly_reports": False
    })
    
    # Privacy settings
    privacy = Column(JSON, default={
        "location_sharing": True,
        "route_history": True,
        "analytics_sharing": False,
        "social_features": True
    })
    
    # Stats
    total_distance = Column(Float, default=0.0)
    routes_completed = Column(Integer, default=0)
    time_saved = Column(Float, default=0.0)  # in hours
    wellness_score = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    goals = relationship("Goal", back_populates="user")
    routes = relationship("Route", back_populates="user")
    achievements = relationship("UserAchievement", back_populates="user") 