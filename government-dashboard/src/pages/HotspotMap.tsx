import React, { useEffect, useState, useMemo } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Layers, MapPin, Globe, AlertTriangle, Activity } from 'lucide-react';
import { api } from '@/lib/api';

export default function HotspotMap() {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [showPoints, setShowPoints] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  const filteredRequests = useMemo(() => {
    if (!filter) return requests;
    if (filter === 'critical') return requests.filter(r => (r.severity || '').toLowerCase() === 'critical');
    if (filter === '24h') {
      const now = new Date();
      return requests.filter(r => r.created_at && (now.getTime() - new Date(r.created_at).getTime() < 86400000));
    }
    if (filter === 'roads') return requests.filter(r => {
      const cat = (r.category || '').toLowerCase();
      const desc = (r.description || '').toLowerCase();
      const txt = (r.original_text || '').toLowerCase();
      return cat.includes('road') || cat.includes('pothole') || desc.includes('road') || txt.includes('road');
    });
    if (filter === 'unassigned') return requests.filter(r => (r.status || '').toLowerCase() === 'pending');
    return requests;
  }, [requests, filter]);

  useEffect(() => {
    api.getRequests().then(data => {
      const valid = (Array.isArray(data) ? data : data.items || []).filter(
        (r: any) => r.latitude && r.longitude
      );
      setRequests(valid);
    }).catch(console.error);
  }, []);

  const getColor = (severity: string) => {
    switch((severity || '').toLowerCase()) {
      case 'critical': return '#EA4335';
      case 'high': return '#EA4335';
      case 'medium': return '#FBBC04';
      case 'low': return '#34A853';
      default: return '#4285F4';
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[600px] w-full relative rounded-2xl overflow-hidden border border-border/50 shadow-sm">
      <div className="flex-1 h-full w-full relative bg-[#eef1f4]">
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
          <Map
            style={{ width: '100%', height: '100%' }}
            defaultCenter={{ lat: 28.6139, lng: 77.2090 }}
            defaultZoom={4.5}
            disableDefaultUI={true}
            zoomControl={true}
          >
              {showPoints && filteredRequests.map((r) => (
                <Marker 
                  key={r.request_id || `${r.latitude}-${r.longitude}`}
                  position={{ lat: r.latitude, lng: r.longitude }}
                  onClick={() => setSelectedReport(r)}
                />
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
              <input type="checkbox" checked={showPoints} onChange={(e) => setShowPoints(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
              <span>Live Reports</span>
            </label>
          </div>
        </div>
      </div>

      {/* Details Side Panel */}
      <div className="w-[400px] h-full bg-white/70 backdrop-blur-3xl border-l border-white overflow-y-auto z-10 flex flex-col shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-purple-50/50 pointer-events-none -z-10" />
        
        <div className="p-6 border-b border-border/30 bg-white/40 sticky top-0 backdrop-blur-xl z-20">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-900/20">
              <Globe className="w-6 h-6 text-white" />
            </div>
            Hotspot Tracker
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-3 leading-relaxed">Real-time civic intelligence mapping. Click active points to investigate.</p>
        </div>
        
        <div className="p-6 flex-1 space-y-6">
          {selectedReport ? (
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden animate-in slide-in-from-right-8 duration-300">
              <div className="p-6 border-b border-gray-50 flex justify-between items-start bg-gradient-to-r from-gray-50 to-white">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Incident ID</p>
                  <h3 className="text-xl font-extrabold text-gray-900">{selectedReport.request_id.split('-')[0].toUpperCase()}</h3>
                </div>
                <Badge className={`px-3 py-1 font-bold shadow-sm ${
                  (selectedReport.severity || '').toLowerCase() === 'critical' ? 'bg-red-500 text-white' : 
                  (selectedReport.severity || '').toLowerCase() === 'high' ? 'bg-orange-500 text-white' : 
                  (selectedReport.severity || '').toLowerCase() === 'medium' ? 'bg-yellow-500 text-white' : 
                  'bg-green-500 text-white'
                }`}>
                  {(selectedReport.severity || 'low').toUpperCase()}
                </Badge>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Layers className="w-3 h-3"/> Category</p>
                  <p className="text-sm font-bold text-gray-900 capitalize bg-gray-50 inline-block px-3 py-1 rounded-lg border border-gray-100">{selectedReport.category}</p>
                </div>
                
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium bg-gray-50 p-4 rounded-xl border border-gray-100">{selectedReport.original_text || selectedReport.description}</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-fuchsia-50 p-5 rounded-2xl border border-purple-100 shadow-inner relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-all"></div>
                  <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest flex items-center gap-1.5 mb-2 relative z-10">
                    <Activity className="w-4 h-4 text-indigo-600" /> AI Diagnostic
                  </p>
                  <p className="text-sm font-bold text-indigo-950 relative z-10 leading-relaxed">
                    {selectedReport.transcript ? (
                      selectedReport.transcript.includes('Recommended Action:') 
                      ? selectedReport.transcript.split('Recommended Action:')[1]
                      : selectedReport.transcript
                    ) : 'Pending AI Review'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Reporter</p>
                    <p className="text-sm font-bold text-gray-900">{selectedReport.citizen_name || 'Anonymous'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-sm font-bold text-gray-900 capitalize flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {selectedReport.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center text-muted-foreground p-8 flex flex-col items-center bg-white border border-dashed rounded-xl border-border/70">
                <MapPin className="w-10 h-10 mb-3 text-muted" />
                <p className="text-sm">Select a hotspot on the map to view details, automated severity assessments, and AI recommendations.</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Map Layers</h3>
                <div className="space-y-3 bg-white p-4 rounded-xl border border-border/50">
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
                  <button onClick={() => setFilter(filter === 'critical' ? null : 'critical')} className={`text-xs py-2 font-bold rounded-md border transition ${filter === 'critical' ? 'bg-destructive text-white border-destructive' : 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'}`}>Critical Only</button>
                  <button onClick={() => setFilter(filter === '24h' ? null : '24h')} className={`text-xs py-2 font-bold rounded-md border transition ${filter === '24h' ? 'bg-primary text-white border-primary' : 'bg-white border-border text-muted-foreground hover:bg-muted'}`}>Last 24 Hours</button>
                  <button onClick={() => setFilter(filter === 'roads' ? null : 'roads')} className={`text-xs py-2 font-bold rounded-md border transition ${filter === 'roads' ? 'bg-primary text-white border-primary' : 'bg-white border-border text-muted-foreground hover:bg-muted'}`}>Road Hazards</button>
                  <button onClick={() => setFilter(filter === 'unassigned' ? null : 'unassigned')} className={`text-xs py-2 font-bold rounded-md border transition ${filter === 'unassigned' ? 'bg-primary text-white border-primary' : 'bg-white border-border text-muted-foreground hover:bg-muted'}`}>Unassigned</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
