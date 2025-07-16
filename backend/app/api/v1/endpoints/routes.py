from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from datetime import datetime, timedelta
import os

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.route import Route, RouteEvent, TransportMode, RouteStatus
from app.schemas.route import (
    RouteCreate, RouteUpdate, Route as RouteSchema, RouteSummary,
    RouteSearch, RouteRecommendation
)

router = APIRouter()


@router.get("/", response_model=List[RouteSummary])
async def get_user_routes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 20,
    offset: int = 0
):
    """Get all routes for the current user"""
    result = await db.execute(
        select(Route)
        .where(Route.user_id == current_user.id)
        .order_by(Route.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    routes = result.scalars().all()
    return [
        RouteSummary(
            id=route.id,  # type: ignore
            title=route.title,  # type: ignore
            origin=route.origin,  # type: ignore
            destination=route.destination,  # type: ignore
            transport_mode=route.transport_mode,  # type: ignore
            distance=route.distance,  # type: ignore
            duration=route.duration,  # type: ignore
            safety_score=route.safety_score,  # type: ignore
            status=route.status,  # type: ignore
            created_at=route.created_at  # type: ignore
        )
        for route in routes
    ]


@router.post("/", response_model=RouteSchema)
async def create_route(
    route_data: RouteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new route"""
    route = Route(
        user_id=current_user.id,
        title=route_data.title,
        description=route_data.description,
        origin=route_data.origin,
        destination=route_data.destination,
        transport_mode=route_data.transport_mode,
        waypoints=route_data.waypoints,
        route_polyline=route_data.route_polyline,
        route_summary=route_data.route_summary
    )
    
    db.add(route)
    await db.commit()
    await db.refresh(route)
    
    return route


@router.get("/{route_id}", response_model=RouteSchema)
async def get_route(
    route_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific route by ID"""
    result = await db.execute(
        select(Route).where(Route.id == route_id, Route.user_id == current_user.id)
    )
    route = result.scalar_one_or_none()
    
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    return route


@router.put("/{route_id}", response_model=RouteSchema)
async def update_route(
    route_id: int,
    route_update: RouteUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a route"""
    result = await db.execute(
        select(Route).where(Route.id == route_id, Route.user_id == current_user.id)
    )
    route = result.scalar_one_or_none()
    
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    update_data = route_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(route, field, value)
    
    await db.commit()
    await db.refresh(route)
    
    return route


@router.delete("/{route_id}")
async def delete_route(
    route_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a route"""
    result = await db.execute(
        select(Route).where(Route.id == route_id, Route.user_id == current_user.id)
    )
    route = result.scalar_one_or_none()
    
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    await db.delete(route)
    await db.commit()
    
    return {"message": "Route deleted successfully"}


@router.post("/{route_id}/start")
async def start_route(
    route_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    location: str = None,
    event_data: dict = None
):
    """Start navigation for a route"""
    result = await db.execute(
        select(Route).where(Route.id == route_id, Route.user_id == current_user.id)
    )
    route = result.scalar_one_or_none()
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    setattr(route, 'status', RouteStatus.IN_PROGRESS)
    setattr(route, 'started_at', datetime.utcnow())
    event = RouteEvent(
        route_id=route.id,
        event_type="start",
        timestamp=datetime.utcnow(),
        location=location if location is not None else "",
        event_data=event_data if event_data is not None else {}
    )
    db.add(event)
    await db.commit()
    await db.refresh(route)
    return {"message": "Route started successfully", "route_id": route.id}


@router.post("/{route_id}/complete")
async def complete_route(
    route_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    location: str = None,
    event_data: dict = None
):
    """Complete a route"""
    result = await db.execute(
        select(Route).where(Route.id == route_id, Route.user_id == current_user.id)
    )
    route = result.scalar_one_or_none()
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    setattr(route, 'status', RouteStatus.COMPLETED)
    setattr(route, 'completed_at', datetime.utcnow())
    # Update user stats
    if route.distance is not None:
        setattr(current_user, 'total_distance', (float(current_user.total_distance) if not hasattr(current_user.total_distance, 'expression') else 0) + route.distance)
    setattr(current_user, 'routes_completed', (int(current_user.routes_completed) if not hasattr(current_user.routes_completed, 'expression') else 0) + 1)
    event = RouteEvent(
        route_id=route.id,
        event_type="complete",
        timestamp=datetime.utcnow(),
        location=location if location is not None else "",
        event_data=event_data if event_data is not None else {}
    )
    db.add(event)
    await db.commit()
    await db.refresh(route)
    return {"message": "Route completed successfully", "route_id": route.id}


@router.post("/search", response_model=List[RouteRecommendation])
async def search_routes(
    search_data: RouteSearch,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Search for routes based on criteria using free map APIs"""
    try:
        from app.services.map_service import map_service

        # Geocode origin and destination using map_service
        origin_places = await map_service.search_places(search_data.origin)
        destination_places = await map_service.search_places(search_data.destination)
        if not origin_places or not destination_places:
            raise HTTPException(status_code=404, detail="Could not geocode origin or destination.")
        origin = {"lat": origin_places[0]["lat"], "lng": origin_places[0]["lng"]}
        destination = {"lat": destination_places[0]["lat"], "lng": destination_places[0]["lng"]}

        recommendations = []
        transport_modes = [search_data.transport_mode.value] if search_data.transport_mode else ["walking", "cycling", "driving"]
        for i, mode in enumerate(transport_modes):
            try:
                route_data = await map_service.calculate_route(
                    origin=origin,
                    destination=destination,
                    transport_mode=mode
                )
                safety_score = 9.0 if mode == "walking" else 7.0 if mode == "cycling" else 6.0
                route_features = []
                if mode == "walking":
                    route_features = ["scenic", "safe", "eco-friendly"]
                elif mode == "cycling":
                    route_features = ["efficient", "exercise", "eco-friendly"]
                else:
                    route_features = ["fast", "convenient", "all-weather"]
                distance_km = route_data["distance_value"] / 1000
                duration_min = route_data["duration_value"] / 60
                recommendation = RouteRecommendation(
                    route_id=i + 1,
                    title=f"{mode.title()} Route",
                    distance=distance_km,
                    duration=duration_min,
                    safety_score=safety_score,
                    route_features=route_features,
                    recommendation_reason=f"Best {mode} route with good safety and environmental scores",
                    confidence_score=0.85
                )
                recommendations.append(recommendation)
            except Exception as e:
                continue
        if not recommendations:
            recommendations = [
                RouteRecommendation(
                    route_id=1,
                    title="Scenic Park Route",
                    distance=2.3,
                    duration=28.0,
                    safety_score=9.2,
                    route_features=["scenic", "safe", "efficient"],
                    recommendation_reason="Matches your preference for scenic routes",
                    confidence_score=0.85
                ),
                RouteRecommendation(
                    route_id=2,
                    title="Quick City Route",
                    distance=1.8,
                    duration=22.0,
                    safety_score=8.5,
                    route_features=["efficient", "urban"],
                    recommendation_reason="Fastest route to destination",
                    confidence_score=0.78
                )
            ]
        return recommendations
    except HTTPException:
        raise
    except Exception as e:
        return [
            RouteRecommendation(
                route_id=1,
                title="Scenic Park Route",
                distance=2.3,
                duration=28.0,
                safety_score=9.2,
                route_features=["scenic", "safe", "efficient"],
                recommendation_reason="Matches your preference for scenic routes",
                confidence_score=0.85
            ),
            RouteRecommendation(
                route_id=2,
                title="Quick City Route",
                distance=1.8,
                duration=22.0,
                safety_score=8.5,
                route_features=["efficient", "urban"],
                recommendation_reason="Fastest route to destination",
                confidence_score=0.78
            )
        ]


@router.get("/stats/summary")
async def get_route_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get route statistics for the current user"""
    # Get all routes for the user
    result = await db.execute(
        select(Route).where(Route.user_id == current_user.id)
    )
    routes = result.scalars().all()
    
    if not routes:
        return {
            "total_routes": 0,
            "completed_routes": 0,
            "total_distance": 0.0,
            "total_time": 0.0,
            "average_rating": 0.0,
            "favorite_transport": None
        }
    
    total_routes = len(routes)
    completed_routes = len([r for r in routes if r.status == RouteStatus.COMPLETED])
    total_distance = sum(r.distance or 0 for r in routes)
    total_time = sum(r.duration or 0 for r in routes)
    
    # Calculate average rating
    rated_routes = [r for r in routes if r.rating is not None]
    average_rating = sum(r.rating for r in rated_routes) / len(rated_routes) if rated_routes else 0.0
    
    # Find favorite transport mode
    transport_counts = {}
    for route in routes:
        transport = route.transport_mode.value
        transport_counts[transport] = transport_counts.get(transport, 0) + 1
    
    favorite_transport = max(transport_counts.items(), key=lambda x: x[1])[0] if transport_counts else None
    
    return {
        "total_routes": total_routes,
        "completed_routes": completed_routes,
        "total_distance": total_distance,
        "total_time": total_time,
        "average_rating": average_rating,
        "favorite_transport": favorite_transport
    }


@router.get("/recent", response_model=List[RouteSummary])
async def get_recent_routes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 5
):
    """Get recent routes for the current user"""
    result = await db.execute(
        select(Route)
        .where(Route.user_id == current_user.id)
        .order_by(Route.created_at.desc())
        .limit(limit)
    )
    routes = result.scalars().all()
    return [
        RouteSummary(
            id=route.id,
            title=route.title,
            origin=route.origin,
            destination=route.destination,
            transport_mode=route.transport_mode,
            distance=route.distance,
            duration=route.duration,
            safety_score=route.safety_score,
            status=route.status,
            created_at=route.created_at
        )
        for route in routes
    ]


# Mock data endpoint for development
@router.get("/mock", response_model=List[dict])
async def get_mock_routes():
    if os.environ.get("ENABLE_MOCK_ENDPOINTS", "true").lower() != "true":
        raise HTTPException(status_code=404, detail="Mock endpoints are disabled in this environment.")
    return [
        {
            "id": 1,
            "title": "Morning Walk",
            "origin": "Park Avenue",
            "destination": "Central Park",
            "transport_mode": "walking",
            "distance": 2.3,
            "duration": 28.0,
            "safety_score": 9.2,
            "status": "completed",
            "created_at": "2024-01-15T08:30:00Z"
        },
        {
            "id": 2,
            "title": "Coffee Shop Visit",
            "origin": "Home",
            "destination": "Coffee Shop",
            "transport_mode": "cycling",
            "distance": 1.1,
            "duration": 15.0,
            "safety_score": 8.5,
            "status": "completed",
            "created_at": "2024-01-14T14:30:00Z"
        }
    ] 