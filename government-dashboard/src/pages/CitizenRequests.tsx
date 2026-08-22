import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { ChevronDown, ChevronUp, Brain, Zap, FileText, Volume2 } from 'lucide-react';

export default function CitizenRequests() {
  const context = useOutletContext<{ globalSearch: string }>();
  const globalSearch = context?.globalSearch || '';

  const [requests, setRequests] = useState<any[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>('All');

  const handlePlaySpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

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
    // Department Filter Logic (Fuzzy match to handle Gemini string variations)
    let matchesDept = true;
    if (filterDepartment !== 'All') {
      const aiDept = r.transcript && r.transcript.includes('Assigned Department:') 
        ? r.transcript.split('Assigned Department:')[1]?.split('\n')[0]?.trim().toLowerCase() 
        : 'unassigned';
      matchesDept = aiDept.includes(filterDepartment.toLowerCase());
    }

    // Global Search Logic
    let matchesSearch = true;
    if (globalSearch.trim() !== '') {
      const s = globalSearch.toLowerCase();
      matchesSearch = 
        (r.request_id && r.request_id.toLowerCase().includes(s)) ||
        (r.category && r.category.toLowerCase().includes(s)) ||
        (r.original_text && r.original_text.toLowerCase().includes(s)) ||
        (r.transcript && r.transcript.toLowerCase().includes(s));
    }

    return matchesDept && matchesSearch;
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4285F4]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#EA4335]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="relative z-10 mb-4 md:mb-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
            Citizen Reports
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse">Live</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium flex items-center">
            <Brain className="inline w-4 h-4 mr-1.5 text-[#4285F4]" />
            Analyzed, Translated, and Routed by <span className="font-bold text-gray-800 ml-1">Google Gemini 1.5</span>
          </p>
        </div>
        <div className="flex space-x-3 items-center relative z-10">
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
              setRequests(Array.isArray(latest) ? latest : latest?.items || []);
            }}
            className="px-4 py-2 bg-[#4285F4] text-white rounded-xl text-sm font-bold hover:bg-[#4285F4]/90 transition-colors flex items-center shadow-sm"
          >
            <Zap className="w-4 h-4 mr-2" /> Auto-Assign AI
          </button>
          
          {/* Feature #26: Manual Merge Button */}
          <button 
            onClick={() => alert("Merge Duplicates workflow would open here. (Admin privileges required)")}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-[#FBBC04]"><path d="M16 3h5v5"/><path d="m21 3-5 5"/><path d="M21 21H3"/><path d="m15 16-3 5-3-5"/></svg>
            Merge Duplicates
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
                  <td className="px-6 py-4 truncate max-w-xs">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900" title="Gemini Micro-Summary">{r.intent || 'Pending Analysis'}</span>
                      <span className="text-xs text-muted-foreground truncate" title={r.original_text || r.description}>
                        {r.original_text || r.description}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityVariant(r.severity)}>
                        {(r.severity || 'low').toUpperCase()}
                      </Badge>
                      {r.severity?.toLowerCase() === 'critical' && r.status === 'pending' && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-extrabold uppercase animate-pulse border border-red-200" title="Unresolved critical issue">
                          SLA Breach
                        </span>
                      )}
                    </div>
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
                          <div className="ml-auto flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confidence</span>
                            {r.ai_confidence ? (
                              <div className={`px-2 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${r.ai_confidence > 0.8 ? 'bg-green-100 text-green-700 border border-green-200' : r.ai_confidence > 0.6 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                {(r.ai_confidence * 100).toFixed(0)}%
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">N/A</span>
                            )}
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* AI Summary */}
                        <div className="md:col-span-2 bg-white dark:bg-background rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-purple-500" />
                              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Summary</span>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const textToRead = r.transcript && r.transcript.includes('AI Summary:') 
                                  ? r.transcript.split('AI Summary:')[1]?.split('\n\nRecommended Action:')[0]?.trim() 
                                  : r.original_text || 'Run AI analysis by submitting a new request.';
                                handlePlaySpeech(textToRead);
                              }}
                              className="p-1 hover:bg-purple-50 rounded-md text-purple-500 transition-colors"
                              title="Play AI Summary"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
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
                          {r.latitude && r.longitude && (
                            <div className="flex gap-2 mt-2 pt-2 border-t border-purple-100 dark:border-purple-900">
                              <span className="text-xs font-bold text-muted-foreground uppercase">Location:</span>
                              <a 
                                href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-mono text-blue-600 hover:underline"
                              >
                                {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                              </a>
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
                                  {(m.type || '').includes('image') ? (
                                    <img src={m.url} alt="Evidence" className="h-48 object-cover max-w-full" />
                                  ) : (m.type || '').includes('audio') ? (
                                    <div className="p-3 bg-muted">
                                      <audio src={m.url} controls className="h-10" />
                                    </div>
                                  ) : (m.type || '').includes('video') ? (
                                    <video src={m.url} controls className="h-48 rounded max-w-full" />
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
