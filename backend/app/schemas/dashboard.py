from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class Stat(BaseModel):
    label: str
    value: str
    change: float
    icon: str
    color: str


class Insight(BaseModel):
    title: str
    description: str
    type: str  # positive, negative, neutral
    icon: str


class RecentActivity(BaseModel):
    id: int
    title: str
    time: str
    distance: str
    duration: str
    type: str

    class Config:
        from_attributes = True


class WeeklyProgress(BaseModel):
    distance_goal: float
    routes_goal: float
    wellness_goal: float


class DashboardData(BaseModel):
    stats: List[Stat]
    insights: List[Insight]
    recent_activities: List[RecentActivity]
    weekly_progress: WeeklyProgress
    unlocked_achievements: List[Dict[str, Any]]


class AnalyticsRequest(BaseModel):
    time_range: str = "week"  # day, week, month, year
    user_id: int


class AnalyticsResponse(BaseModel):
    total_distance: float
    routes_completed: int
    time_saved: float
    wellness_score: float
    average_rating: float
    favorite_transport: str
    peak_hours: List[int]
    top_destinations: List[Dict[str, Any]]
    goal_completion_rate: float
    achievement_progress: Dict[str, float] 