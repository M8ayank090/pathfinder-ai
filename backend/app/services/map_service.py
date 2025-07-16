import asyncio
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
import logging

# Import httpx for HTTP requests
import httpx

logger = logging.getLogger(__name__)


class MapService:
    """Service for handling map-related operations using free APIs"""
    
    def __init__(self):
        self.nominatim_base_url = "https://nominatim.openstreetmap.org"
        self.osrm_base_url = "https://router.project-osrm.org"
    
    async def search_places(
        self, 
        query: str, 
        user_location: Optional[Dict[str, float]] = None,
        limit: int = 15
    ) -> List[Dict[str, Any]]:
        """
        Search for places using OpenStreetMap Nominatim API
        """
        try:
            # Build search parameters
            params = {
                "q": query,
                "format": "json",
                "limit": str(limit),
                "addressdetails": "1",
                "extratags": "1",
                "countrycodes": "in"  # Focus on India
            }
            
            # Add location-based search if user location is provided
            if user_location:
                lat, lng = user_location["lat"], user_location["lng"]
                params["viewbox"] = f"{lng-0.1},{lat+0.1},{lng+0.1},{lat-0.1}"
                params["bounded"] = "1"
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.nominatim_base_url}/search",
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                if not data:
                    return []
                
                results = []
                for place in data:
                    result = {
                        "name": place.get("display_name", "").split(",")[0] or place.get("name", "Unknown Location"),
                        "type": place.get("type", "place"),
                        "lat": float(place.get("lat", 0)),
                        "lng": float(place.get("lon", 0)),
                        "address": place.get("display_name", ""),
                        "rating": 4.0,  # Default rating
                        "place_id": place.get("place_id"),
                        "osm_type": place.get("osm_type"),
                        "osm_id": place.get("osm_id")
                    }
                    
                    # Calculate distance if user location is available
                    if user_location:
                        result["distance"] = self._calculate_distance(
                            user_location["lat"], user_location["lng"],
                            result["lat"], result["lng"]
                        )
                    
                    results.append(result)
                
                # Sort by distance if available
                if user_location:
                    results.sort(key=lambda x: x.get("distance", float('inf')))
                
                return results
                
        except httpx.RequestError as e:
            logger.error(f"Error searching places: {e}")
            raise HTTPException(status_code=503, detail="Map service temporarily unavailable")
        except Exception as e:
            logger.error(f"Unexpected error in search_places: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")
        
        return []  # This should never be reached, but satisfies the type checker
    
    async def calculate_route(
        self,
        origin: Dict[str, float],
        destination: Dict[str, float],
        transport_mode: str = "walking"
    ) -> Dict[str, Any]:
        """
        Calculate route using OSRM (Open Source Routing Machine)
        """
        try:
            # Map transport modes to OSRM profiles
            profile_map = {
                "walking": "walking",
                "cycling": "cycling", 
                "driving": "driving",
                "transit": "driving"  # OSRM doesn't support transit, fallback to driving
            }
            
            profile = profile_map.get(transport_mode, "walking")
            
            # Build OSRM request URL
            coords = f"{origin['lng']},{origin['lat']};{destination['lng']},{destination['lat']}"
            url = f"{self.osrm_base_url}/route/v1/{profile}/{coords}"
            
            params = {
                "overview": "full",
                "geometries": "geojson",
                "steps": "true",
                "annotations": "true"
            }
            
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                
                if data.get("code") != "Ok" or not data.get("routes"):
                    raise HTTPException(status_code=404, detail="No route found")
                
                route = data["routes"][0]
                leg = route["legs"][0]
                
                # Convert GeoJSON coordinates to [lat, lng] format
                points = [
                    [coord[1], coord[0]] for coord in route["geometry"]["coordinates"]
                ]
                
                # Convert steps to our format
                steps = []
                for step in leg.get("steps", []):
                    step_data = {
                        "distance": {
                            "text": f"{round(step['distance'])}m",
                            "value": step["distance"]
                        },
                        "duration": {
                            "text": f"{round(step['duration'])}s", 
                            "value": step["duration"]
                        },
                        "instruction": step.get("maneuver", {}).get("instruction", "Continue"),
                        "maneuver": step.get("maneuver", {})
                    }
                    steps.append(step_data)
                
                return {
                    "distance": f"{round(leg['distance'])}m",
                    "duration": f"{round(leg['duration'])}s",
                    "distance_value": leg["distance"],  # meters
                    "duration_value": leg["duration"],  # seconds
                    "points": points,
                    "steps": steps,
                    "polyline": self._encode_polyline(points),
                    "summary": {
                        "total_distance": leg["distance"],
                        "total_duration": leg["duration"],
                        "transport_mode": transport_mode
                    }
                }
                
        except httpx.RequestError as e:
            logger.error(f"Error calculating route: {e}")
            raise HTTPException(status_code=503, detail="Routing service temporarily unavailable")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error in calculate_route: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")
        
        return {}  # This should never be reached, but satisfies the type checker
    
    def _calculate_distance(
        self, 
        lat1: float, 
        lng1: float, 
        lat2: float, 
        lng2: float
    ) -> float:
        """
        Calculate distance between two points using Haversine formula
        """
        import math
        
        R = 6371  # Earth's radius in km
        
        lat1_rad = math.radians(lat1)
        lng1_rad = math.radians(lng1)
        lat2_rad = math.radians(lat2)
        lng2_rad = math.radians(lng2)
        
        dlat = lat2_rad - lat1_rad
        dlng = lng2_rad - lng1_rad
        
        a = (
            math.sin(dlat/2) * math.sin(dlat/2) +
            math.cos(lat1_rad) * math.cos(lat2_rad) * 
            math.sin(dlng/2) * math.sin(dlng/2)
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return round(R * c, 2)
    
    def _encode_polyline(self, points: List[List[float]]) -> str:
        """
        Encode points to polyline format for compatibility
        """
        if not points:
            return ""
        
        encoded = ""
        lat = 0
        lng = 0
        
        for point in points:
            point_lat, point_lng = point[0], point[1]
            
            dlat = round((point_lat - lat) * 1e5)
            dlng = round((point_lng - lng) * 1e5)
            
            lat = point_lat
            lng = point_lng
            
            encoded += self._encode_number(dlat) + self._encode_number(dlng)
        
        return encoded
    
    def _encode_number(self, num: int) -> str:
        """
        Encode a number for polyline format
        """
        encoded = ""
        value = ~(num << 1) if num < 0 else (num << 1)
        
        while value >= 0x20:
            encoded += chr(((value & 0x1f) | 0x20) + 63)
            value >>= 5
        
        encoded += chr(value + 63)
        return encoded


# Global instance
map_service = MapService() 