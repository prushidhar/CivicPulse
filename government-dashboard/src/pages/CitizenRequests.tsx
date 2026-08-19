import React, { useEffect, useState } from 'react';
import { api, type Hotspot } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';

export default function CitizenRequests() {
  const [hotspots, setHotspots] = useState<Hotspot[] | null>(null);

  const fetchRequests = () => {
    api.getHotspots().then(setHotspots);
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!hotspots) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-10 bg-muted rounded w-64"></div>
        </div>
        <div className="border border-border rounded-lg bg-background p-4 space-y-4">
          <div className="h-10 bg-muted-foreground/10 rounded w-full"></div>
          <div className="h-12 bg-muted-foreground/10 rounded w-full"></div>
          <div className="h-12 bg-muted-foreground/10 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Citizen Requests & Incidents</h1>
        <div className="flex space-x-2">
          <input 
            type="text" 
            placeholder="Search by ID or Location..." 
            className="px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="border border-border rounded-lg bg-background overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted/50 border-b border-border uppercase">
            <tr>
              <th className="px-6 py-3 font-medium">Request ID</th>
              <th className="px-6 py-3 font-medium">H3 Grid Index</th>
              <th className="px-6 py-3 font-medium">Volume</th>
              <th className="px-6 py-3 font-medium">Severity</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {hotspots.map((h, i) => (
              <tr key={h.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{h.id}</td>
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{h.h3Index}</td>
                <td className="px-6 py-4">{h.requestCount} reports</td>
                <td className="px-6 py-4">
                  <Badge variant={h.severity === 'high' ? 'destructive' : h.severity === 'medium' ? 'warning' : 'success'}>
                    {h.severity.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <span className="text-muted-foreground text-xs">Pending Review</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
