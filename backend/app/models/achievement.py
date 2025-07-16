from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Float, ForeignKey, JSON, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class AchievementType(str, enum.Enum):
    DISTANCE = "distance"
    ROUTES = "routes"
    STREAK = "streak"
    WELLNESS = "wellness"
    SOCIAL = "social"
    EXPLORATION = "exploration"
    SPEED = "speed"
    CONSISTENCY = "consistency"


class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String, nullable=False)  # Icon identifier
    color = Column(String, nullable=False)  # Color theme
    achievement_type = Column(Enum(AchievementType), nullable=False)
    
    # Requirements
    requirement_value = Column(Float, nullable=False)  # Target value to unlock
    requirement_unit = Column(String, nullable=False)  # km, routes, days, etc.
    
    # Rewards
    points = Column(Integer, default=0)  # Points awarded
    badge_data = Column(JSON, nullable=True)  # Additional badge data
    
    # Display
    is_hidden = Column(Boolean, default=False)  # Hidden until unlocked
    sort_order = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement")


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    
    # Progress tracking
    current_progress = Column(Float, default=0.0)
    is_unlocked = Column(Boolean, default=False)
    unlocked_at = Column(DateTime(timezone=True), nullable=True)
    
    # Additional data
    progress_data = Column(JSON, nullable=True)  # Additional progress tracking
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_achievements") 