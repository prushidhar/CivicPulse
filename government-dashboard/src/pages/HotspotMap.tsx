import React, { useEffect, useState } from 'react';
import Map, { Source, Layer, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { api, type Hotspot } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Layers, MapPin } from 'lucide-react';
import { cellToBoundary } from 'h3-js';

// Haversine formula to calculate distance between two lat/lon points in kilometers
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export default function HotspotMap() {
  const [hotspots, setHotspots] = useState<Hotspot[] | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  
  // Layer toggles
  const [showDensity, setShowDensity] = useState(true);
  const [showVulnerability, setShowVulnerability] = useState(false);

  const fetchHotspots = () => {
    api.getHotspots().then(setHotspots).catch(() => {});
  };

  useEffect(() => {
    fetchHotspots();
    const interval = setInterval(fetchHotspots, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleGeolocate = (e: any) => {
    const { latitude, longitude } = e.coords;
    setUserLocation({ lat: latitude, lon: longitude });
    
    // Automatically select the nearest hotspot
    if (hotspots && hotspots.length > 0) {
      let nearest = hotspots[0];
      let minDistance = getDistanceFromLatLonInKm(latitude, longitude, nearest.lat, nearest.lon);
      
      for (let i = 1; i < hotspots.length; i++) {
        const dist = getDistanceFromLatLonInKm(latitude, longitude, hotspots[i].lat, hotspots[i].lon);
        if (dist < minDistance) {
          minDistance = dist;
          nearest = hotspots[i];
        }
      }
      setSelectedHotspot(nearest);
    }
  };

  if (!hotspots) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/20 animate-pulse">
        <div className="text-muted-foreground flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin mb-4"></div>
          <p className="font-medium text-lg">Loading Live Hotspot Data...</p>
        </div>
      </div>
    );
  }

  const geoJsonData = {
    type: 'FeatureCollection',
    features: hotspots.map(h => ({
      type: 'Feature',
      geometry: { 
        type: 'Polygon', 
        coordinates: [cellToBoundary(h.h3Index, true)] 
      },
      properties: { ...h }
    }))
  };

  return (
    <div className="flex h-full w-full relative">
      {/* MapLibre Area */}
      <div className="flex-1 h-full w-full relative">
        <Map
          initialViewState={{
            longitude: -73.985,
            latitude: 40.748,
            zoom: 11
          }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          interactiveLayerIds={['hotspot-polygons']}
          onClick={(e) => {
            if (e.features && e.features.length > 0) {
              const feature = e.features[0];
              setSelectedHotspot(feature.properties as Hotspot);
            } else {
              setSelectedHotspot(null);
            }
          }}
          cursor={selectedHotspot ? 'pointer' : 'default'}
        >
          <NavigationControl position="top-left" />
          <GeolocateControl 
            position="top-left" 
            positionOptions={{ enableHighAccuracy: true }} 
            trackUserLocation={true} 
            showUserHeading={true} 
            showUserLocation={true}
            onGeolocate={handleGeolocate}
          />
          
          <Source id="hotspots" type="geojson" data={geoJsonData as any}>
            <Layer
              id="hotspot-polygons"
              type="fill"
              paint={{
                'fill-color': [
                  'match',
                  ['get', 'severity'],
                  'high', '#ef4444',
                  'medium', '#eab308',
                  'low', '#22c55e',
                  '#ccc'
                ],
                'fill-opacity': 0.6,
                'fill-outline-color': '#ffffff'
              }}
            />
          </Source>
        </Map>
        
        {/* Layer Toggles Panel */}
        <div className="absolute top-4 right-4 z-10 w-64 bg-background/95 backdrop-blur shadow-lg p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-2 mb-4">
            <Layers className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">Map Layers</h3>
          </div>
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input type="checkbox" checked={showDensity} onChange={(e) => setShowDensity(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
              <span>Population Density (H3)</span>
            </label>
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input type="checkbox" checked={showVulnerability} onChange={(e) => setShowVulnerability(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
              <span>Vulnerability Index</span>
            </label>
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary focus:ring-primary" />
              <span>Infrastructure Projects</span>
            </label>
          </div>
        </div>
      </div>

      {/* Details Side Panel */}
      <div className="w-96 h-full bg-background border-l border-border overflow-y-auto z-10 flex flex-col">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-lg font-semibold tracking-tight">Hotspot Inspector</h2>
          <p className="text-sm text-muted-foreground">Select a hotspot on the map to view deep-dive analytics.</p>
        </div>
        
        <div className="p-4 flex-1">
          {userLocation && (
            <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-primary">Citizen Location Detected</p>
                <p className="text-xs text-muted-foreground mt-0.5">Showing hotspots nearest to {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}</p>
              </div>
            </div>
          )}

          {selectedHotspot ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">Hotspot Node ({selectedHotspot.id})</CardTitle>
                  <Badge variant={selectedHotspot.severity === 'high' ? 'destructive' : selectedHotspot.severity === 'medium' ? 'warning' : 'default'}>
                    {selectedHotspot.severity} Severity
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Unique Reports</p>
                    <p className="text-lg font-semibold">{selectedHotspot.requestCount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Pop. Density</p>
                    <p className="text-lg font-semibold">{selectedHotspot.populationDensity.toLocaleString()}</p>
                  </div>
                  
                  {userLocation && (
                    <div className="space-y-1 col-span-2 p-2 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Distance from Citizen</p>
                      <p className="text-sm font-semibold">
                        {getDistanceFromLatLonInKm(userLocation.lat, userLocation.lon, selectedHotspot.lat, selectedHotspot.lon).toFixed(2)} km away
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">H3 Index</p>
                    <p className="text-sm font-mono mt-1 text-muted-foreground">{selectedHotspot.h3Index}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Location (Lat/Lon)</p>
                    <p className="text-sm font-mono mt-1 text-muted-foreground">{Number(selectedHotspot.lat).toFixed(4)}, {Number(selectedHotspot.lon).toFixed(4)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
              <p>No hotspot selected.</p>
              <p className="text-sm mt-1">Click a colored hexagon on the map to inspect.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
