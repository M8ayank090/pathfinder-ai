'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { fetchEnvironmentalData, searchDestinations, getRouteSuggestions, getRealRoute } from '@/lib/api'
import { 
  Navigation, 
  MapPin, 
  Route, 
  Info,
  Layers,
  Compass,
  Clock,
  TrendingUp,
  Shield,
  Heart,
  Zap,
  Search,
  Filter,
  Play,
  Pause,
  RotateCcw,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  AlertTriangle,
  Leaf,
  Car,
  User,
  Bike,
  X,
  Settings,
  SlidersHorizontal
} from 'lucide-react'
// Import the client-only map component
import ClientMap from './ClientMap'

interface RoutePoint {
  lat: number;
  lng: number;
  name: string;
  type: 'start' | 'end' | 'waypoint';
  safetyScore: number;
  environmentalScore: number;
  description: string;
}

interface EnvironmentalData {
  aqi: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  greenery: number;
  noise: number;
  safety: number;
  weather: string;
  weatherIcon: string;
}

interface Route {
  id: string;
  name: string;
  points: RoutePoint[];
  distance: number;
  duration: number;
  safetyScore: number;
  environmentalScore: number;
  transportMode: 'walking' | 'cycling' | 'driving';
  description: string;
  color: string;
  polyline?: string; // Added polyline property
}

interface FilterOptions {
  safetyMin: number;
  environmentalMin: number;
  maxDistance: number;
  maxDuration: number;
  transportMode: 'all' | 'walking' | 'cycling' | 'driving';
  avoidHighways: boolean;
  preferGreen: boolean;
  preferQuiet: boolean;
}

// Map controls are now handled in ClientMap component

