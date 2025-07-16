// API service for environmental data

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weather: string;
  weatherIcon: string;
  feelsLike: number;
}

interface AQIData {
  aqi: number;
  level: string;
  color: string;
  description: string;
}

interface EnvironmentalData {
  weather: WeatherData;
  aqi: AQIData;
  visibility: number;
  greenery: number;
  noise: number;
  safety: number;
}

// Mock data for development
const mockWeatherData: WeatherData = {
  temperature: 28,
  humidity: 65,
  windSpeed: 12,
  weather: 'Partly Cloudy',
  weatherIcon: 'cloud',
  feelsLike: 30
};

const mockAQIData: AQIData = {
  aqi: 45,
  level: 'Good',
  color: 'green',
  description: 'Air quality is good. Enjoy your outdoor activities.'
};

const mockEnvironmentalData: EnvironmentalData = {
  weather: mockWeatherData,
  aqi: mockAQIData,
  visibility: 8,
  greenery: 7,
  noise: 4,
  safety: 8
};

// Get AQI level and color
const getAQILevel = (aqi: number): { level: string; color: string; description: string } => {
  if (aqi <= 50) {
    return {
      level: 'Good',
      color: 'green',
      description: 'Air quality is good. Enjoy your outdoor activities.'
    };
  } else if (aqi <= 100) {
    return {
      level: 'Moderate',
      color: 'yellow',
      description: 'Air quality is acceptable. Sensitive individuals may experience symptoms.'
    };
  } else if (aqi <= 150) {
    return {
      level: 'Unhealthy for Sensitive Groups',
      color: 'orange',
      description: 'Members of sensitive groups may experience health effects.'
    };
  } else if (aqi <= 200) {
    return {
      level: 'Unhealthy',
      color: 'red',
      description: 'Everyone may begin to experience health effects.'
    };
  } else {
    return {
      level: 'Very Unhealthy',
      color: 'purple',
      description: 'Health warnings of emergency conditions.'
    };
  }
};

// Get weather icon
const getWeatherIcon = (weatherCode: string): string => {
  const iconMap: { [key: string]: string } = {
    '01d': 'sun',
    '01n': 'moon',
    '02d': 'cloud-sun',
    '02n': 'cloud-moon',
    '03d': 'cloud',
    '03n': 'cloud',
    '04d': 'cloud',
    '04n': 'cloud',
    '09d': 'cloud-rain',
    '09n': 'cloud-rain',
    '10d': 'cloud-rain',
    '10n': 'cloud-rain',
    '11d': 'cloud-lightning',
    '11n': 'cloud-lightning',
    '13d': 'cloud-snow',
    '13n': 'cloud-snow',
    '50d': 'cloud-fog',
    '50n': 'cloud-fog'
  };
  return iconMap[weatherCode] || 'cloud';
};

// Fetch weather data from OpenWeatherMap API
export const fetchWeatherData = async (city: string = 'Delhi'): Promise<WeatherData> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.log('OpenWeather API key not found, using mock data');
      return mockWeatherData;
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();
    
    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      weather: data.weather[0].main,
      weatherIcon: getWeatherIcon(data.weather[0].icon),
      feelsLike: Math.round(data.main.feels_like)
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return mockWeatherData;
  }
};

