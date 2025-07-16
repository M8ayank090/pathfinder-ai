from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import json
import os

from app.core.database import get_db
from app.core.auth import get_current_user, create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import (
    UserCreate, UserUpdate, User as UserSchema, UserProfile, 
    UserLogin, Token, UserPreferences, UserStats
)

router = APIRouter()


@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    result = await db.execute(select(User).where(User.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        username=user_data.username,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        bio=user_data.bio,
        hashed_password=hashed_password
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login user"""
    result = await db.execute(select(User).where(User.email == user_credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(user_credentials.password, user.hashed_password if not hasattr(user.hashed_password, 'expression') else None):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not bool(user.is_active):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    stats = UserStats(
        total_distance=float(current_user.total_distance if not hasattr(current_user.total_distance, 'expression') else 0),
        routes_completed=int(current_user.routes_completed if not hasattr(current_user.routes_completed, 'expression') else 0),
        time_saved=float(current_user.time_saved if not hasattr(current_user.time_saved, 'expression') else 0),
        wellness_score=float(current_user.wellness_score if not hasattr(current_user.wellness_score, 'expression') else 0)
    )
    
    preferences = UserPreferences(
        theme=str(current_user.theme if not hasattr(current_user.theme, 'expression') else 'system'),
        language=str(current_user.language if not hasattr(current_user.language, 'expression') else 'en'),
        units=str(current_user.units if not hasattr(current_user.units, 'expression') else 'metric'),
        default_transport=str(current_user.default_transport if not hasattr(current_user.default_transport, 'expression') else 'walking'),
        route_preferences=current_user.route_preferences if not hasattr(current_user.route_preferences, 'expression') else {},
        notifications=current_user.notifications if not hasattr(current_user.notifications, 'expression') else {},
        privacy=current_user.privacy if not hasattr(current_user.privacy, 'expression') else {}
    )
    
    return UserProfile(
        id=current_user.id if not hasattr(current_user.id, 'expression') else 0,
        email=current_user.email if not hasattr(current_user.email, 'expression') else '',
        username=current_user.username if not hasattr(current_user.username, 'expression') else '',
        first_name=current_user.first_name if not hasattr(current_user.first_name, 'expression') else None,
        last_name=current_user.last_name if not hasattr(current_user.last_name, 'expression') else None,
        bio=current_user.bio if not hasattr(current_user.bio, 'expression') else None,
        stats=stats,
        preferences=preferences,
        created_at=current_user.created_at if not hasattr(current_user.created_at, 'expression') else None
    )


@router.put("/me", response_model=UserProfile)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user profile"""
    update_data = user_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    await db.commit()
    await db.refresh(current_user)
    
    # Return updated profile
    stats = UserStats(
        total_distance=float(current_user.total_distance),
        routes_completed=int(current_user.routes_completed),
        time_saved=float(current_user.time_saved),
        wellness_score=float(current_user.wellness_score)
    )
    
    preferences = UserPreferences(
        theme=str(current_user.theme),
        language=str(current_user.language),
        units=str(current_user.units),
        default_transport=str(current_user.default_transport),
        route_preferences=current_user.route_preferences,
        notifications=current_user.notifications,
        privacy=current_user.privacy
    )
    
    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        bio=current_user.bio,
        stats=stats,
        preferences=preferences,
        created_at=current_user.created_at
    )


@router.get("/stats", response_model=UserStats)
async def get_user_stats(current_user: User = Depends(get_current_user)):
    """Get user statistics"""
    return UserStats(
        total_distance=float(current_user.total_distance),
        routes_completed=int(current_user.routes_completed),
        time_saved=float(current_user.time_saved),
        wellness_score=float(current_user.wellness_score)
    )


@router.get("/preferences", response_model=UserPreferences)
async def get_user_preferences(current_user: User = Depends(get_current_user)):
    """Get user preferences"""
    return UserPreferences(
        theme=str(current_user.theme),
        language=str(current_user.language),
        units=str(current_user.units),
        default_transport=str(current_user.default_transport),
        route_preferences=current_user.route_preferences,
        notifications=current_user.notifications,
        privacy=current_user.privacy
    )


@router.put("/preferences", response_model=UserPreferences)
async def update_user_preferences(
    preferences: UserPreferences,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user preferences"""
    current_user.theme = preferences.theme
    current_user.language = preferences.language
    current_user.units = preferences.units
    current_user.default_transport = preferences.default_transport
    current_user.route_preferences = preferences.route_preferences
    current_user.notifications = preferences.notifications
    current_user.privacy = preferences.privacy
    
    await db.commit()
    await db.refresh(current_user)
    
    return preferences


# Mock data endpoints for development
@router.get("/", response_model=List[dict])
async def get_users():
    if os.environ.get("ENABLE_MOCK_ENDPOINTS", "true").lower() != "true":
        raise HTTPException(status_code=404, detail="Mock endpoints are disabled in this environment.")
    """Get all users (mock data for development)"""
    return [
        {
            "id": 1,
            "username": "john_doe",
            "email": "john@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "total_distance": 127.3,
            "routes_completed": 24,
            "time_saved": 8.5,
            "wellness_score": 8.7
        },
        {
            "id": 2,
            "username": "jane_smith",
            "email": "jane@example.com",
            "first_name": "Jane",
            "last_name": "Smith",
            "total_distance": 89.2,
            "routes_completed": 18,
            "time_saved": 6.2,
            "wellness_score": 7.9
        }
    ] 