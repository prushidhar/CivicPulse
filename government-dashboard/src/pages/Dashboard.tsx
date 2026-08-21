import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Activity, AlertTriangle, FileCheck, Target, MessageSquare, Bot, Clock, Zap } from 'lucide-react';
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
        impact: (impact.length > 0 ? impact[0].estimatedPopulationReached : 0),
        openRequests: requests.length
      });
    }).catch(() => {
      // Keep loading state if API fails
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
          <p className="text-muted-foreground mt-1">Monitor assistant health and public service requests.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-border/50 shadow-sm rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 bg-primary text-white shadow-md shadow-primary/20 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            Configure Assistant
          </button>
        </div>
      </div>

      {/* Corra AI Health Metrics */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center">
          <Bot className="w-5 h-5 mr-2 text-primary" />
          CivicPulse Assistant Health
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-green-500">
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">+2.4%</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
              <h3 className="text-3xl font-extrabold mt-1">94.2%</h3>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">+0.8%</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Human Fallback Rate</p>
              <h3 className="text-3xl font-extrabold mt-1">5.8%</h3>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">-12ms</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Response Latency</p>
              <h3 className="text-3xl font-extrabold mt-1">840ms</h3>
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
            <CardTitle>Assistant Topic Trends</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[250px] w-full bg-muted/20 flex flex-col items-center justify-center text-muted-foreground rounded-xl border border-dashed border-border/60">
              <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-medium">Chart Visualization Loading</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Top Unanswered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { q: "How to apply for solar rebate?", count: 142 },
                { q: "Sector 4 water schedule", count: 89 },
                { q: "New bridge toll fees", count: 45 }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                  <span className="text-sm font-medium truncate pr-4">{item.q}</span>
                  <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