// Fetch AQI data from World Air Quality Index API
export const fetchAQIData = async (city: string = 'Delhi'): Promise<AQIData> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_WAQI_API_KEY;
    if (!apiKey) {
      console.log('WAQI API key not found, using mock data');
      return mockAQIData;
    }

    const response = await fetch(
      `https://api.waqi.info/feed/${city}/?token=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('AQI API request failed');
    }

    const data = await response.json();
    const aqi = data.data.aqi;
    const aqiInfo = getAQILevel(aqi);

    return {
      aqi,
      level: aqiInfo.level,
      color: aqiInfo.color,
      description: aqiInfo.description
    };
  } catch (error) {
    console.error('Error fetching AQI data:', error);
    return mockAQIData;
  }
};

// Fetch combined environmental data
export const fetchEnvironmentalData = async (city: string = 'Delhi'): Promise<EnvironmentalData> => {
  try {
    const [weatherData, aqiData] = await Promise.all([
      fetchWeatherData(city),
      fetchAQIData(city)
    ]);

    return {
      weather: weatherData,
      aqi: aqiData,
      visibility: Math.floor(Math.random() * 3) + 7, // 7-10
      greenery: Math.floor(Math.random() * 4) + 6, // 6-10
      noise: Math.floor(Math.random() * 4) + 2, // 2-6
      safety: Math.floor(Math.random() * 3) + 7 // 7-10
    };
  } catch (error) {
    console.error('Error fetching environmental data:', error);
    return mockEnvironmentalData;
  }
};

// Search for destinations/places using OpenStreetMap Nominatim API (FREE)
export const searchDestinations = async (query: string, userLocation?: { lat: number; lng: number }): Promise<any[]> => {
  try {
    // Build search parameters
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '15', // Increased limit for more results
      addressdetails: '1',
      extratags: '1',
      countrycodes: 'in', // Focus on India
      viewbox: userLocation ? `${userLocation.lng - 0.1},${userLocation.lat + 0.1},${userLocation.lng + 0.1},${userLocation.lat - 0.1}` : '',
      bounded: userLocation ? '1' : '0'
    });

    // Use OpenStreetMap Nominatim API for free search
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error('OpenStreetMap API request failed');
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      return data.map((place: any) => ({
        name: place.display_name.split(',')[0] || place.name || 'Unknown Location',
        type: place.type || 'place',
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
        address: place.display_name,
        rating: 4.0, // Default rating since OSM doesn't provide ratings
        placeId: place.place_id,
        osmType: place.osm_type,
        osmId: place.osm_id,
        distance: userLocation ? calculateDistance(userLocation, { lat: parseFloat(place.lat), lng: parseFloat(place.lon) }) : null
      }));
    } else {
      console.log('No results found, using mock data');
      return getMockSearchResults(query, userLocation);
    }
  } catch (error) {
    console.error('Error searching destinations:', error);
    return getMockSearchResults(query, userLocation);
  }
};

// Fallback mock data
const getMockSearchResults = (query: string, userLocation?: { lat: number; lng: number }): any[] => {
  const mockResults = [
    { name: 'Central Park', type: 'park', lat: 28.6145, lng: 77.2095, address: 'Central Park, Delhi', rating: 4.5 },
    { name: 'City Library', type: 'library', lat: 28.6142, lng: 77.2098, address: 'City Library, Delhi', rating: 4.2 },
    { name: 'Shopping Mall', type: 'mall', lat: 28.6148, lng: 77.2093, address: 'Shopping Mall, Delhi', rating: 4.0 },
    { name: 'Botanical Garden', type: 'garden', lat: 28.6150, lng: 77.2100, address: 'Botanical Garden, Delhi', rating: 4.7 },
    { name: 'Coffee Shop', type: 'cafe', lat: 28.6139, lng: 77.2090, address: 'Coffee Shop, Delhi', rating: 4.3 },
    { name: 'Metro Station', type: 'station', lat: 28.6140, lng: 77.2092, address: 'Metro Station, Delhi', rating: 4.1 },
    { name: 'Hospital', type: 'hospital', lat: 28.6143, lng: 77.2096, address: 'Hospital, Delhi', rating: 4.4 },
    { name: 'Restaurant', type: 'restaurant', lat: 28.6146, lng: 77.2094, address: 'Restaurant, Delhi', rating: 4.2 },
    { name: 'Bank', type: 'bank', lat: 28.6141, lng: 77.2097, address: 'Bank, Delhi', rating: 4.0 },
    { name: 'School', type: 'school', lat: 28.6147, lng: 77.2091, address: 'School, Delhi', rating: 4.3 }
  ];

  const searchQuery = query.toLowerCase().trim();
  const filteredResults = mockResults.filter(result => 
    result.name.toLowerCase().includes(searchQuery) ||
    result.type.toLowerCase().includes(searchQuery)
  );

  // Add distance if user location is available
  if (userLocation) {
    return filteredResults.map(result => ({
      ...result,
      distance: calculateDistance(userLocation, { lat: result.lat, lng: result.lng })
    }));
  }

  return filteredResults;
};

// Get route suggestions based on preferences
export const getRouteSuggestions = async (preferences: {
  safety: number;
  environmental: number;
  distance: number;
  transportMode: string;
}): Promise<any[]> => {
  try {
    // Mock route suggestions - replace with real routing API
    const mockRoutes = [
      {
        id: '1',
        name: 'Scenic Park Route',
        safetyScore: 9,
        environmentalScore: 8,
        distance: 2.3,
        duration: 28,
        transportMode: 'walking',
        description: 'Peaceful route through parks and quiet streets'
      },
      {
        id: '2',
        name: 'Quick Urban Route',
        safetyScore: 7,
        environmentalScore: 6,
        distance: 1.8,
        duration: 22,
        transportMode: 'walking',
        description: 'Fastest route through urban areas'
      },
      {
        id: '3',
        name: 'Green Corridor Route',
        safetyScore: 8,
        environmentalScore: 9,
        distance: 3.1,
        duration: 35,
        transportMode: 'walking',
        description: 'Maximum greenery and fresh air'
      }
    ];

    return mockRoutes.filter(route => 
      route.safetyScore >= preferences.safety &&
      route.environmentalScore >= preferences.environmental &&
      route.distance <= preferences.distance &&
      (preferences.transportMode === 'all' || route.transportMode === preferences.transportMode)
    );
  } catch (error) {
    console.error('Error getting route suggestions:', error);
    return [];
  }
}; 

// Get real route using OSRM (Open Source Routing Machine) API (FREE)
export const getRealRoute = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: 'walking' | 'cycling' | 'driving' = 'walking'
): Promise<any> => {
  try {
    // Map our modes to OSRM profiles
    const profile = mode === 'driving' ? 'driving' : mode === 'cycling' ? 'cycling' : 'walking';
    
    // Use OSRM API for free routing
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`
    );

    if (!response.ok) {
      throw new Error('OSRM API request failed');
    }

    const data = await response.json();
    
    if (data.code === 'Ok' && data.routes.length > 0) {
      const route = data.routes[0];
      const leg = route.legs[0];
      
      // Convert GeoJSON coordinates to [lat, lng] format
      const points = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      
      // Convert steps to our format
      const steps = leg.steps.map((step: any) => ({
        distance: { text: `${Math.round(step.distance)}m`, value: step.distance },
        duration: { text: `${Math.round(step.duration)}s`, value: step.duration },
        instruction: step.maneuver.instruction,
        maneuver: step.maneuver
      }));
      
      return {
        distance: `${Math.round(leg.distance)}m`,
        duration: `${Math.round(leg.duration)}s`,
        distanceValue: leg.distance, // meters
        durationValue: leg.duration, // seconds
        points: points,
        steps: steps,
        polyline: encodePolyline(points) // Convert back to polyline for compatibility
      };
    } else {
      console.error('OSRM API error:', data.message);
      return getMockRoute(origin, destination, mode);
    }
  } catch (error) {
    console.error('Error getting route:', error);
    return getMockRoute(origin, destination, mode);
  }
};

