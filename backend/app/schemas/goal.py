from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class GoalCategory(str, Enum):
    FITNESS = "fitness"
    WELLNESS = "wellness"
    PRODUCTIVITY = "productivity"
    SOCIAL = "social"


class GoalBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    category: GoalCategory
    target: str = Field(..., min_length=1, max_length=100)


class GoalCreate(GoalBase):
    deadline: Optional[datetime] = None
    goal_data: Optional[Dict[str, Any]] = None


class GoalUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    category: Optional[GoalCategory] = None
    target: Optional[str] = Field(None, min_length=1, max_length=100)
    progress: Optional[float] = Field(None, ge=0, le=100)
    is_completed: Optional[bool] = None
    is_active: Optional[bool] = None
    deadline: Optional[datetime] = None
    goal_data: Optional[Dict[str, Any]] = None


class GoalProgressUpdate(BaseModel):
    progress_value: float = Field(..., ge=0, le=100)
    notes: Optional[str] = None


class GoalProgressLog(BaseModel):
    id: int
    progress_value: float
    notes: Optional[str]
    logged_at: datetime

    class Config:
        from_attributes = True


class Goal(GoalBase):
    id: int
    user_id: int
    progress: float
    is_completed: bool
    is_active: bool
    current_streak: int
    longest_streak: int
    last_completed_date: Optional[datetime]
    deadline: Optional[datetime]
    start_date: datetime
    goal_data: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: Optional[datetime]
    progress_logs: List[GoalProgressLog] = []

    class Config:
        from_attributes = True


class GoalSummary(BaseModel):
    id: int
    title: str
    category: GoalCategory
    progress: float
    is_completed: bool
    current_streak: int
    deadline: Optional[datetime]

    class Config:
        from_attributes = True


class GoalStats(BaseModel):
    total_goals: int
    active_goals: int
    completed_goals: int
    average_progress: float
    total_streaks: int
    longest_streak: int 