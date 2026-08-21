import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { ChevronDown, ChevronUp, Brain, Zap, FileText } from 'lucide-react';

export default function CitizenRequests() {
  const [requests, setRequests] = useState<any[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>('All');

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.updateRequestStatus(id, newStatus);
      fetchRequests();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const fetchRequests = () => {
    api.getRequests().then(data => {
      if (Array.isArray(data)) {
        setRequests(data);
      } else if (data && data.items) {
        setRequests(data.items);
      } else {
        setRequests([]);
      }
    }).catch(err => { console.error("Requests Fetch Error:", err); setRequests([]); });
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityVariant = (severity: string) => {
    const s = (severity || '').toLowerCase();
    if (s === 'critical' || s === 'high') return 'destructive';
    if (s === 'medium') return 'warning';
    return 'success';
  };

  const filteredRequests = requests?.filter(r => {
    if (filterDepartment === 'All') return true;
    const aiDept = r.transcript && r.transcript.includes('Assigned Department:') 
      ? r.transcript.split('Assigned Department:')[1]?.split('\n')[0]?.trim() 
      : 'Unassigned';
    return aiDept === filterDepartment;
  });

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Citizen Reports (Live Data)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            <Brain className="inline w-4 h-4 mr-1 text-purple-500" />
            Powered by <strong>Google Gemini AI</strong> — click any row to see AI analysis
          </p>
        </div>
        <div className="flex space-x-3 items-center">
          <select 
            className="px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            value={filterDepartment}
            onChange={e => setFilterDepartment(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="NHAI">NHAI (Highways)</option>
            <option value="BBMP">BBMP (Municipal)</option>
            <option value="PWD">PWD (Public Works)</option>
            <option value="BESCOM">BESCOM (Energy)</option>
            <option value="Traffic Police">Traffic Police</option>
            <option value="Water Board">Water Board</option>
          </select>
          <button 
            onClick={() => {
              const csv = [
                ['Request ID', 'Category', 'Severity', 'Status', 'Department'],
                ...(filteredRequests || []).map(r => [
                  r.request_id, r.category, r.severity, r.status, 
                  r.transcript?.includes('Assigned Department:') ? r.transcript.split('Assigned Department:')[1].split('\n')[0].trim() : 'Unassigned'
                ])
              ].map(e => e.join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'civicpulse_requests.csv';
              a.click();
            }}
            className="px-4 py-2 bg-background border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors"
          >
            Export CSV
          </button>
          <button 
            onClick={async () => {
              const pending = (filteredRequests || []).filter(r => r.status === 'pending');
              if (pending.length === 0) return alert('No pending requests to auto-assign.');
              alert(`AI is auto-assigning ${pending.length} pending requests based on departmental routing...`);
              for (const p of pending) {
                await api.updateRequestStatus(p.request_id, 'accepted');
              }
              const latest = await api.getRequests();
              setRequests(latest);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center"
          >
            <Zap className="w-4 h-4 mr-2" /> Auto-Assign AI
          </button>
        </div>
      </div>

      <div className="border border-border rounded-lg bg-background overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted/50 border-b border-border uppercase">
            <tr>
              <th className="px-6 py-3 font-medium">Request ID</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Citizen</th>
              <th className="px-6 py-3 font-medium">Description</th>
              <th className="px-6 py-3 font-medium">Severity</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">AI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredRequests?.map((r, i) => (
              <React.Fragment key={r.request_id || i}>
                <tr
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === r.request_id ? null : r.request_id)}
                >
                  <td className="px-6 py-4 font-medium text-foreground text-xs">{r.request_id}</td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground capitalize">{r.category || 'Processing...'}</td>
                  <td className="px-6 py-4">
                    {r.citizen_name ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{r.citizen_name}</span>
                        <span className="text-xs text-muted-foreground">{r.citizen_phone}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Anonymous</span>
                    )}
                  </td>
                  <td className="px-6 py-4 truncate max-w-xs" title={r.original_text || r.description}>
                    {r.original_text || r.description}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getSeverityVariant(r.severity)}>
                      {(r.severity || 'low').toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                    <select
                      value={r.status || 'pending'}
                      onChange={(e) => handleStatusChange(r.request_id, e.target.value)}
                      className="bg-background border border-border rounded text-xs p-1 cursor-pointer"
                    >
                      <option value="pending">PENDING</option>
                      <option value="accepted">ACCEPTED</option>
                      <option value="in_progress">IN PROGRESS</option>
                      <option value="resolved">RESOLVED</option>
                      <option value="rejected">REJECTED</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-purple-500 hover:text-purple-700 flex items-center gap-1 text-xs font-semibold">
                      <Brain className="w-3 h-3" />
                      {expandedId === r.request_id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </td>
                </tr>

                {/* Expandable AI Analysis Panel */}
                {expandedId === r.request_id && (
                  <tr className="bg-purple-50 dark:bg-purple-950/20 border-l-4 border-purple-500">
                    <td colSpan={7} className="px-6 py-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-bold text-purple-700 dark:text-purple-300">Google Gemini AI Analysis</h3>
                        <span className="text-xs text-muted-foreground ml-auto">
                          Confidence: <strong>{r.ai_confidence ? `${(r.ai_confidence * 100).toFixed(0)}%` : 'N/A'}</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* AI Summary */}
                        <div className="md:col-span-2 bg-white dark:bg-background rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-purple-500" />
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Summary</span>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">
                            {r.transcript && r.transcript.includes('AI Summary:')
                              ? r.transcript.split('AI Summary:')[1]?.split('\n\nRecommended Action:')[0]?.trim()
                              : r.original_text || 'Run AI analysis by submitting a new request.'}
                          </p>
                        </div>

                        {/* Recommended Action & Routing */}
                        <div className="bg-white dark:bg-background rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-orange-500" />
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Action & Routing</span>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed mb-3">
                            {r.transcript && r.transcript.includes('Recommended Action:')
                              ? r.transcript.split('Recommended Action:')[1]?.split('\n\nAssigned Department:')[0]?.trim()
                              : 'No recommendation yet.'}
                          </p>
                          {r.transcript && r.transcript.includes('Assigned Department:') && (
                            <div className="flex gap-2 mb-2">
                              <span className="text-xs font-bold text-muted-foreground uppercase">Routed To:</span>
                              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 rounded">{r.transcript.split('Assigned Department:')[1]?.split('\n\nRisk Assessment:')[0]?.trim()}</span>
                            </div>
                          )}
                          {r.transcript && r.transcript.includes('Risk Assessment:') && (
                            <div className="flex gap-2">
                              <span className="text-xs font-bold text-muted-foreground uppercase">Risk:</span>
                              <span className="text-xs font-medium text-red-600">{r.transcript.split('Risk Assessment:')[1]?.trim()}</span>
                            </div>
                          )}
                        </div>

                        {/* Media Preview */}
                        <div className="md:col-span-3 bg-white dark:bg-background rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Citizen Evidence (Media)</span>
                          </div>
                          <div className="flex flex-wrap gap-4">
                            {r.media && r.media.length > 0 ? (
                              r.media.map((m, idx) => (
                                <div key={idx} className="border border-border rounded overflow-hidden">
                                  {m.type.includes('image') ? (
                                    <img src={m.url} alt="Evidence" className="h-48 object-cover max-w-full" />
                                  ) : m.type.includes('audio') ? (
                                    <div className="p-3 bg-muted">
                                      <audio src={m.url} controls className="h-10" />
                                    </div>
                                  ) : (
                                    <a href={m.url} target="_blank" className="p-3 block text-primary text-sm font-medium">Download Attachment</a>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground italic">No media files attached to this report.</p>
                            )}
                          </div>
                        </div>

                        {/* AI Metadata */}
                        <div className="md:col-span-3 grid grid-cols-4 gap-3">
                          <div className="bg-white dark:bg-background rounded-lg p-3 border border-purple-200 dark:border-purple-800 text-center">
                            <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Category</p>
                            <p className="text-sm font-bold capitalize text-foreground">{r.category || '—'}</p>
                          </div>
                          <div className="bg-white dark:bg-background rounded-lg p-3 border border-purple-200 dark:border-purple-800 text-center">
                            <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Severity</p>
                            <p className="text-sm font-bold capitalize text-foreground">{r.severity || '—'}</p>
                          </div>
                          <div className="bg-white dark:bg-background rounded-lg p-3 border border-purple-200 dark:border-purple-800 text-center">
                            <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Intent</p>
                            <p className="text-sm font-bold capitalize text-foreground">{r.intent || '—'}</p>
                          </div>
                          <div className="bg-white dark:bg-background rounded-lg p-3 border border-purple-200 dark:border-purple-800 text-center">
                            <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Translated</p>
                            <p className="text-sm font-bold text-foreground truncate" title={r.translated_text || ''}>
                              {r.translated_text && r.translated_text !== r.original_text ? '✓ Yes' : 'English'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
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
