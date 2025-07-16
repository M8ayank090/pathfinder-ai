from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from datetime import datetime, timedelta
import os

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.route import Route, RouteStatus
from app.models.goal import Goal
from app.models.achievement import UserAchievement
from app.schemas.dashboard import (
    DashboardData, Stat, Insight, RecentActivity, WeeklyProgress,
    AnalyticsRequest, AnalyticsResponse
)

router = APIRouter()


@router.get("/", response_model=DashboardData)
async def get_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get comprehensive dashboard data"""
    
    # Get user stats
    stats = await get_user_stats(current_user, db)
    
    # Get insights
    insights = await get_user_insights(current_user, db)
    
    # Get recent activities
    recent_activities = await get_recent_activities(current_user, db)
    
    # Get weekly progress
    weekly_progress = await get_weekly_progress(current_user, db)
    
    # Get unlocked achievements
    unlocked_achievements = await get_unlocked_achievements(current_user, db)
    
    return DashboardData(
        stats=stats,
        insights=insights,
        recent_activities=recent_activities,
        weekly_progress=weekly_progress,
        unlocked_achievements=unlocked_achievements
    )  # type: ignore


@router.post("/analytics", response_model=AnalyticsResponse)
async def get_analytics(
    analytics_request: AnalyticsRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed analytics for a specific time range"""
    
    # Calculate date range
    end_date = datetime.utcnow()
    if analytics_request.time_range == "day":
        start_date = end_date - timedelta(days=1)
    elif analytics_request.time_range == "week":
        start_date = end_date - timedelta(weeks=1)
    elif analytics_request.time_range == "month":
        start_date = end_date - timedelta(days=30)
    else:  # year
        start_date = end_date - timedelta(days=365)
    
    # Get routes in time range
    routes_result = await db.execute(
        select(Route).where(
            Route.user_id == current_user.id,
            Route.created_at >= start_date,
            Route.created_at <= end_date
        )
    )
    routes = routes_result.scalars().all()
    
    # Calculate analytics
    total_distance = sum(r.distance or 0 for r in routes)
    routes_completed = len([r for r in routes if r.status == RouteStatus.COMPLETED])
    time_saved = sum(r.duration or 0 for r in routes) / 60  # Convert to hours
    
    # Calculate wellness score (mock calculation)
    wellness_score = min(10.0, (total_distance * 0.5) + (routes_completed * 0.3) + (time_saved * 0.2))
    
    # Calculate average rating
    rated_routes = [r for r in routes if r.rating is not None]
    average_rating = sum(r.rating for r in rated_routes) / len(rated_routes) if rated_routes else 0.0
    
    # Find favorite transport mode
    transport_counts = {}
    for route in routes:
        transport = route.transport_mode.value
        transport_counts[transport] = transport_counts.get(transport, 0) + 1
    
    favorite_transport = max(transport_counts.items(), key=lambda x: x[1])[0] if transport_counts else "walking"
    
    # Mock peak hours (would be calculated from actual data)
    peak_hours = [8, 9, 17, 18, 19]
    
    # Mock top destinations
    top_destinations = [
        {"name": "Central Park", "visits": 12, "avg_rating": 4.8},
        {"name": "Coffee Shop", "visits": 8, "avg_rating": 4.5},
        {"name": "Gym", "visits": 6, "avg_rating": 4.2}
    ]
    
    # Calculate goal completion rate
    goals_result = await db.execute(
        select(Goal).where(Goal.user_id == current_user.id)
    )
    goals = goals_result.scalars().all()
    goal_completion_rate = len([g for g in goals if g.is_completed]) / len(goals) if goals else 0.0
    
    # Mock achievement progress
    achievement_progress = {
        "distance": 75.0,
        "routes": 60.0,
        "streak": 80.0,
        "wellness": 65.0
    }
    
    return AnalyticsResponse(
        total_distance=float(total_distance) if total_distance is not None else 0.0,
        routes_completed=int(routes_completed) if routes_completed is not None else 0,
        time_saved=float(time_saved) if time_saved is not None else 0.0,
        wellness_score=float(wellness_score) if wellness_score is not None else 0.0,
        average_rating=float(average_rating) if average_rating is not None else 0.0,
        favorite_transport=favorite_transport or "walking",
        peak_hours=peak_hours or [],
        top_destinations=top_destinations or [],
        goal_completion_rate=float(goal_completion_rate) if goal_completion_rate is not None else 0.0,
        achievement_progress=achievement_progress or {}
    )  # type: ignore


