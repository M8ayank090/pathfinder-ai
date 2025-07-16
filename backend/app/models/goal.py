from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Float, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class GoalCategory(str, enum.Enum):
    FITNESS = "fitness"
    WELLNESS = "wellness"
    PRODUCTIVITY = "productivity"
    SOCIAL = "social"


class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(Enum(GoalCategory), nullable=False)
    target = Column(String, nullable=False)  # e.g., "30 min daily", "10,000 steps"
    progress = Column(Float, default=0.0)  # 0-100
    is_completed = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Streak tracking
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_completed_date = Column(DateTime(timezone=True), nullable=True)
    
    # Time tracking
    deadline = Column(DateTime(timezone=True), nullable=True)
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Goal-specific data
    goal_data = Column(Text, nullable=True)  # JSON string for additional data
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="goals")
    progress_logs = relationship("GoalProgressLog", back_populates="goal")


class GoalProgressLog(Base):
    __tablename__ = "goal_progress_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    progress_value = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    logged_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    goal = relationship("Goal", back_populates="progress_logs") 