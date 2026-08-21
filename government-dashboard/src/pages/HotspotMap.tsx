import React, { useEffect, useState, useMemo } from 'react';
import Map, { Source, Layer, NavigationControl, GeolocateControl, Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Layers, MapPin, Globe, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

export default function HotspotMap() {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showPoints, setShowPoints] = useState(true);

  useEffect(() => {
    // Fetch live requests from the backend
    api.getRequests().then(data => {
      // Filter out requests without coordinates
      const valid = (Array.isArray(data) ? data : data.items || []).filter(
        (r: any) => r.latitude && r.longitude
      );
      setRequests(valid);
    }).catch(console.error);
  }, []);

  const geojson = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: requests.map(r => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [r.longitude, r.latitude]
        },
        properties: {
          ...r,
          weight: r.severity === 'high' || r.severity === 'critical' ? 1.0 : r.severity === 'medium' ? 0.6 : 0.2
        }
      }))
    };
  }, [requests]);

  return (
    <div className="flex h-full w-full relative">
      {/* MapLibre Area */}
      <div className="flex-1 h-full w-full relative bg-[#eef1f4]">
        <Map
          initialViewState={{
            longitude: 77.2090, // Center on India
            latitude: 28.6139,
            zoom: 4.5
          }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          interactiveLayerIds={['report-points']}
          onClick={(e) => {
            if (e.features && e.features.length > 0) {
              setSelectedReport(e.features[0].properties);
            } else {
              setSelectedReport(null);
            }
          }}
          cursor="pointer"
        >
          <NavigationControl position="top-left" />
          <GeolocateControl position="top-left" />
          
          <Source id="reports" type="geojson" data={geojson as any}>
            {/* Heatmap Layer */}
            {showHeatmap && (
              <Layer
                id="report-heatmap"
                type="heatmap"
                paint={{
                  'heatmap-weight': ['get', 'weight'],
                  'heatmap-intensity': 1,
                  'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0, 'rgba(33,102,172,0)',
                    0.2, 'rgb(103,169,207)',
                    0.4, 'rgb(209,229,240)',
                    0.6, 'rgb(253,219,199)',
                    0.8, 'rgb(239,138,98)',
                    1, 'rgb(178,24,43)'
                  ],
                  'heatmap-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 2,
                    9, 20
                  ],
                  'heatmap-opacity': 0.8
                }}
              />
            )}
            
            {/* Points Layer */}
            {showPoints && (
              <Layer
                id="report-points"
                type="circle"
                paint={{
                  'circle-radius': 6,
                  'circle-color': [
                    'match',
                    ['get', 'severity'],
                    'critical', '#dc2626',
                    'high', '#ef4444',
                    'medium', '#f59e0b',
                    'low', '#10b981',
                    /* other */ '#6b7280'
                  ],
                  'circle-stroke-color': '#ffffff',
                  'circle-stroke-width': 2,
                  'circle-opacity': showHeatmap ? 0.7 : 1
                }}
              />
            )}
          </Source>
        </Map>
        
        {/* Layer Toggles Panel */}
        <div className="absolute top-4 right-4 z-10 w-64 bg-white/95 backdrop-blur shadow-lg p-4 rounded-xl border border-border/50">
          <div className="flex items-center space-x-2 mb-4">
            <Layers className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">Map Layers</h3>
          </div>
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input type="checkbox" checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
              <span>Density Heatmap</span>
            </label>
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input type="checkbox" checked={showPoints} onChange={(e) => setShowPoints(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
              <span>Live Reports</span>
            </label>
          </div>
        </div>
      </div>

      {/* Details Side Panel */}
      <div className="w-96 h-full bg-white border-l border-border/50 overflow-y-auto z-10 flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 border-b border-border/50 bg-muted/20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center">
            <Globe className="w-5 h-5 mr-2 text-primary" />
            Live Hotspot Tracker
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time citizen reports across India. Click any point to view details.</p>
        </div>
        
        <div className="p-6 flex-1 bg-muted/5">
          {selectedReport ? (
            <Card className="bg-white shadow-sm border-border/50">
              <CardHeader className="pb-3 border-b border-border/30">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold">{selectedReport.request_id.split('-')[0].toUpperCase()}</CardTitle>
                  <Badge variant={selectedReport.severity === 'high' || selectedReport.severity === 'critical' ? 'destructive' : selectedReport.severity === 'medium' ? 'warning' : 'success'}>
                    {(selectedReport.severity || 'low').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</p>
                  <p className="text-sm font-bold capitalize">{selectedReport.category}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</p>
                  <p className="text-sm">{selectedReport.original_text || selectedReport.description}</p>
                </div>

                <div className="space-y-2 bg-purple-50 p-3 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> AI Analysis
                  </p>
                  <p className="text-xs font-medium text-purple-900">
                    {selectedReport.transcript ? (
                      selectedReport.transcript.includes('Recommended Action:') 
                      ? selectedReport.transcript.split('Recommended Action:')[1]
                      : selectedReport.transcript
                    ) : 'Pending AI Review'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reporter</p>
                    <p className="text-xs font-medium">{selectedReport.citizen_name || 'Anonymous'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
                    <p className="text-xs font-medium capitalize">{selectedReport.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground bg-white border-2 border-dashed border-border/60 rounded-2xl">
              <MapPin className="w-8 h-8 mb-3 text-muted-foreground/50" />
              <p className="font-medium text-foreground">No report selected.</p>
              <p className="text-sm mt-1 max-w-[200px]">Click a colored point on the map to inspect the citizen report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