export default function MapContainer() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [allRoutes, setAllRoutes] = useState<Route[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.2090 });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData>({
    aqi: 45,
    temperature: 28,
    humidity: 65,
    windSpeed: 12,
    visibility: 8,
    greenery: 7,
    noise: 4,
    safety: 8,
    weather: 'Partly Cloudy',
    weatherIcon: 'cloud'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [transportMode, setTransportMode] = useState<'walking' | 'cycling' | 'driving'>('walking');
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    safetyMin: 7,
    environmentalMin: 6,
    maxDistance: 5,
    maxDuration: 60,
    transportMode: 'all',
    avoidHighways: true,
    preferGreen: true,
    preferQuiet: false
  });

  // Sample route data
  const sampleRoutes: Route[] = [
    {
      id: '1',
      name: 'Scenic Park Route',
      points: [
        { lat: 28.6139, lng: 77.2090, name: 'Start', type: 'start', safetyScore: 9, environmentalScore: 8, description: 'Safe starting point' },
        { lat: 28.6145, lng: 77.2095, name: 'Central Park', type: 'waypoint', safetyScore: 9, environmentalScore: 9, description: 'Beautiful green space' },
        { lat: 28.6150, lng: 77.2100, name: 'Destination', type: 'end', safetyScore: 8, environmentalScore: 7, description: 'Your destination' }
      ],
      distance: 2.3,
      duration: 28,
      safetyScore: 8.7,
      environmentalScore: 8.0,
      transportMode: 'walking',
      description: 'Peaceful route through parks and quiet streets',
      color: '#10b981'
    },
    {
      id: '2',
      name: 'Quick Urban Route',
      points: [
        { lat: 28.6139, lng: 77.2090, name: 'Start', type: 'start', safetyScore: 7, environmentalScore: 6, description: 'Busy intersection' },
        { lat: 28.6142, lng: 77.2098, name: 'Main Street', type: 'waypoint', safetyScore: 6, environmentalScore: 5, description: 'Main thoroughfare' },
        { lat: 28.6150, lng: 77.2100, name: 'Destination', type: 'end', safetyScore: 7, environmentalScore: 6, description: 'Your destination' }
      ],
      distance: 1.8,
      duration: 22,
      safetyScore: 6.7,
      environmentalScore: 5.7,
      transportMode: 'walking',
      description: 'Fastest route through urban areas',
      color: '#f59e0b'
    },
    {
      id: '3',
      name: 'Green Corridor Route',
      points: [
        { lat: 28.6139, lng: 77.2090, name: 'Start', type: 'start', safetyScore: 8, environmentalScore: 9, description: 'Green starting point' },
        { lat: 28.6148, lng: 77.2093, name: 'Botanical Garden', type: 'waypoint', safetyScore: 9, environmentalScore: 10, description: 'Beautiful gardens' },
        { lat: 28.6150, lng: 77.2100, name: 'Destination', type: 'end', safetyScore: 8, environmentalScore: 8, description: 'Your destination' }
      ],
      distance: 3.1,
      duration: 35,
      safetyScore: 8.3,
      environmentalScore: 9.0,
      transportMode: 'walking',
      description: 'Maximum greenery and fresh air',
      color: '#059669'
    }
  ];

  // Initialize routes and get user location on component mount
  useEffect(() => {
    setAllRoutes(sampleRoutes);
    // Get user location automatically
    getUserLocation();
  }, []);

  // Filter routes based on criteria
  const filteredRoutes = allRoutes.filter(route => {
    return (
      route.safetyScore >= filterOptions.safetyMin &&
      route.environmentalScore >= filterOptions.environmentalMin &&
      route.distance <= filterOptions.maxDistance &&
      route.duration <= filterOptions.maxDuration &&
      (filterOptions.transportMode === 'all' || route.transportMode === filterOptions.transportMode)
    );
  });

  // Fetch weather and AQI data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchEnvironmentalData('Delhi');
        setEnvironmentalData({
          aqi: data.aqi.aqi,
          temperature: data.weather.temperature,
          humidity: data.weather.humidity,
          windSpeed: data.weather.windSpeed,
          visibility: data.visibility,
          greenery: data.greenery,
          noise: data.noise,
          safety: data.safety,
          weather: data.weather.weather,
          weatherIcon: data.weather.weatherIcon
        });
      } catch (error) {
        console.log('Using mock environmental data');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const getSafetyColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'text-green-500';
    if (aqi <= 100) return 'text-yellow-500';
    if (aqi <= 150) return 'text-orange-500';
    return 'text-red-500';
  };

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sun': return <div className="text-yellow-500">☀️</div>;
      case 'cloud': return <div className="text-gray-500">☁️</div>;
      case 'cloud-rain': return <div className="text-blue-500">🌧️</div>;
      default: return <div className="text-gray-400">🌤️</div>;
    }
  };

  // Handle search
  const handleSearch = async (query: string) => {
    console.log('Search query:', query); // Debug log
    setSearchQuery(query);
    if (query.length > 1) { // Reduced minimum length for better UX
      setIsSearching(true);
      try {
        const results = await searchDestinations(query, userLocation);
        console.log('Search results:', results); // Debug log
        
        // Sort results by distance if available
        const sortedResults = results.sort((a, b) => {
          if (a.distance && b.distance) {
            return a.distance - b.distance;
          }
          return 0;
        });
        
        setSearchResults(sortedResults);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        setShowSearchResults(true);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
    }
  };

  // Handle destination selection
  const handleDestinationSelect = (destination: any) => {
    setSearchQuery(destination.name);
    setShowSearchResults(false);
    
    // Calculate route to selected destination
    calculateRouteToDestination(destination);
    console.log('Selected destination:', destination);
  };

  // Calculate route to selected destination
  const calculateRouteToDestination = async (destination: any) => {
    try {
      // Get real route using Google Directions API
      const routeData = await getRealRoute(userLocation, destination, transportMode);
      
      // Create route points from the real route data
      const routePoints = routeData.points.map((point: [number, number], index: number) => {
        if (index === 0) {
          return {
            lat: point[0],
            lng: point[1],
            name: 'Your Location',
            type: 'start' as const,
            safetyScore: 8,
            environmentalScore: 7,
            description: 'Starting point'
          };
        } else if (index === routeData.points.length - 1) {
          return {
            lat: point[0],
            lng: point[1],
            name: destination.name,
            type: 'end' as const,
            safetyScore: 8,
            environmentalScore: 7,
            description: destination.type
          };
        } else {
          return {
            lat: point[0],
            lng: point[1],
            name: `Waypoint ${index}`,
            type: 'waypoint' as const,
            safetyScore: 7,
            environmentalScore: 6,
            description: 'Route waypoint'
          };
        }
      });

      // Create a new route with real data
      const newRoute: Route = {
        id: `route-${Date.now()}`,
        name: `Route to ${destination.name}`,
        points: routePoints,
        distance: routeData.distance.includes('km') ? 
          parseFloat(routeData.distance.replace(' km', '')) : 
          parseFloat(routeData.distance.replace('m', '')) / 1000, // Convert meters to km
        duration: Math.round(routeData.durationValue / 60), // Convert seconds to minutes
        safetyScore: 8,
        environmentalScore: 7,
        transportMode: transportMode,
        description: `Real-time route to ${destination.name} (${destination.type})`,
        color: '#3b82f6',
        polyline: routeData.polyline // Store the encoded polyline
      };

      // Add the new route to the list and select it
      const updatedRoutes = [...allRoutes, newRoute];
      setAllRoutes(updatedRoutes);
      setSelectedRoute(newRoute);
      
      console.log('Real route calculated:', newRoute);
    } catch (error) {
      console.error('Error calculating route:', error);
      // Fallback to simple route
      const simpleRoute: Route = {
        id: `route-${Date.now()}`,
        name: `Route to ${destination.name}`,
        points: [
          { 
            lat: userLocation.lat, 
            lng: userLocation.lng, 
            name: 'Your Location', 
            type: 'start', 
            safetyScore: 8, 
            environmentalScore: 7, 
            description: 'Starting point' 
          },
          { 
            lat: destination.lat, 
            lng: destination.lng, 
            name: destination.name, 
            type: 'end', 
            safetyScore: 8, 
            environmentalScore: 7, 
            description: destination.type 
          }
        ],
        distance: calculateDistance(userLocation, destination),
        duration: Math.round(calculateDistance(userLocation, destination) * 15),
        safetyScore: 8,
        environmentalScore: 7,
        transportMode: transportMode,
        description: `Route to ${destination.name} (${destination.type})`,
        color: '#3b82f6'
      };
      
      const updatedRoutes = [...allRoutes, simpleRoute];
      setAllRoutes(updatedRoutes);
      setSelectedRoute(simpleRoute);
    }
  };

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          setIsLoadingLocation(false);
          console.log('User location updated:', newLocation);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoadingLocation(false);
          // Keep default location
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      console.log('Geolocation not supported');
      setIsLoadingLocation(false);
    }
  };

  // Calculate distance between two points
  const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal place
  };

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full h-full flex">
      {/* Left Panel - Route Selection */}
      <div className="w-80 border-r bg-background/95 backdrop-blur overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Search Bar */}
          <div className="space-y-2 relative search-container">
            <div className="flex items-center gap-2 bg-muted rounded-lg p-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-sm flex-1"
              />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-primary text-primary-foreground' : ''}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Location Button */}
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={getUserLocation}
                disabled={isLoadingLocation}
                className="flex-1 text-xs"
              >
                {isLoadingLocation ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1" />
                ) : (
                  <MapPin className="h-3 w-3 mr-1" />
                )}
                {isLoadingLocation ? 'Getting Location...' : 'Get My Location'}
              </Button>
              <Badge variant="outline" className="text-xs">
                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </Badge>
            </div>

            {/* Search Results */}
            {showSearchResults && (
              <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg border max-h-80 overflow-y-auto">
                <CardContent className="p-2">
                  {isSearching ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2" />
                      <p className="text-sm">Searching destinations...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-1">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => handleDestinationSelect(result)}
                        >
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{result.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{result.type}</p>
                            {result.address && (
                              <p className="text-xs text-muted-foreground truncate">{result.address}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {result.distance && (
                              <Badge variant="secondary" className="text-xs">
                                {result.distance.toFixed(1)} km
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {result.lat.toFixed(3)}, {result.lng.toFixed(3)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No destinations found</p>
                      <p className="text-xs">Try a different search term</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="border-dashed">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Route Filters</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Safety Score (Min)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={filterOptions.safetyMin}
                        onChange={(e) => setFilterOptions(prev => ({ ...prev, safetyMin: parseInt(e.target.value) }))}
                        className="flex-1"
                      />
                      <span className="text-xs font-medium">{filterOptions.safetyMin}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground">Environmental Score (Min)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={filterOptions.environmentalMin}
                        onChange={(e) => setFilterOptions(prev => ({ ...prev, environmentalMin: parseInt(e.target.value) }))}
                        className="flex-1"
                      />
                      <span className="text-xs font-medium">{filterOptions.environmentalMin}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground">Max Distance (km)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={filterOptions.maxDistance}
                        onChange={(e) => setFilterOptions(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                        className="flex-1"
                      />
                      <span className="text-xs font-medium">{filterOptions.maxDistance}km</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground">Transport Mode</label>
                    <select
                      value={filterOptions.transportMode}
                      onChange={(e) => setFilterOptions(prev => ({ ...prev, transportMode: e.target.value as any }))}
                      className="w-full px-2 py-1 text-xs border rounded"
                    >
                      <option value="all">All Modes</option>
                      <option value="walking">Walking</option>
                      <option value="cycling">Cycling</option>
                      <option value="driving">Driving</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={filterOptions.preferGreen}
                        onChange={(e) => setFilterOptions(prev => ({ ...prev, preferGreen: e.target.checked }))}
                      />
                      Prefer Green Routes
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={filterOptions.preferQuiet}
                        onChange={(e) => setFilterOptions(prev => ({ ...prev, preferQuiet: e.target.checked }))}
                      />
                      Prefer Quiet Routes
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Route Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-primary" />
              <h3 className="font-medium">AI Suggested Routes</h3>
              <Badge variant="secondary" className="ml-auto">
                <Zap className="h-3 w-3 mr-1" />
                Smart
              </Badge>
            </div>
            
            {filteredRoutes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No routes match your filters</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setFilterOptions({
                    safetyMin: 7,
                    environmentalMin: 6,
                    maxDistance: 5,
                    maxDuration: 60,
                    transportMode: 'all',
                    avoidHighways: true,
                    preferGreen: true,
                    preferQuiet: false
                  })}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              filteredRoutes.map((route) => (
                <div 
                  key={route.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedRoute?.id === route.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedRoute(route)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{route.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {route.transportMode === 'walking' && <User className="h-3 w-3 mr-1" />}
                      {route.transportMode === 'cycling' && <Bike className="h-3 w-3 mr-1" />}
                      {route.transportMode === 'driving' && <Car className="h-3 w-3 mr-1" />}
                      {route.transportMode}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {route.duration} min
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {route.distance} km
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Shield className={`h-3 w-3 ${getSafetyColor(route.safetyScore)}`} />
                      <span className="text-xs">{route.safetyScore}/10</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Leaf className="h-3 w-3 text-green-500" />
                      <span className="text-xs">{route.environmentalScore}/10</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Environmental Data */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Environmental Data</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getAQIColor(environmentalData.aqi)}`} />
                <div>
                  <p className="font-medium">{environmentalData.aqi}</p>
                  <p className="text-xs text-muted-foreground">AQI</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <div>
                  <p className="font-medium">{environmentalData.temperature}°C</p>
                  <p className="text-xs text-muted-foreground">Temp</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-medium">{environmentalData.humidity}%</p>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{environmentalData.windSpeed} km/h</p>
                  <p className="text-xs text-muted-foreground">Wind</p>
                </div>
              </div>
            </div>

            {/* Weather Info */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                {getWeatherIcon(environmentalData.weatherIcon)}
                <span className="text-sm font-medium">{environmentalData.weather}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Feels like {environmentalData.temperature + 2}°C
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Visibility</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {environmentalData.visibility}/10
                </Badge>
              </div>
              <Progress value={environmentalData.visibility * 10} className="h-2" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                <Leaf className="h-3 w-3 mr-1" />
                Greenery: {environmentalData.greenery}/10
              </Badge>
              <Badge variant="outline" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Noise: {environmentalData.noise}/10
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative">
        {/* Interactive Map */}
        <div style={{ width: '100%', height: '100%' }}>
          <ClientMap selectedRoute={selectedRoute} userLocation={userLocation} />
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
          <div className="flex items-center gap-2 bg-background/95 backdrop-blur rounded-lg shadow-lg border p-2">
            <Button 
              size="sm" 
              variant={isNavigating ? "destructive" : "default"}
              onClick={() => setIsNavigating(!isNavigating)}
            >
              {isNavigating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isNavigating ? 'Stop' : 'Start'} Navigation
            </Button>
            <Button size="sm" variant="outline">
              <Navigation className="h-4 w-4" />
              Recalculate
            </Button>
          </div>
        </div>

        {/* Route Details Panel */}
        {selectedRoute && (
          <div className="absolute bottom-4 left-4 z-[1000]">
            <Card className="w-80 shadow-lg border-0 bg-background/95 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Route className="h-4 w-4 text-primary" />
                  {selectedRoute.name}
                  <Badge variant="secondary" className="ml-auto">
                    <Zap className="h-3 w-3 mr-1" />
                    AI Optimized
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{selectedRoute.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{selectedRoute.duration} min</p>
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{selectedRoute.distance} km</p>
                      <p className="text-xs text-muted-foreground">Distance</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Safety Score</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {selectedRoute.safetyScore}/10
                    </Badge>
                  </div>
                  <Progress value={selectedRoute.safetyScore * 10} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Environmental Score</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {selectedRoute.environmentalScore}/10
                    </Badge>
                  </div>
                  <Progress value={selectedRoute.environmentalScore * 10} className="h-2" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Heart className="h-3 w-3 mr-1" />
                    Scenic
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Safe
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Efficient
                  </Badge>
                </div>

                <Button className="w-full" size="sm">
                  <Info className="h-4 w-4 mr-2" />
                  View Route Details
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 