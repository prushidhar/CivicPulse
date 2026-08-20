import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Activity, AlertTriangle, FileCheck, Target } from 'lucide-react';
import { api } from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  const fetchStats = () => {
    Promise.all([
      api.getHotspots(),
      api.getRecommendations(),
      api.getImpact(),
      api.getRequests ? api.getRequests() : Promise.resolve([])
    ]).then(([hotspots, recommendations, impact, requests]) => {
      setStats({
        activeHotspots: hotspots.length,
        pendingReviews: recommendations.filter(r => r.status === 'pending').length,
        priorityRecs: recommendations.filter(r => r.priorityScore > 80).length,
        impact: impact.estimatedPopulationReached,
        openRequests: requests.length
      });
    });
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-1/4 mb-6"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="bg-muted/50 border-none">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted-foreground/20 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-muted/50 border-none mt-6">
          <CardHeader>
            <div className="h-6 bg-muted-foreground/20 rounded w-1/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full bg-muted-foreground/10 rounded-md"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Hotspots</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeHotspots}</div>
            <p className="text-xs text-muted-foreground">Live Updates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priority Recommendations</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.priorityRecs}</div>
            <p className="text-xs text-muted-foreground">Score &gt; 80</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Human Reviews</CardTitle>
            <FileCheck className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Population Reached</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.impact.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Based on accepted projects</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Chart placeholder */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Live Demand Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[300px] w-full bg-muted/20 flex items-center justify-center text-muted-foreground rounded-md border border-dashed border-border">
            [High-level demand trend charts visualization]
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
