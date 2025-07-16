'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Compass, Layers, RotateCcw } from 'lucide-react'

// Dynamically import Leaflet components
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
)

// Map Controls Component - using ref-based approach
function MapControls({ mapRef }: { mapRef: any }) {
  const centerOnUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          mapRef.current?.setView([position.coords.latitude, position.coords.longitude], 15);
        },
        () => {
          mapRef.current?.setView([28.6139, 77.2090], 13); // Delhi fallback
        }
      );
    }
  };

  return (
    <div className="absolute top-4 right-4 space-y-2 z-[1000]">
      <Button size="sm" variant="secondary" className="shadow-lg" onClick={centerOnUser}>
        <Compass className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="secondary" className="shadow-lg">
        <Layers className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="secondary" className="shadow-lg">
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface ClientMapProps {
  selectedRoute: any;
  userLocation?: { lat: number; lng: number };
  onMapLoad?: () => void;
}

export default function ClientMap({ selectedRoute, userLocation, onMapLoad }: ClientMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [L, setL] = useState<any>(null)
  const mapRef = useRef<any>(null)
  
  useEffect(() => {
    setIsClient(true)
    // Dynamically import Leaflet
    import('leaflet').then((leaflet) => {
      // Fix default marker icon issue in Next.js
      // @ts-ignore
      delete leaflet.Icon.Default.prototype._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setL(leaflet)
    })
    
    // Leaflet CSS is imported in globals.css
  }, [])
  
  if (!isClient || !L) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  // Custom marker icons
  const createCustomIcon = (color: string) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Decode Google polyline
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

  return (
    <MapContainer 
      center={[28.6139, 77.2090]} 
      zoom={13} 
      style={{ width: '100%', height: '100%' }}
      className="z-0"
      whenReady={() => {
        onMapLoad?.();
      }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Render selected route */}
      {selectedRoute && (
        <Polyline
          positions={selectedRoute.polyline ? decodePolyline(selectedRoute.polyline) : selectedRoute.points.map((p: any) => [p.lat, p.lng])}
          color={selectedRoute.color}
          weight={4}
          opacity={0.8}
        />
      )}

      {/* Render route points */}
      {selectedRoute?.points.map((point: any, index: number) => (
        <Marker 
          key={index}
          position={[point.lat, point.lng]}
          icon={point.type === 'start' ? createCustomIcon('green') : 
                point.type === 'end' ? createCustomIcon('red') : 
                createCustomIcon('blue')}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">{point.name}</h3>
              <p className="text-sm text-gray-600">{point.description}</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs">Safety: {point.safetyScore}/10</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Environment: {point.environmentalScore}/10</span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* User Location Marker */}
      {userLocation && (
        <Marker 
          position={[userLocation.lat, userLocation.lng]}
          icon={createCustomIcon('blue')}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">Your Location</h3>
              <p className="text-sm text-gray-600">Starting point for routes</p>
              <div className="mt-2 text-xs text-muted-foreground">
                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>
      )}

      <MapControls mapRef={mapRef} />
    </MapContainer>
  )
} 