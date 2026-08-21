import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Activity, AlertTriangle, FileCheck, Target, MessageSquare, Bot, Clock, Zap, Map } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';

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
          <button className="px-4 py-2 bg-white border border-border/50 shadow-sm rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors">
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
          <MessageSquare className="w-5 h-5 mr-2 text-primary" />
          Citizen Reporting Metrics
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-green-500">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Overall Resolution Rate</p>
              <h3 className="text-3xl font-extrabold mt-1">{stats.resolutionRate}%</h3>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Unresolved Open Reports</p>
              <h3 className="text-3xl font-extrabold mt-1">{stats.openRequests}</h3>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
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
          <Zap className="w-5 h-5 mr-2 text-orange-500" />
          Field Operations
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white">
            <CardContent className="p-5 flex items-center space-x-4">
              <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Hotspots</p>
                <h3 className="text-2xl font-bold">{stats.activeHotspots}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-5 flex items-center space-x-4">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Priority Recs</p>
                <h3 className="text-2xl font-bold">{stats.priorityRecs}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-5 flex items-center space-x-4">
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                <FileCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                <h3 className="text-2xl font-bold">{stats.pendingReviews}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-5 flex items-center space-x-4">
              <div className="p-3 bg-green-50 text-green-500 rounded-xl">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Est. Impact</p>
                <h3 className="text-2xl font-bold">{stats.impact.toLocaleString()}</h3>
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
            <div className="h-[250px] w-full bg-muted/20 flex flex-col items-center justify-center text-muted-foreground rounded-xl border border-dashed border-border/60">
              <Map className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-medium">Regional Distribution Map Loading</p>
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
                    <Badge variant={item.severity === 'critical' || item.severity === 'high' ? 'destructive' : 'default'}>
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
