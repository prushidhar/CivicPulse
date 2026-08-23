import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { ChevronDown, ChevronUp, Brain, Zap, FileText, Volume2, Search } from 'lucide-react';

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
          <p className="text-sm text-gray-500 mt-2 font-medium">
            <Brain className="inline-block w-4 h-4 mr-1.5 text-[#4285F4] align-text-bottom" />
            Analyzed, Translated, and Routed by <span className="font-bold text-gray-800 ml-1">Google Gemini 2.5</span>
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
              const escapeCSV = (str: string | undefined | null) => {
                if (!str) return '""';
                const s = String(str).replace(/"/g, '""');
                return `"${s}"`;
              };
              const csv = [
                ['Request ID', 'Category', 'Severity', 'Status', 'Department'].map(escapeCSV),
                ...(filteredRequests || []).map(r => [
                  r.request_id, r.category, r.severity, r.status, 
                  r.transcript?.includes('Assigned Department:') ? r.transcript.split('Assigned Department:')[1].split('\n')[0].trim() : 'Unassigned'
                ].map(escapeCSV))
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
              if (pending.length === 0) return;
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
            onClick={() => console.log("Merge Duplicates workflow would open here.")}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-[#FBBC04]"><path d="M16 3h5v5"/><path d="m21 3-5 5"/><path d="M21 21H3"/><path d="m15 16-3 5-3-5"/></svg>
            Merge Duplicates
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRequests?.map((r, i) => (
          <div 
            key={r.request_id || i}
            className={`group relative bg-white rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden ${
              expandedId === r.request_id 
                ? 'ring-2 ring-purple-500 shadow-xl shadow-purple-500/20 border-purple-200 scale-[1.02]' 
                : 'hover:shadow-lg hover:-translate-y-1 border-gray-100 shadow-sm'
            }`}
            onClick={() => setExpandedId(expandedId === r.request_id ? null : r.request_id)}
          >
            {/* Severity Top Gradient Border */}
            <div className={`h-1.5 w-full absolute top-0 left-0 ${
              (r.severity || '').toLowerCase() === 'critical' || (r.severity || '').toLowerCase() === 'high' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
              (r.severity || '').toLowerCase() === 'medium' ? 'bg-gradient-to-r from-orange-400 to-yellow-400' :
              'bg-gradient-to-r from-green-400 to-emerald-500'
            }`} />

            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${
                    (r.severity || '').toLowerCase() === 'critical' ? 'bg-red-50 text-red-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {r.media && r.media.length > 0 && (r.media[0].type || '').includes('video') ? <Zap className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 leading-tight">{r.request_id}</h3>
                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-0.5">{r.category || 'Processing'}</p>
                  </div>
                </div>
                <Badge className={`font-bold px-3 py-1 shadow-sm ${getSeverityVariant(r.severity) === 'destructive' ? 'bg-red-500 text-white' : getSeverityVariant(r.severity) === 'warning' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}>
                  {(r.severity || 'low').toUpperCase()}
                </Badge>
              </div>

              {/* Description Body */}
              <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-50 group-hover:bg-gray-50 transition-colors">
                <p className="font-bold text-gray-900 mb-1">{r.intent || 'Pending Analysis'}</p>
                <p className="text-sm text-gray-500 line-clamp-2">{r.original_text || r.description}</p>
              </div>

              {/* Meta Data */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-indigo-200">
                    <span className="text-xs font-bold text-indigo-700">{r.citizen_name ? r.citizen_name.charAt(0).toUpperCase() : 'A'}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{r.citizen_name || 'Anonymous'}</p>
                    <p className="text-[10px] text-gray-500">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div onClick={e => e.stopPropagation()}>
                  <select
                    value={r.status || 'pending'}
                    onChange={(e) => handleStatusChange(r.request_id, e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl text-xs font-bold py-1.5 px-3 cursor-pointer shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="pending">PENDING</option>
                    <option value="accepted">ACCEPTED</option>
                    <option value="in_progress">IN PROGRESS</option>
                    <option value="resolved">RESOLVED</option>
                    <option value="rejected">REJECTED</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Expandable AI Analysis */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-gradient-to-br from-purple-50 to-indigo-50 border-t border-purple-100 ${
              expandedId === r.request_id ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-500/20">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-extrabold text-purple-900 text-sm tracking-wide">GEMINI ANALYSIS</h4>
                  <div className="ml-auto bg-purple-200/50 text-purple-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">
                    Confidence: {Math.round((r.ai_confidence || 0.85) * 100)}%
                  </div>
                </div>
                
                <div className="space-y-4">
                  {r.translated_text && (
                    <div className="bg-white/60 p-4 rounded-xl border border-white">
                      <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Original Transcript & Translation</p>
                      <p className="text-sm font-medium text-gray-800 italic">"{r.translated_text}"</p>
                    </div>
                  )}
                  
                  <div className="bg-white/80 p-4 rounded-xl border border-white shadow-sm">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1.5">Action Plan</p>
                    <p className="text-sm font-bold text-gray-900 leading-relaxed whitespace-pre-line">
                      {r.transcript || 'AI analysis pending...'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-4">
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
                        r.media.map((m: any, idx: number) => (
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
                        <p className="text-sm text-muted-foreground italic">No media attached to this request.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {(!filteredRequests || filteredRequests.length === 0) && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No requests found</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-md">Try adjusting your filters or search terms to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
}
