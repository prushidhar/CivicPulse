import React, { useEffect, useState, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Layers, MapPin, Globe, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

const HeatmapLayer = ({ data, visible }: { data: any[], visible: boolean }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !(window as any).google) return;
    const heatmap = new (window as any).google.maps.visualization.HeatmapLayer({
      data: data.map(pt => ({
        location: new (window as any).google.maps.LatLng(pt.latitude, pt.longitude),
        weight: pt.weight
      })),
      radius: 20,
      opacity: 0.8
    });
    heatmap.setMap(visible ? map : null);
    return () => heatmap.setMap(null);
  }, [map, data, visible]);
  return null;
};

export default function HotspotMap() {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showPoints, setShowPoints] = useState(true);

  useEffect(() => {
    api.getRequests().then(data => {
      const valid = (Array.isArray(data) ? data : data.items || []).filter(
        (r: any) => r.latitude && r.longitude
      );
      setRequests(valid);
    }).catch(console.error);
  }, []);

  const heatmapData = useMemo(() => {
    return requests.map(r => ({
      ...r,
      weight: r.severity === 'high' || r.severity === 'critical' ? 1.0 : r.severity === 'medium' ? 0.6 : 0.2
    }));
  }, [requests]);

  const getColor = (severity: string) => {
    switch(severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="flex h-full w-full relative">
      <div className="flex-1 h-full w-full relative bg-[#eef1f4]">
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''} libraries={['visualization']}>
          <Map
            defaultCenter={{ lat: 28.6139, lng: 77.2090 }}
            defaultZoom={4.5}
            mapId="DEMO_MAP_ID"
            disableDefaultUI={true}
            zoomControl={true}
          >
            <HeatmapLayer data={heatmapData} visible={showHeatmap} />
            
            {showPoints && requests.map((r, i) => (
              <AdvancedMarker 
                key={i}
                position={{ lat: r.latitude, lng: r.longitude }}
                onClick={() => setSelectedReport(r)}
              >
                <div style={{
                  width: '12px', height: '12px', borderRadius: '50%',
                  backgroundColor: getColor(r.severity),
                  border: '2px solid white',
                  boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                  opacity: showHeatmap ? 0.7 : 1
                }} />
              </AdvancedMarker>
            ))}
          </Map>
        </APIProvider>
        
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
            <div className="space-y-6">
              <div className="text-center text-muted-foreground p-8 flex flex-col items-center bg-white border border-dashed rounded-xl border-border/70">
                <MapPin className="w-10 h-10 mb-3 text-muted" />
                <p className="text-sm">Select a hotspot on the map to view details, automated severity assessments, and AI recommendations.</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Map Layers</h3>
                <div className="space-y-3 bg-white p-4 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowHeatmap(!showHeatmap)}>
                    <label className="text-sm font-medium cursor-pointer">Density Heatmap</label>
                    <input type="checkbox" checked={showHeatmap} readOnly className="w-4 h-4 rounded text-primary focus:ring-primary" />
                  </div>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowPoints(!showPoints)}>
                    <label className="text-sm font-medium cursor-pointer">Citizen Report Points</label>
                    <input type="checkbox" checked={showPoints} readOnly className="w-4 h-4 rounded text-primary focus:ring-primary" />
                  </div>
                  <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                    <label className="text-sm font-medium cursor-not-allowed">IoT Sensor Data (Beta)</label>
                    <input type="checkbox" disabled className="w-4 h-4 rounded" />
                  </div>
                  <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                    <label className="text-sm font-medium cursor-not-allowed">Live Traffic Alerts</label>
                    <input type="checkbox" disabled className="w-4 h-4 rounded" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Quick Filters</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="text-xs py-2 bg-destructive/10 text-destructive font-bold rounded-md border border-destructive/20 hover:bg-destructive/20 transition">Critical Only</button>
                  <button className="text-xs py-2 bg-white border border-border font-bold rounded-md text-muted-foreground hover:bg-muted transition">Last 24 Hours</button>
                  <button className="text-xs py-2 bg-white border border-border font-bold rounded-md text-muted-foreground hover:bg-muted transition">Road Hazards</button>
                  <button className="text-xs py-2 bg-white border border-border font-bold rounded-md text-muted-foreground hover:bg-muted transition">Unassigned</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