async def get_user_stats(user: User, db: AsyncSession) -> List[Stat]:
    """Get user statistics for dashboard"""
    # Get recent routes for comparison
    week_ago = datetime.utcnow() - timedelta(weeks=1)
    recent_routes_result = await db.execute(
        select(Route).where(
            Route.user_id == user.id,
            Route.created_at >= week_ago
        )
    )
    recent_routes = recent_routes_result.scalars().all()
    
    recent_distance = sum(r.distance or 0 for r in recent_routes)
    recent_routes_count = len(recent_routes)
    
    # Calculate changes (mock for now)
    distance_change = 12.5  # 12.5% increase
    routes_change = -5.2    # 5.2% decrease
    time_change = 8.7       # 8.7% increase
    wellness_change = 15.3  # 15.3% increase
    
    return [
        Stat(
            label="Total Distance",
            value=f"{user.total_distance:.1f} km",
            change=distance_change,
            icon="map",
            color="blue"
        ),
        Stat(
            label="Routes Completed",
            value=str(user.routes_completed),
            change=routes_change,
            icon="navigation",
            color="green"
        ),
        Stat(
            label="Time Saved",
            value=f"{user.time_saved:.1f} hrs",
            change=time_change,
            icon="clock",
            color="purple"
        ),
        Stat(
            label="Wellness Score",
            value=f"{user.wellness_score:.1f}/10",
            change=wellness_change,
            icon="heart",
            color="red"
        )
    ]


async def get_user_insights(user: User, db: AsyncSession) -> List[Insight]:
    """Get personalized insights for the user"""
    insights = []
    
    # Analyze recent activity
    week_ago = datetime.utcnow() - timedelta(weeks=1)
    recent_routes_result = await db.execute(
        select(Route).where(
            Route.user_id == user.id,
            Route.created_at >= week_ago
        )
    )
    recent_routes = recent_routes_result.scalars().all()
    
    if recent_routes:
        avg_distance = sum(r.distance or 0 for r in recent_routes) / len(recent_routes)
        if avg_distance > 3.0:
            insights.append(Insight(
                title="Distance Champion",
                description="You're averaging over 3km per route this week!",
                type="positive",
                icon="trophy"
            ))
        elif avg_distance < 1.0:
            insights.append(Insight(
                title="Short Distance Alert",
                description="Consider longer routes to boost your wellness score.",
                type="neutral",
                icon="info"
            ))
    
    # Check goal progress
    goals_result = await db.execute(
        select(Goal).where(Goal.user_id == user.id, Goal.is_active == True)
    )
    goals = goals_result.scalars().all()
    
    if goals:
        low_progress_goals = [g for g in goals if g.progress < 30]
        if low_progress_goals:
            insights.append(Insight(
                title="Goal Progress",
                description=f"You have {len(low_progress_goals)} goals that need attention.",
                type="neutral",
                icon="target"
            ))
    
    # Add default insights if none generated
    if not insights:
        insights = [
            Insight(
                title="Welcome Back!",
                description="Ready to explore new routes and achieve your goals?",
                type="positive",
                icon="sun"
            ),
            Insight(
                title="Weather Check",
                description="Perfect weather for outdoor activities today!",
                type="positive",
                icon="cloud"
            )
        ]
    
    return insights


