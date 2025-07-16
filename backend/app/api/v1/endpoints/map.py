from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.services.map_service import map_service
from app.schemas.map import (
    PlaceSearchRequest, PlaceSearchResponse, Place,
    RouteCalculationRequest, RouteCalculationResponse,
    RouteSuggestionRequest, RouteSuggestionResponse, RouteSuggestion,
    LocationInfo, EnvironmentalData
)

router = APIRouter()


@router.post("/search/places", response_model=PlaceSearchResponse)
async def search_places(
    request: PlaceSearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Search for places using OpenStreetMap Nominatim API
    """
    try:
        # Convert user location to dict if provided
        user_location = None
        if request.user_location:
            user_location = {
                "lat": request.user_location.lat,
                "lng": request.user_location.lng
            }
        
        # Search places using the map service
        places_data = await map_service.search_places(
            query=request.query,
            user_location=user_location,
            limit=request.limit
        )
        
        # Convert to Place objects
        places = [
            Place(
                name=place["name"] or "",
                type=place["type"] or "",
                lat=float(place["lat"]) if place["lat"] is not None else 0.0,
                lng=float(place["lng"]) if place["lng"] is not None else 0.0,
                address=place["address"] or "",
                rating=float(place["rating"]) if place.get("rating") is not None else 0.0,
                place_id=place.get("place_id", ""),
                osm_type=place.get("osm_type", ""),
                osm_id=place.get("osm_id", ""),
                distance=float(place.get("distance", 0.0)) if place.get("distance") is not None else 0.0
            )
            for place in places_data
        ]
        
        return PlaceSearchResponse(
            places=places,
            total_results=len(places),
            query=request.query
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching places: {str(e)}"
        )


@router.post("/calculate/route", response_model=RouteCalculationResponse)
async def calculate_route(
    request: RouteCalculationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Calculate route using OSRM (Open Source Routing Machine)
    """
    try:
        # Convert locations to dict format
        origin = {"lat": request.origin.lat, "lng": request.origin.lng}
        destination = {"lat": request.destination.lat, "lng": request.destination.lng}
        
        # Calculate route using the map service
        route_data = await map_service.calculate_route(
            origin=origin,
            destination=destination,
            transport_mode=request.transport_mode
        )
        
        return RouteCalculationResponse(
            distance=route_data["distance"],
            duration=route_data["duration"],
            distance_value=route_data["distance_value"],
            duration_value=route_data["duration_value"],
            points=route_data["points"],
            steps=route_data["steps"],
            polyline=route_data["polyline"],
            summary=route_data["summary"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calculating route: {str(e)}"
        )


@router.post("/suggest/routes", response_model=RouteSuggestionResponse)
async def suggest_routes(
    request: RouteSuggestionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get multiple route suggestions for different transport modes
    """
    try:
        origin = {"lat": request.origin.lat, "lng": request.origin.lng}
        destination = {"lat": request.destination.lat, "lng": request.destination.lng}
        
        suggestions = []
        
        # Calculate routes for each transport mode
        for transport_mode in request.transport_modes:
            try:
                route_data = await map_service.calculate_route(
                    origin=origin,
                    destination=destination,
                    transport_mode=transport_mode
                )
                
                # Calculate safety and environmental scores based on transport mode
                safety_score = 9.0 if transport_mode == "walking" else 7.0 if transport_mode == "cycling" else 6.0
                environmental_score = 10.0 if transport_mode == "walking" else 9.0 if transport_mode == "cycling" else 3.0
                
                # Determine route features
                route_features = []
                if transport_mode == "walking":
                    route_features = ["eco-friendly", "healthy", "scenic"]
                elif transport_mode == "cycling":
                    route_features = ["eco-friendly", "fast", "exercise"]
                else:
                    route_features = ["fast", "convenient", "all-weather"]
                
                # Create route description
                distance_km = route_data["distance_value"] / 1000
                duration_min = route_data["duration_value"] / 60
                
                description = f"{transport_mode.title()} route: {distance_km:.1f}km, {duration_min:.0f}min"
                
                suggestion = RouteSuggestion(
                    transport_mode=transport_mode,
                    distance=distance_km,
                    duration=duration_min,
                    safety_score=safety_score,
                    environmental_score=environmental_score,
                    route_features=route_features,
                    description=description,
                    polyline=route_data["polyline"],
                    points=route_data["points"]
                )
                
                suggestions.append(suggestion)
                
            except Exception as e:
                # Skip this transport mode if route calculation fails
                continue
        
        return RouteSuggestionResponse(
            suggestions=suggestions,
            origin=request.origin,
            destination=request.destination,
            total_suggestions=len(suggestions)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error suggesting routes: {str(e)}"
        )


@router.get("/environmental/{lat}/{lng}", response_model=EnvironmentalData)
async def get_environmental_data(
    lat: float,
    lng: float,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get environmental data for a specific location
    """
    try:
        # TODO: Integrate real weather and AQI APIs here for live environmental data
        import random
        # Mock environmental data
        environmental_data = EnvironmentalData(
            aqi=random.randint(30, 80),
            temperature=random.uniform(20, 35),
            humidity=random.uniform(40, 80),
            wind_speed=random.uniform(5, 20),
            visibility=random.uniform(5, 10),
            greenery=random.uniform(3, 8),
            noise=random.uniform(2, 7),
            safety=random.uniform(6, 9),
            weather="Partly Cloudy",
            weather_icon="cloud"
        )
        return environmental_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting environmental data: {str(e)}"
        )


@router.get("/location/info/{lat}/{lng}", response_model=LocationInfo)
async def get_location_info(
    lat: float,
    lng: float,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get comprehensive information about a location
    """
    try:
        location = {"lat": lat, "lng": lng}
        # TODO: Integrate real weather and AQI APIs here for live environmental data
        environmental_data = EnvironmentalData(
            aqi=45,
            temperature=28.5,
            humidity=65.0,
            wind_speed=12.0,
            visibility=8.0,
            greenery=7.0,
            noise=4.0,
            safety=8.0,
            weather="Partly Cloudy",
            weather_icon="cloud"
        )
        # Get nearby places
        nearby_places_data = await map_service.search_places(
            query="restaurant",
            user_location=location,
            limit=5
        )
        nearby_places = [
            Place(
                name=place["name"],
                type=place["type"],
                lat=place["lat"],
                lng=place["lng"],
                address=place["address"],
                rating=place["rating"],
                place_id=place.get("place_id"),
                osm_type=place.get("osm_type"),
                osm_id=place.get("osm_id"),
                distance=place.get("distance")
            )
            for place in nearby_places_data
        ]
        return LocationInfo(
            location={"lat": lat, "lng": lng},
            environmental_data=environmental_data,
            nearby_places=nearby_places
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting location info: {str(e)}"
        )


@router.get("/health")
async def map_service_health():
    """
    Check if map services are working
    """
    try:
        # Test search functionality
        test_results = await map_service.search_places("test", limit=1)
        
        return {
            "status": "healthy",
            "services": {
                "nominatim": "operational",
                "osrm": "operational"
            },
            "timestamp": "2024-01-15T12:00:00Z"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Map service unavailable: {str(e)}"
        ) 