import React, { useEffect, useState } from 'react';
import Map, { Source, Layer, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { api, type Hotspot } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Layers, MapPin, Hexagon } from 'lucide-react';
import { cellToBoundary } from 'h3-js';

// Legend mapping auto-detected severity categories to a yellow-to-red gradient
const SEVERITY_COLORS = {
  high: '#db1e25',   // Red
  medium: '#f59223', // Orange
  low: '#fcfb26'     // Yellow
};

export default function HotspotMap() {
  const [hotspots, setHotspots] = useState<Hotspot[] | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);

  // Layer toggles
  const [showHotspots, setShowHotspots] = useState(true);

  const fetchHotspots = () => {
    api.getHotspots().then(setHotspots).catch(() => setHotspots([]));
  };

  useEffect(() => {
    fetchHotspots();
    const interval = setInterval(fetchHotspots, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleGeolocate = (e: any) => {
    const { latitude, longitude } = e.coords;
    setUserLocation({ lat: latitude, lon: longitude });
  };

  if (!hotspots) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/20 animate-pulse">
        <div className="text-muted-foreground flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin mb-4"></div>
          <p className="font-medium text-lg">Loading Local Hotspots...</p>
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
      <div className="flex-1 h-full w-full relative bg-[#eef1f4]">
        <Map
          initialViewState={{
            longitude: -73.985,
            latitude: 40.748,
            zoom: 11
          }}
          mapStyle="https://basemaps.cartocdn.com/gl/light-nolabels-gl-style/style.json"
          interactiveLayerIds={['hotspot-fills']}
          onClick={(e) => {
            if (e.features && e.features.length > 0) {
              setSelectedHotspot(e.features[0].properties as Hotspot);
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
          
          {showHotspots && (
            <Source id="hotspots" type="geojson" data={geoJsonData as any}>
              {/* Outline layer for hexes */}
              <Layer
                id="hotspot-borders"
                type="line"
                paint={{
                  'line-color': '#000000',
                  'line-width': 1,
                  'line-opacity': 0.2
                }}
              />
              {/* Fill layer for hotspots based on category */}
              <Layer
                id="hotspot-fills"
                type="fill"
                paint={{
                  'fill-color': [
                    'match',
                    ['get', 'severity'],
                    'high', SEVERITY_COLORS.high,
                    'medium', SEVERITY_COLORS.medium,
                    'low', SEVERITY_COLORS.low,
                    '#ccc'
                  ],
                  'fill-opacity': 0.8
                }}
              />
            </Source>
          )}
        </Map>
        
        {/* Layer Toggles Panel */}
        <div className="absolute top-4 right-4 z-10 w-64 bg-white/95 backdrop-blur shadow-lg p-4 rounded-xl border border-border/50">
          <div className="flex items-center space-x-2 mb-4">
            <Layers className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">Map Layers</h3>
          </div>
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input type="checkbox" checked={showHotspots} onChange={(e) => setShowHotspots(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
              <span>Auto-Detected Hotspots</span>
            </label>
          </div>
        </div>

        {/* Legend Panel */}
        <div className="absolute bottom-6 right-6 z-10 bg-white/90 backdrop-blur shadow-lg p-4 rounded-xl border border-border/50 text-sm">
          <div className="font-semibold mb-3 text-xs text-muted-foreground uppercase tracking-wider">Severity Category</div>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-3 shadow-sm border border-black/10" style={{ backgroundColor: SEVERITY_COLORS.high }} />
              <span className="text-xs font-medium text-foreground">High Priority</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-3 shadow-sm border border-black/10" style={{ backgroundColor: SEVERITY_COLORS.medium }} />
              <span className="text-xs font-medium text-foreground">Medium Priority</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-3 shadow-sm border border-black/10" style={{ backgroundColor: SEVERITY_COLORS.low }} />
              <span className="text-xs font-medium text-foreground">Low Priority</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Side Panel */}
      <div className="w-96 h-full bg-white border-l border-border/50 overflow-y-auto z-10 flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 border-b border-border/50 bg-muted/20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center">
            <Hexagon className="w-5 h-5 mr-2 text-primary" />
            Hotspot Inspector
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Select an auto-detected hotspot to view active citizen reports.</p>
        </div>
        
        <div className="p-6 flex-1 bg-muted/5">
          {selectedHotspot ? (
            <Card className="bg-white shadow-sm border-border/50">
              <CardHeader className="pb-3 border-b border-border/30">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold">Node {selectedHotspot.id}</CardTitle>
                  <Badge 
                    style={{ 
                      backgroundColor: SEVERITY_COLORS[selectedHotspot.severity as keyof typeof SEVERITY_COLORS],
                      color: selectedHotspot.severity === 'low' ? 'black' : 'white'
                    }}
                  >
                    {selectedHotspot.severity.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reports</p>
                    <p className="text-base font-medium">{selectedHotspot.requestCount}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pop. Density</p>
                    <p className="text-base font-medium">{selectedHotspot.populationDensity.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">H3 Index Location</p>
                    <p className="text-sm font-mono text-muted-foreground">{selectedHotspot.h3Index}</p>
                    <p className="text-sm font-mono mt-1 text-muted-foreground">{Number(selectedHotspot.lat).toFixed(4)}, {Number(selectedHotspot.lon).toFixed(4)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground bg-white border-2 border-dashed border-border/60 rounded-2xl">
              <MapPin className="w-8 h-8 mb-3 text-muted-foreground/50" />
              <p className="font-medium text-foreground">No hotspot selected.</p>
              <p className="text-sm mt-1 max-w-[200px]">Click a colored hex on the map to inspect its data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
