import React, { useEffect, useState } from 'react';
import Map, { Source, Layer, NavigationControl } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { api, type Hotspot } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Layers } from 'lucide-react';

export default function HotspotMap() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  
  // Layer toggles
  const [showDensity, setShowDensity] = useState(true);
  const [showVulnerability, setShowVulnerability] = useState(false);

  useEffect(() => {
    api.getHotspots().then(setHotspots);
  }, []);

  const geoJsonData = {
    type: 'FeatureCollection',
    features: hotspots.map(h => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: h.coordinates },
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
        >
          <NavigationControl position="top-left" />
          
          <Source id="hotspots" type="geojson" data={geoJsonData as any}>
            <Layer
              id="hotspot-points"
              type="circle"
              paint={{
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 8, 15, 20],
                'circle-color': [
                  'match',
                  ['get', 'severity'],
                  'high', '#ef4444',
                  'medium', '#eab308',
                  'low', '#22c55e',
                  '#ccc'
                ],
                'circle-opacity': 0.8,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
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
          {/* For demo, we just show the first hotspot if none selected, or a prompt */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">Sector 4 Node (HS-1)</CardTitle>
                <Badge variant="destructive">High Severity</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Unique Reports</p>
                  <p className="text-lg font-semibold">452</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Pop. Density</p>
                  <p className="text-lg font-semibold">12,000</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Coverage Score</p>
                  <p className="text-lg font-semibold text-yellow-600">45%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-lg font-semibold text-green-600">92%</p>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-2">Underlying Citizen Reports</h4>
                <div className="space-y-2">
                  <div className="p-2 text-xs bg-muted rounded-md border border-border">
                    <span className="font-semibold text-primary">Rep-092:</span> "No water for 48 hours..."
                  </div>
                  <div className="p-2 text-xs bg-muted rounded-md border border-border">
                    <span className="font-semibold text-primary">Rep-114:</span> "Low pressure across block C."
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
