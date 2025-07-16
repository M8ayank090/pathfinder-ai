from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class AchievementType(str, Enum):
    DISTANCE = "distance"
    ROUTES = "routes"
    STREAK = "streak"
    WELLNESS = "wellness"
    SOCIAL = "social"
    EXPLORATION = "exploration"
    SPEED = "speed"
    CONSISTENCY = "consistency"


class AchievementBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1)
    icon: str = Field(..., min_length=1)
    color: str = Field(..., min_length=1)
    achievement_type: AchievementType
    requirement_value: float = Field(..., gt=0)
    requirement_unit: str = Field(..., min_length=1)
    points: int = Field(default=0, ge=0)
    is_hidden: bool = False
    sort_order: int = 0


class Achievement(AchievementBase):
    id: int
    badge_data: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


class UserAchievementBase(BaseModel):
    current_progress: float = Field(default=0.0, ge=0)
    is_unlocked: bool = False
    progress_data: Optional[Dict[str, Any]] = None


class UserAchievementCreate(UserAchievementBase):
    user_id: int
    achievement_id: int


class UserAchievementUpdate(BaseModel):
    current_progress: Optional[float] = Field(None, ge=0)
    is_unlocked: Optional[bool] = None
    progress_data: Optional[Dict[str, Any]] = None


class UserAchievement(UserAchievementBase):
    id: int
    user_id: int
    achievement_id: int
    unlocked_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    achievement: Achievement

    class Config:
        from_attributes = True


class AchievementProgress(BaseModel):
    achievement_id: int
    title: str
    description: str
    icon: str
    color: str
    achievement_type: AchievementType
    requirement_value: float
    requirement_unit: str
    current_progress: float
    is_unlocked: bool
    progress_percentage: float
    points: int

    class Config:
        from_attributes = True


class AchievementStats(BaseModel):
    total_achievements: int
    unlocked_achievements: int
    total_points: int
    completion_rate: float
    recent_unlocks: List[UserAchievement] = [] 