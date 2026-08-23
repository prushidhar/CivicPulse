import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Activity, AlertTriangle, FileCheck, Target, MessageSquare, Bot, Clock, Zap, Map, ShieldCheck, CheckCircle2, Search, ArrowUpRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { APIProvider, Map as GoogleMap, Marker } from '@vis.gl/react-google-maps';

const CountUp = ({ end, duration = 1500, suffix = "" }: { end: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
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
      const totalReqs = requests.length || 1;
      
      setStats({
        activeHotspots: hotspots.length,
        pendingReviews: recommendations.filter((r: any) => r.status === 'pending').length,
        priorityRecs: recommendations.filter((r: any) => r.priorityScore > 80).length,
        impact: Array.isArray(impact) ? impact.reduce((sum: number, item: any) => sum + (item.estimatedPopulationReached || 0), 0) : (impact?.estimatedPopulationReached || 0),
        openRequests: openReqs,
        resolvedRequests: closedReqs,
        resolutionRate: ((closedReqs / totalReqs) * 100).toFixed(1),
        recentRequests: requests.slice(0, 10),
        totalRequests: totalReqs
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
      <div className="space-y-8 animate-pulse mt-4 p-8">
        <div className="h-12 bg-muted rounded-xl w-1/3 mb-6"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="bg-white border-none shadow-sm rounded-2xl h-32">
              <CardContent className="h-full w-full bg-muted/50 rounded-2xl"></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 mt-2 pb-10">
      
      {/* Animated Ultimate Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gray-900 text-white p-10 lg:p-14 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-blue-200 uppercase tracking-widest backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Secure Gov Network
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Center</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-medium max-w-xl leading-relaxed">
              Real-time AI-powered civic intelligence. Monitoring live reports, predicting hotspots, and automatically routing resources across the state.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
            <button className="px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/50 hover:shadow-blue-900/80 transition-all flex items-center justify-center gap-2 border border-blue-500">
              <FileCheck className="w-5 h-5" /> Generate PDF Report
            </button>
            <button className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-sm backdrop-blur-md border border-white/10 transition-all flex items-center justify-center gap-2">
              <Bot className="w-5 h-5" /> AI Insights
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Grid - Ultimate Glassmorphism */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 px-2">
        
        <Card className="bg-white rounded-[2rem] border-none shadow-lg shadow-gray-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-8 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
                <MessageSquare className="w-7 h-7" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none font-bold shadow-sm">+12%</Badge>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Reports</p>
            <h3 className="text-4xl font-extrabold text-gray-900"><CountUp end={stats.totalRequests} /></h3>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-[2rem] border-none shadow-lg shadow-gray-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-8 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-green-100 text-green-600 rounded-2xl">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none font-bold shadow-sm">+5%</Badge>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Resolution Rate</p>
            <h3 className="text-4xl font-extrabold text-gray-900"><CountUp end={parseFloat(stats.resolutionRate)} suffix="%" /></h3>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-[2rem] border-none shadow-lg shadow-gray-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-8 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl">
                <Zap className="w-7 h-7" />
              </div>
              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none font-bold shadow-sm">Critical</Badge>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Active Hotspots</p>
            <h3 className="text-4xl font-extrabold text-gray-900"><CountUp end={stats.activeHotspots} /></h3>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-[2rem] border-none shadow-lg shadow-gray-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-8 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl">
                <Activity className="w-7 h-7" />
              </div>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Impact Radius</p>
            <h3 className="text-4xl font-extrabold text-gray-900"><CountUp end={stats.impact} /></h3>
          </CardContent>
        </Card>

      </div>

      {/* Main Map & Live Feed Section */}
      <div className="grid gap-8 lg:grid-cols-3 px-2">
        <Card className="lg:col-span-2 bg-white rounded-[2.5rem] border-none shadow-xl shadow-gray-200/60 overflow-hidden flex flex-col">
          <CardHeader className="px-8 pt-8 pb-4 border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
              <Map className="w-7 h-7 text-blue-600" />
              Live H3 Spatial Map
            </CardTitle>
            <p className="text-gray-500 font-medium text-sm mt-1">Real-time geospatial clustering of all civic issues across India.</p>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-[500px] relative">
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
              <GoogleMap
                defaultCenter={{ lat: 21.1458, lng: 79.0882 }}
                defaultZoom={5}
                style={{ width: "100%", height: "100%" }} disableDefaultUI={true}
              >
                {stats.recentRequests && stats.recentRequests.map((r: any, i: number) => (
                  r.latitude && r.longitude && (
                    <Marker key={i} position={{ lat: r.latitude, lng: r.longitude }} />
                  )
                ))}
              </GoogleMap>
            </APIProvider>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-[2.5rem] border-none shadow-xl shadow-gray-200/60 overflow-hidden flex flex-col">
          <CardHeader className="px-8 pt-8 pb-4 border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
              <Activity className="w-7 h-7 text-indigo-600" />
              Live AI Feed
            </CardTitle>
            <p className="text-gray-500 font-medium text-sm mt-1">Real-time incoming reports routed by Gemini.</p>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto max-h-[500px]">
            <div className="divide-y divide-gray-100">
              {stats.recentRequests && stats.recentRequests.length > 0 ? (
                stats.recentRequests.map((item: any, i: number) => (
                  <div key={item.request_id || i} className="p-6 hover:bg-gray-50 transition-colors group cursor-pointer relative">
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-3 h-3 rounded-full shadow-sm ${(item.severity || '').toLowerCase() === 'critical' ? 'bg-red-500' : (item.severity || '').toLowerCase() === 'high' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{item.category || 'Issue'}</span>
                      <span className="text-xs font-bold text-gray-400 ml-auto mr-6">
                        {item.created_at ? (() => {
                          const diff = Math.floor((new Date().getTime() - new Date(item.created_at).getTime()) / 1000);
                          if (isNaN(diff) || diff < 0) return 'Just now';
                          if (diff < 60) return `${diff}s ago`;
                          if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                          if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                          return `${Math.floor(diff / 86400)}d ago`;
                        })() : 'Just now'}
                      </span>
                    </div>
                    <p className="text-gray-900 font-bold text-sm pr-8 leading-relaxed line-clamp-2">
                      {item.intent || item.original_text || 'Pending Analysis'}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none capitalize shadow-sm">
                        {item.status}
                      </Badge>
                      {item.ai_confidence && (
                        <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none shadow-sm flex items-center gap-1">
                          <Bot className="w-3 h-3" /> AI Routed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center flex flex-col items-center justify-center text-gray-400">
                  <Search className="w-12 h-12 mb-4 text-gray-300" />
                  <p className="font-bold">No active reports</p>
                  <p className="text-sm mt-1">Connect backend to view live data.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
