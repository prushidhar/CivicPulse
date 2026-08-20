import React, { useEffect, useState } from 'react';
import { api, type AuditLog } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, User } from 'lucide-react';

export default function AuditConsole() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchId, setSearchId] = useState('REC-001');

  const fetchLogs = () => {
    api.getAudit(searchId).then(setLogs);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Console</h1>
          <p className="text-muted-foreground mt-1">Immutable provenance tracking and dataset lineage.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-muted/30 border-b border-border pb-4">
          <div className="flex space-x-4">
            <input 
              type="text" 
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search by object_id (e.g. REC-001)"
            />
            <button 
              onClick={fetchLogs}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Trace Lineage
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {logs.length > 0 ? logs.map(log => (
              <div key={log.id} className="p-6 hover:bg-muted/20 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <Badge variant={log.user === 'SYSTEM' ? 'secondary' : 'default'}>{log.action}</Badge>
                    <span className="text-sm font-mono text-muted-foreground">{log.id}</span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
                <p className="text-sm text-foreground mt-3">{log.details}</p>
                <div className="flex items-center mt-3 text-xs text-muted-foreground font-medium">
                  <User className="w-3 h-3 mr-1" /> Actor: {log.user}
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-muted-foreground">
                No audit logs found for object ID '{searchId}'.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Dataset Lineage Placeholder */}
      <div className="mt-8 border border-dashed border-border p-8 rounded-lg text-center text-muted-foreground">
        <h3 className="font-semibold mb-2 text-foreground">Dataset Provenance Graph</h3>
        <p className="text-sm mb-4">Visual representation of data sources contributing to {searchId}</p>
        <div className="inline-flex items-center justify-center p-4 bg-muted rounded-md text-xs">
          [Citizen Reports Q3] ──&gt; [Aggregation Pipeline] ──&gt; [Priority Engine (REC-001)]
        </div>
      </div>
    </div>
  );
}
