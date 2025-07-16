#!/usr/bin/env python3
"""
Test script for the map service directly
"""

import asyncio
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.services.map_service import map_service


async def test_map_service():
    """Test the map service directly"""
    
    print("🧪 Testing Map Service Directly...")
    
    # Test 1: Place search
    print("\n1. Testing place search...")
    try:
        places = await map_service.search_places(
            query="restaurant",
            user_location={"lat": 28.6139, "lng": 77.2090},
            limit=5
        )
        
        print(f"✅ Found {len(places)} places")
        for place in places[:3]:
            print(f"   - {place['name']} ({place['type']}) at {place['lat']:.4f}, {place['lng']:.4f}")
            
    except Exception as e:
        print(f"❌ Place search failed: {e}")
    
    # Test 2: Route calculation
    print("\n2. Testing route calculation...")
    try:
        route = await map_service.calculate_route(
            origin={"lat": 28.6139, "lng": 77.2090},
            destination={"lat": 28.6145, "lng": 77.2095},
            transport_mode="walking"
        )
        
        print(f"✅ Route calculated successfully")
        print(f"   Distance: {route['distance']}")
        print(f"   Duration: {route['duration']}")
        print(f"   Steps: {len(route['steps'])}")
        
    except Exception as e:
        print(f"❌ Route calculation failed: {e}")
    
    print("\n🎉 Map service testing completed!")


if __name__ == "__main__":
    asyncio.run(test_map_service()) 