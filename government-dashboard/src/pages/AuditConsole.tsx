import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Shield, Clock, User, Search, RefreshCw, CheckCircle, AlertTriangle, Lock, Database, Cpu, Filter } from 'lucide-react';

interface AuditEntry {
  id: string; object_id: string; action: string; user: string; timestamp: string; details: string; ip_address?: string;
}
interface RequestSummary {
  request_id: string; category: string; severity: string; status: string; created_at: string; citizen_name?: string;
}

const ACTION_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  DATA_INGESTION:  { color: 'text-blue-700',   bg: 'bg-blue-100',   icon: <Database className="w-3 h-3" />,      label: 'DATA INGESTION' },
  PII_REDACTION:   { color: 'text-yellow-700',  bg: 'bg-yellow-100', icon: <Lock className="w-3 h-3" />,          label: 'PII REDACTION' },
  DATA_CLASSIFIED: { color: 'text-purple-700',  bg: 'bg-purple-100', icon: <Cpu className="w-3 h-3" />,           label: 'AI CLASSIFIED' },
  STATUS_CHANGED:  { color: 'text-green-700',   bg: 'bg-green-100',  icon: <CheckCircle className="w-3 h-3" />,   label: 'STATUS CHANGED' },
  MEDIA_UPLOADED:  { color: 'text-indigo-700',  bg: 'bg-indigo-100', icon: <Database className="w-3 h-3" />,      label: 'MEDIA UPLOADED' },
  ERROR:           { color: 'text-red-700',     bg: 'bg-red-100',    icon: <AlertTriangle className="w-3 h-3" />, label: 'ERROR' },
};
function getActionConfig(action: string) {
  return ACTION_CONFIG[action] || { color: 'text-gray-700', bg: 'bg-gray-100', icon: <Shield className="w-3 h-3" />, label: action.replace(/_/g,' ') };
}

