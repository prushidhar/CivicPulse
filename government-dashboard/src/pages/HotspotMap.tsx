import React, { useEffect, useState } from 'react';
import Map, { Source, Layer, NavigationControl } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { api, type Hotspot } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Layers } from 'lucide-react';
import { cellToBoundary } from 'h3-js';

export default function HotspotMap() {
  const [hotspots, setHotspots] = useState<Hotspot[] | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  
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
