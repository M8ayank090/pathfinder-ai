from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from datetime import datetime, timedelta
import os

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.goal import Goal, GoalProgressLog, GoalCategory
from app.schemas.goal import (
    GoalCreate, GoalUpdate, Goal as GoalSchema, GoalSummary,
    GoalProgressUpdate, GoalStats
)

router = APIRouter()


@router.get("/", response_model=List[GoalSummary])
async def get_user_goals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all goals for the current user"""
    result = await db.execute(
        select(Goal).where(Goal.user_id == current_user.id).order_by(Goal.created_at.desc())
    )
    goals = result.scalars().all()
    
    return [
        GoalSummary(
            id=int(goal.id) if goal.id is not None else 0,  # type: ignore
            title=str(goal.title) if goal.title is not None else "",  # type: ignore
            category=goal.category,  # type: ignore
            progress=float(goal.progress) if goal.progress is not None else 0.0,  # type: ignore
            is_completed=bool(goal.is_completed),  # type: ignore
            current_streak=int(goal.current_streak) if goal.current_streak is not None else 0,  # type: ignore
            deadline=goal.deadline  # type: ignore
        )
        for goal in goals
    ]


@router.post("/", response_model=GoalSchema)
async def create_goal(
    goal_data: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new goal"""
    goal = Goal(
        user_id=current_user.id,
        title=goal_data.title,
        description=goal_data.description,
        category=goal_data.category,
        target=goal_data.target,
        deadline=goal_data.deadline,
        goal_data=str(goal_data.goal_data) if goal_data.goal_data else None
    )
    
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    
    return goal


@router.get("/{goal_id}", response_model=GoalSchema)
async def get_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific goal by ID"""
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id, Goal.user_id == current_user.id)
    )
    goal = result.scalar_one_or_none()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    return goal


@router.put("/{goal_id}", response_model=GoalSchema)
async def update_goal(
    goal_id: int,
    goal_update: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a goal"""
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id, Goal.user_id == current_user.id)
    )
    goal = result.scalar_one_or_none()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    update_data = goal_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(goal, field, value)
    
    await db.commit()
    await db.refresh(goal)
    
    return goal


@router.delete("/{goal_id}")
async def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a goal and its progress logs"""
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id, Goal.user_id == current_user.id)
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    # Delete all progress logs for this goal
    logs_result = await db.execute(select(GoalProgressLog).where(GoalProgressLog.goal_id == goal_id))
    logs = logs_result.scalars().all()
    for log in logs:
        await db.delete(log)
    await db.delete(goal)
    await db.commit()
    return {"message": "Goal deleted successfully"}


@router.post("/{goal_id}/progress", response_model=GoalSchema)
async def update_goal_progress(
    goal_id: int,
    progress_update: GoalProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update goal progress"""
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id, Goal.user_id == current_user.id)
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    # Create progress log
    progress_log = GoalProgressLog(
        goal_id=goal.id,
        progress_value=progress_update.progress_value,
        notes=progress_update.notes
    )
    db.add(progress_log)
    # Update goal progress
    goal.progress = float(progress_update.progress_value)  # type: ignore
    # Check if goal is completed
    if progress_update.progress_value >= 100 and not bool(goal.is_completed):  # type: ignore
        goal.is_completed = True  # type: ignore
        prev_completed_date = goal.last_completed_date  # Save previous value
        goal.last_completed_date = datetime.utcnow()  # type: ignore
        # Update streak
        if prev_completed_date:
            days_since_last = (datetime.utcnow().date() - prev_completed_date.date()).days
            if days_since_last == 1:  # Consecutive day
                goal.current_streak = int(goal.current_streak) + 1 if goal.current_streak is not None else 1  # type: ignore
            else:
                goal.current_streak = 1  # type: ignore
        else:
            goal.current_streak = 1  # type: ignore
        if int(goal.current_streak) > int(goal.longest_streak):  # type: ignore
            goal.longest_streak = int(goal.current_streak)  # type: ignore
    await db.commit()
    await db.refresh(goal)
    return goal


@router.get("/stats/summary", response_model=GoalStats)
async def get_goal_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get goal statistics for the current user"""
    # Get all goals for the user
    result = await db.execute(
        select(Goal).where(Goal.user_id == current_user.id)
    )
    goals = result.scalars().all()
    
    if not goals:
        return GoalStats(
            total_goals=0,
            active_goals=0,
            completed_goals=0,
            average_progress=0.0,
            total_streaks=0,
            longest_streak=0
        )
    
    total_goals = len(goals)
    active_goals = len([g for g in goals if bool(g.is_active) and not bool(g.is_completed)])  # type: ignore
    completed_goals = len([g for g in goals if bool(g.is_completed)])  # type: ignore
    average_progress = sum(float(g.progress) if g.progress is not None else 0.0 for g in goals) / total_goals  # type: ignore
    total_streaks = sum(int(g.current_streak) if g.current_streak is not None else 0 for g in goals)  # type: ignore
    longest_streak = max(int(g.longest_streak) if g.longest_streak is not None else 0 for g in goals) if goals else 0  # type: ignore
    
    return GoalStats(
        total_goals=total_goals,
        active_goals=active_goals,
        completed_goals=completed_goals,
        average_progress=average_progress,  # type: ignore
        total_streaks=total_streaks,  # type: ignore
        longest_streak=longest_streak  # type: ignore
    )


@router.get("/categories/{category}", response_model=List[GoalSummary])
async def get_goals_by_category(
    category: GoalCategory,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get goals by category"""
    result = await db.execute(
        select(Goal).where(
            Goal.user_id == current_user.id,
            Goal.category == category
        ).order_by(Goal.created_at.desc())
    )
    goals = result.scalars().all()
    
    return [
        GoalSummary(
            id=int(goal.id) if goal.id is not None else 0,  # type: ignore
            title=str(goal.title) if goal.title is not None else "",  # type: ignore
            category=goal.category,  # type: ignore
            progress=float(goal.progress) if goal.progress is not None else 0.0,  # type: ignore
            is_completed=bool(goal.is_completed),  # type: ignore
            current_streak=int(goal.current_streak) if goal.current_streak is not None else 0,  # type: ignore
            deadline=goal.deadline  # type: ignore
        )
        for goal in goals
    ]


# Mock data endpoint for development
@router.get("/mock", response_model=List[dict])
async def get_mock_goals():
    if os.environ.get("ENABLE_MOCK_ENDPOINTS", "true").lower() != "true":
        raise HTTPException(status_code=404, detail="Mock endpoints are disabled in this environment.")
    return [
        {
            "id": 1,
            "title": "Morning Mindfulness",
            "category": "wellness",
            "progress": 75,
            "target": "30 min daily",
            "current_streak": 5,
            "deadline": "2024-01-15T00:00:00Z",
            "is_completed": False
        },
        {
            "id": 2,
            "title": "Daily Steps",
            "category": "fitness",
            "progress": 60,
            "target": "10,000 steps",
            "current_streak": 12,
            "deadline": None,
            "is_completed": False
        },
        {
            "id": 3,
            "title": "Creative Inspiration",
            "category": "productivity",
            "progress": 45,
            "target": "2 hours weekly",
            "current_streak": 0,
            "deadline": "2024-01-20T00:00:00Z",
            "is_completed": False
        },
        {
            "id": 4,
            "title": "Social Connections",
            "category": "social",
            "progress": 90,
            "target": "3 meetups monthly",
            "current_streak": 3,
            "deadline": None,
            "is_completed": True
        }
    ] 