export default function AuditConsole() {
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterAction, setFilterAction] = useState('All');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  useEffect(() => {
    setLoading(true);
    api.getRequests().then((data: any) => {
      const list = Array.isArray(data) ? data : (data?.items || []);
      setRequests(list);
      if (list.length > 0) setSelectedId(list[0].request_id);
    }).finally(() => setLoading(false));
  }, []);

  const fetchAudit = (id: string) => {
    if (!id) return;
    setLogsLoading(true);
    fetch(`/api/v1/audit/${id}`)
      .then(r => r.json())
      .then((data: AuditEntry[]) => { setLogs(Array.isArray(data) ? data : []); setLastRefreshed(new Date()); })
      .catch(() => setLogs([]))
      .finally(() => setLogsLoading(false));
  };
  useEffect(() => { fetchAudit(selectedId); }, [selectedId]);

  const selectedRequest = requests.find(r => r.request_id === selectedId);
  const uniqueActions = ['All', ...Array.from(new Set(logs.map(l => l.action)))];
  const filteredLogs = logs.filter(log => {
    const matchesAction = filterAction === 'All' || log.action === filterAction;
    const matchesSearch = searchText === '' || log.details.toLowerCase().includes(searchText.toLowerCase()) || log.user.toLowerCase().includes(searchText.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10 mb-4 md:mb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Audit Console</h1>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse">Live</span>
          </div>
          <p className="text-sm text-gray-500 font-medium mt-1">Immutable provenance tracking — every action logged, every decision accountable.</p>
        </div>
        <div className="relative z-10 flex flex-col items-end gap-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Refreshed</p>
          <p className="text-sm font-mono font-bold text-gray-700">{lastRefreshed.toLocaleTimeString()}</p>
          <p className="text-[10px] text-gray-400">{requests.length} requests tracked</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Request Selector */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Citizen Requests</h2>
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{requests.length}</span>
          </div>
          <div className="divide-y divide-gray-50 overflow-y-auto max-h-[600px]">
            {loading ? (
              <div className="p-8 text-center text-gray-400 animate-pulse text-sm">Loading requests...</div>
            ) : requests.map(req => (
              <button key={req.request_id} onClick={() => setSelectedId(req.request_id)}
                className={`w-full text-left p-4 transition-all hover:bg-indigo-50/50 ${selectedId === req.request_id ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    (req.severity||'').toLowerCase()==='critical'||(req.severity||'').toLowerCase()==='high' ? 'bg-red-100 text-red-700' :
                    (req.severity||'').toLowerCase()==='medium' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                  }`}>{(req.severity||'low').toUpperCase()}</span>
                  <span className="text-[10px] text-gray-400">{new Date(req.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs font-bold text-gray-700 truncate">{req.citizen_name||'Anonymous'}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{req.category||'Processing'}</p>
                <p className="text-[10px] font-mono text-gray-300 mt-1 truncate">{req.request_id}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Audit Trail */}
        <div className="lg:col-span-2 space-y-4">
          {selectedRequest && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Tracing Lineage For</p>
                  <p className="font-mono text-sm font-bold text-indigo-900 break-all">{selectedRequest.request_id}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-xl shadow-sm">{selectedRequest.category||'Processing'}</span>
                  <span className="text-xs font-bold bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-xl shadow-sm capitalize">{selectedRequest.status}</span>
                  <button onClick={()=>fetchAudit(selectedId)} className="p-2 bg-white border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm">
                    <RefreshCw className={`w-4 h-4 text-indigo-500 ${logsLoading?'animate-spin':''}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search logs..." value={searchText} onChange={e=>setSearchText(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white" />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <select value={filterAction} onChange={e=>setFilterAction(e.target.value)}
                className="pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white font-medium appearance-none">
                {uniqueActions.map(a=><option key={a} value={a}>{a==='All'?'All Actions':a.replace(/_/g,' ')}</option>)}
              </select>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Audit Timeline</h2>
              <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{filteredLogs.length} events</span>
            </div>
            {logsLoading ? (
              <div className="p-12 text-center"><RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3"/><p className="text-sm text-gray-400">Loading audit trail...</p></div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Shield className="w-10 h-10 mx-auto mb-3 opacity-30"/><p className="text-sm font-medium">No events found.</p>
              </div>
            ) : (
              <div className="p-6 space-y-0">
                {filteredLogs.map((log, idx) => {
                  const cfg = getActionConfig(log.action);
                  const isLast = idx === filteredLogs.length - 1;
                  return (
                    <div key={log.id} className="relative flex gap-4">
                      {!isLast && <div className="absolute left-4 top-9 bottom-0 w-0.5 bg-gray-100" />}
                      <div className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center mt-1 shadow-sm`}>{cfg.icon}</div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                            <span className="text-[10px] font-mono text-gray-400">{log.id}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                            <Clock className="w-3 h-3" />
                            {new Date(log.timestamp).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',second:'2-digit'})}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-2">{log.details}</p>
                        <div className="flex items-center gap-4 text-[10px] text-gray-400 font-medium">
                          <span className="flex items-center gap-1"><User className="w-3 h-3"/>{log.user}</span>
                          {log.ip_address && <span className="font-mono">🌐 {log.ip_address}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Provenance Graph */}
          {selectedId && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-4">Data Provenance Graph</h2>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  {label:'Citizen Portal',sub:'Source',cls:'bg-blue-100 border-blue-200 text-blue-700'},
                  {label:'→',sub:'',cls:''},
                  {label:'PII Scrubber',sub:'Security',cls:'bg-yellow-100 border-yellow-200 text-yellow-700'},
                  {label:'→',sub:'',cls:''},
                  {label:'Gemini 2.5 Flash',sub:'AI Engine',cls:'bg-purple-100 border-purple-200 text-purple-700'},
                  {label:'→',sub:'',cls:''},
                  {label:'Gov Dashboard',sub:'Output',cls:'bg-green-100 border-green-200 text-green-700'},
                ].map((node,i)=>node.label==='→'?(
                  <span key={i} className="text-gray-300 text-xl font-bold">→</span>
                ):(
                  <div key={i} className={`flex flex-col items-center px-4 py-2 rounded-xl border ${node.cls}`}>
                    <span className="text-xs font-extrabold">{node.label}</span>
                    <span className="text-[9px] uppercase tracking-wider opacity-70 mt-0.5">{node.sub}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-3 font-mono">
                Trace ID: {selectedId} | {filteredLogs.length} events | Tamper-evident chain
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
