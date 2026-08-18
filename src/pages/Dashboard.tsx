import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Activity, AlertTriangle, FileCheck, Target } from 'lucide-react';
import { api } from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      api.getHotspots(),
      api.getRecommendations(),
      api.getImpact()
    ]).then(([hotspots, recommendations, impact]) => {
      setStats({
        activeHotspots: hotspots.length,
        pendingReviews: recommendations.filter(r => r.status === 'pending').length,
        priorityRecs: recommendations.filter(r => r.priorityScore > 80).length,
        impact: impact.estimatedPopulationReached
      });
    });
  }, []);

  if (!stats) return <div className="p-6">Loading dashboard...</div>;

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
            <p className="text-xs text-muted-foreground">+2 since last hour</p>
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
          <CardTitle>Demand Trend Analysis</CardTitle>
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