// Decode polyline (for compatibility with existing code)
const decodePolyline = (encoded: string): Array<[number, number]> => {
  const poly: Array<[number, number]> = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let shift = 0, result = 0;

    do {
      let b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (result >= 0x20);

    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      let b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (result >= 0x20);

    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    poly.push([lat / 1e5, lng / 1e5]);
  }

  return poly;
};

// Encode polyline (for compatibility with existing code)
const encodePolyline = (points: Array<[number, number]>): string => {
  let encoded = '';
  let lat = 0, lng = 0;

  for (const [pointLat, pointLng] of points) {
    const dLat = Math.round((pointLat - lat) * 1e5);
    const dLng = Math.round((pointLng - lng) * 1e5);
    
    lat = pointLat;
    lng = pointLng;
    
    encoded += encodeNumber(dLat) + encodeNumber(dLng);
  }
  
  return encoded;
};

const encodeNumber = (num: number): string => {
  let encoded = '';
  let value = num < 0 ? ~(num << 1) : (num << 1);
  
  while (value >= 0x20) {
    encoded += String.fromCharCode(((value & 0x1f) | 0x20) + 63);
    value >>= 5;
  }
  
  encoded += String.fromCharCode(value + 63);
  return encoded;
};

// Fallback mock route
const getMockRoute = (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, mode: string) => {
  const distance = calculateDistance(origin, destination);
  const duration = Math.round(distance * (mode === 'walking' ? 15 : mode === 'cycling' ? 5 : 2));
  
  return {
    distance: `${distance} km`,
    duration: `${duration} min`,
    distanceValue: distance * 1000,
    durationValue: duration * 60,
    points: [[origin.lat, origin.lng], [destination.lat, destination.lng]],
    steps: [],
    polyline: ''
  };
};

// Calculate distance between two points (Haversine formula)
const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
}; 