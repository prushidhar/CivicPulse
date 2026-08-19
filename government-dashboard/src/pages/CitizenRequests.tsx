import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';

export default function CitizenRequests() {
  const [requests, setRequests] = useState<any[] | null>(null);

  const fetchRequests = () => {
    // We added getRequests to api.ts so we fetch the raw individual reports
    api.getRequests().then(data => {
      // The API returns an array, or an object with an items array depending on pagination
      if (Array.isArray(data)) {
        setRequests(data);
      } else if (data && data.items) {
        setRequests(data.items);
      } else {
        setRequests([]);
      }
    }).catch(() => setRequests([]));
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!requests) {
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
        <h1 className="text-3xl font-bold tracking-tight">Citizen Reports (Live Data)</h1>
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
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Description</th>
              <th className="px-6 py-3 font-medium">Severity</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {requests.map((r, i) => (
              <tr key={r.request_id || i} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{r.request_id?.split('-')[0]}...</td>
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{r.category || 'N/A'}</td>
                <td className="px-6 py-4 truncate max-w-xs" title={r.original_text || r.description}>{r.original_text || r.description}</td>
                <td className="px-6 py-4">
                  <Badge variant={r.severity === 'high' ? 'destructive' : r.severity === 'medium' ? 'warning' : 'success'}>
                    {(r.severity || 'low').toUpperCase()}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <span className="text-muted-foreground text-xs uppercase">{r.status || 'Pending'}</span>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No live citizen requests found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
