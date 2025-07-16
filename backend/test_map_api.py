#!/usr/bin/env python3
"""
Test script for the new map API endpoints
"""

import asyncio
import httpx
import json
from typing import Dict, Any


async def test_map_endpoints():
    """Test the new map API endpoints"""
    
    base_url = "http://localhost:8000/api/v1"
    
    async with httpx.AsyncClient() as client:
        print("🧪 Testing Map API Endpoints...")
        
        # Test 1: Health check
        print("\n1. Testing health endpoint...")
        try:
            response = await client.get(f"{base_url}/map/health")
            print(f"✅ Health check: {response.status_code}")
            print(f"   Response: {response.json()}")
        except Exception as e:
            print(f"❌ Health check failed: {e}")
        
        # Test 2: Place search
        print("\n2. Testing place search...")
        try:
            search_data = {
                "query": "restaurant",
                "user_location": {
                    "lat": 28.6139,
                    "lng": 77.2090
                },
                "limit": 5
            }
            
            response = await client.post(
                f"{base_url}/map/search/places",
                json=search_data
            )
            
            print(f"✅ Place search: {response.status_code}")
            data = response.json()
            print(f"   Found {data.get('total_results', 0)} places")
            
            if data.get('places'):
                for place in data['places'][:3]:  # Show first 3
                    print(f"   - {place['name']} ({place['type']})")
                    
        except Exception as e:
            print(f"❌ Place search failed: {e}")
        
        # Test 3: Route calculation
        print("\n3. Testing route calculation...")
        try:
            route_data = {
                "origin": {
                    "lat": 28.6139,
                    "lng": 77.2090
                },
                "destination": {
                    "lat": 28.6145,
                    "lng": 77.2095
                },
                "transport_mode": "walking"
            }
            
            response = await client.post(
                f"{base_url}/map/calculate/route",
                json=route_data
            )
            
            print(f"✅ Route calculation: {response.status_code}")
            data = response.json()
            print(f"   Distance: {data.get('distance', 'N/A')}")
            print(f"   Duration: {data.get('duration', 'N/A')}")
            print(f"   Steps: {len(data.get('steps', []))}")
            
        except Exception as e:
            print(f"❌ Route calculation failed: {e}")
        
        # Test 4: Route suggestions
        print("\n4. Testing route suggestions...")
        try:
            suggestion_data = {
                "origin": {
                    "lat": 28.6139,
                    "lng": 77.2090
                },
                "destination": {
                    "lat": 28.6145,
                    "lng": 77.2095
                },
                "transport_modes": ["walking", "cycling", "driving"]
            }
            
            response = await client.post(
                f"{base_url}/map/suggest/routes",
                json=suggestion_data
            )
            
            print(f"✅ Route suggestions: {response.status_code}")
            data = response.json()
            print(f"   Found {data.get('total_suggestions', 0)} suggestions")
            
            for suggestion in data.get('suggestions', []):
                print(f"   - {suggestion['transport_mode']}: {suggestion['distance']:.1f}km, {suggestion['duration']:.0f}min")
                
        except Exception as e:
            print(f"❌ Route suggestions failed: {e}")
        
        # Test 5: Environmental data
        print("\n5. Testing environmental data...")
        try:
            response = await client.get(f"{base_url}/map/environmental/28.6139/77.2090")
            
            print(f"✅ Environmental data: {response.status_code}")
            data = response.json()
            print(f"   AQI: {data.get('aqi', 'N/A')}")
            print(f"   Temperature: {data.get('temperature', 'N/A')}°C")
            print(f"   Weather: {data.get('weather', 'N/A')}")
            
        except Exception as e:
            print(f"❌ Environmental data failed: {e}")
        
        print("\n🎉 Map API testing completed!")


if __name__ == "__main__":
    print("🚀 Starting Map API Tests...")
    print("Make sure the backend server is running on http://localhost:8000")
    print("=" * 50)
    
    asyncio.run(test_map_endpoints()) 