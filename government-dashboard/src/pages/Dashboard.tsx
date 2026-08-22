import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Activity, AlertTriangle, FileCheck, Target, MessageSquare, Bot, Clock, Zap, Map } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { APIProvider, Map as GoogleMap, AdvancedMarker } from '@vis.gl/react-google-maps';

const CountUp = ({ end, duration = 1000, suffix = "" }: { end: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart formula for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return <>{count.toLocaleString()}{suffix}</>;
};

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = () => {
    Promise.all([
      api.getHotspots().catch(() => []),
      api.getRecommendations().catch(() => []),
      api.getImpact().catch(() => ({ estimatedPopulationReached: 0 })),
      api.getRequests ? api.getRequests().catch(() => []) : Promise.resolve([])
    ]).then(([hotspots, recommendations, impact, requests]) => {
      const openReqs = requests.filter((r: any) => {
        const s = (r.status || '').toLowerCase();
        return s === 'open' || s === 'pending' || s === 'processing' || s === 'accepted';
      }).length;
      const closedReqs = requests.filter((r: any) => {
        const s = (r.status || '').toLowerCase();
        return s === 'closed' || s === 'resolved' || s === 'rejected';
      }).length;
      const totalReqs = requests.length || 1; // avoid division by zero
      
      setStats({
        activeHotspots: hotspots.length,
        pendingReviews: recommendations.filter((r: any) => r.status === 'pending').length,
        priorityRecs: recommendations.filter((r: any) => r.priorityScore > 80).length,
        impact: Array.isArray(impact) ? impact.reduce((sum: number, item: any) => sum + (item.estimatedPopulationReached || 0), 0) : (impact?.estimatedPopulationReached || 0),
        openRequests: openReqs,
        resolvedRequests: closedReqs,
        resolutionRate: ((closedReqs / totalReqs) * 100).toFixed(1),
        recentRequests: requests.slice(0, 5)
      });
      setError(null);
    }).catch((err) => {
      setError("Failed to fetch dashboard data.");
    });
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="space-y-8 animate-pulse mt-4">
        <div className="h-10 bg-muted rounded w-1/4 mb-6"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="bg-white border-none shadow-sm">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-2">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1">Live metrics generated from actual citizen reports.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => {
              alert('Generating comprehensive PDF report... (Demo Mode)');
            }}
            className="px-4 py-2 bg-white border border-border/50 shadow-sm rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            Export Report
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error} Backend API might be unreachable.
        </div>
      )}

      {/* Citizen Report Metrics */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-[#4285F4]" />
          Citizen Reporting Metrics
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-white hover:shadow-md transition-shadow border-t-4 border-t-[#34A853]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-[#34A853]/10 flex items-center justify-center shadow-sm text-[#34A853]">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Overall Resolution Rate</p>
              <h3 className="text-3xl font-extrabold mt-1">{stats.resolutionRate}%</h3>
            </CardContent>
          </Card>
          
          <Card className="bg-white hover:shadow-md transition-shadow border-t-4 border-t-[#EA4335]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-[#EA4335]/10 flex items-center justify-center text-[#EA4335]">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Unresolved Open Reports</p>
              <h3 className="text-3xl font-extrabold mt-1">{stats.openRequests}</h3>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-shadow border-t-4 border-t-[#4285F4]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-[#4285F4]/10 flex items-center justify-center text-[#4285F4]">
                  <FileCheck className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Total Resolved</p>
              <h3 className="text-3xl font-extrabold mt-1">{stats.resolvedRequests}</h3>
            </CardContent>
          </Card>
        </div>
      </div>

      <hr className="border-border/50" />

      {/* Field Operations Metrics */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-[#FBBC04]" />
          Field Operations
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white hover:shadow-sm transition-shadow">
            <CardContent className="p-5 flex items-center space-x-4">
              <div className="p-3 bg-[#EA4335]/10 text-[#EA4335] rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Hotspots</p>
                <h3 className="text-2xl font-bold"><CountUp end={stats.activeHotspots} /></h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-sm transition-shadow">
            <CardContent className="p-5 flex items-center space-x-4">
              <div className="p-3 bg-[#4285F4]/10 text-[#4285F4] rounded-xl">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Priority Recs</p>
                <h3 className="text-2xl font-bold"><CountUp end={stats.priorityRecs} /></h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-sm transition-shadow">
            <CardContent className="p-5 flex items-center space-x-4">
              <div className="p-3 bg-[#FBBC04]/10 text-[#FBBC04] rounded-xl">
                <FileCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                <h3 className="text-2xl font-bold"><CountUp end={stats.pendingReviews} /></h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-sm transition-shadow">
            <CardContent className="p-5 flex items-center space-x-4">
              <div className="p-3 bg-[#34A853]/10 text-[#34A853] rounded-xl">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Est. Impact</p>
                <h3 className="text-2xl font-bold"><CountUp end={stats.impact} /></h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-2 bg-white">
          <CardHeader>
            <CardTitle>Report Geography</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full rounded-xl overflow-hidden border border-border/60">
              <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
                <GoogleMap
                  defaultCenter={{ lat: 28.6139, lng: 77.2090 }}
                  defaultZoom={4}
                  mapId="DEMO_MAP_ID"
                  disableDefaultUI={true}
                >
                  {stats.recentRequests && stats.recentRequests.map((r: any, i: number) => (
                    r.latitude && r.longitude && (
                      <AdvancedMarker key={i} position={{ lat: r.latitude, lng: r.longitude }}>
                        <div style={{
                          width: '10px', height: '10px', borderRadius: '50%',
                          backgroundColor: (r.severity || '').toLowerCase() === 'critical' ? '#ef4444' : (r.severity || '').toLowerCase() === 'high' ? '#f97316' : '#3b82f6',
                          border: '2px solid white',
                          boxShadow: '0 0 4px rgba(0,0,0,0.3)'
                        }} />
                      </AdvancedMarker>
                    )
                  ))}
                </GoogleMap>
              </APIProvider>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Recent Citizen Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentRequests && stats.recentRequests.length > 0 ? (
                stats.recentRequests.map((item: any, i: number) => (
                  <div key={item.request_id || i} className="flex justify-between items-center p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold truncate pr-4 capitalize">{item.category || 'Issue'}</span>
                      <span className="text-xs text-muted-foreground truncate pr-4">{item.intent || item.original_text || 'Pending Analysis'}</span>
                    </div>
                    <Badge variant={(item.severity || '').toLowerCase() === 'critical' || (item.severity || '').toLowerCase() === 'high' ? 'destructive' : 'default'}>
                      {item.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center mt-4 flex flex-col items-center">
                  <span className="mb-2">No recent reports found.</span>
                  <span className="text-xs opacity-75">Connect backend to view live data.</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