async def get_recent_activities(user: User, db: AsyncSession) -> List[RecentActivity]:
    """Get recent user activities"""
    # Get recent routes
    recent_routes_result = await db.execute(
        select(Route)
        .where(Route.user_id == user.id)
        .order_by(Route.created_at.desc())
        .limit(5)
    )
    recent_routes = recent_routes_result.scalars().all()
    
    activities = []
    for route in recent_routes:
        activities.append(RecentActivity(
            id=route.id,
            title=route.title,
            time=route.created_at.strftime("%H:%M"),
            distance=f"{route.distance:.1f} km" if route.distance else "N/A",
            duration=f"{route.duration:.0f} min" if route.duration else "N/A",
            type="route"
        ))
    
    return activities


async def get_weekly_progress(user: User, db: AsyncSession) -> WeeklyProgress:
    """Get weekly progress data"""
    # Mock weekly progress data
    return WeeklyProgress(
        distance_goal=75.0,  # 75% of weekly distance goal
        routes_goal=60.0,    # 60% of weekly routes goal
        wellness_goal=80.0   # 80% of weekly wellness goal
    )


async def get_unlocked_achievements(user: User, db: AsyncSession) -> List[dict]:
    """Get recently unlocked achievements"""
    # Mock achievement data
    return [
        {
            "id": 1,
            "title": "First Steps",
            "description": "Complete your first route",
            "icon": "footprints",
            "color": "green",
            "unlocked_at": "2024-01-15T10:30:00Z"
        },
        {
            "id": 2,
            "title": "Distance Explorer",
            "description": "Travel 50km total",
            "icon": "map",
            "color": "blue",
            "unlocked_at": "2024-01-14T16:45:00Z"
        },
        {
            "id": 3,
            "title": "Goal Setter",
            "description": "Complete 5 goals",
            "icon": "target",
            "color": "purple",
            "unlocked_at": "2024-01-13T14:20:00Z"
        }
    ]


# Mock data endpoint for development
@router.get("/mock", response_model=dict)
async def get_mock_dashboard():
    if os.environ.get("ENABLE_MOCK_ENDPOINTS", "true").lower() != "true":
        raise HTTPException(status_code=404, detail="Mock endpoints are disabled in this environment.")
    return {
        "stats": [
            {
                "label": "Total Distance",
                "value": "127.3 km",
                "change": 12.5,
                "icon": "map",
                "color": "blue"
            },
            {
                "label": "Routes Completed",
                "value": "24",
                "change": -5.2,
                "icon": "navigation",
                "color": "green"
            },
            {
                "label": "Time Saved",
                "value": "8.5 hrs",
                "change": 8.7,
                "icon": "clock",
                "color": "purple"
            },
            {
                "label": "Wellness Score",
                "value": "8.7/10",
                "change": 15.3,
                "icon": "heart",
                "color": "red"
            }
        ],
        "insights": [
            {
                "title": "Distance Champion",
                "description": "You're averaging over 3km per route this week!",
                "type": "positive",
                "icon": "trophy"
            },
            {
                "title": "Weather Check",
                "description": "Perfect weather for outdoor activities today!",
                "type": "positive",
                "icon": "cloud"
            }
        ],
        "recent_activities": [
            {
                "id": 1,
                "title": "Morning Walk",
                "time": "08:30",
                "distance": "2.3 km",
                "duration": "28 min",
                "type": "route"
            },
            {
                "id": 2,
                "title": "Coffee Shop Visit",
                "time": "14:30",
                "distance": "1.1 km",
                "duration": "15 min",
                "type": "route"
            }
        ],
        "weekly_progress": {
            "distance_goal": 75.0,
            "routes_goal": 60.0,
            "wellness_goal": 80.0
        },
        "unlocked_achievements": [
            {
                "id": 1,
                "title": "First Steps",
                "description": "Complete your first route",
                "icon": "footprints",
                "color": "green",
                "unlocked_at": "2024-01-15T10:30:00Z"
            }
        ]
    } 