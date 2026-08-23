"use client";

import { useState } from "react";
import { Search, MapPin, CheckCircle2, Circle } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function TrackPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [submittedId, setSubmittedId] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trackData, setTrackData] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    
    setLoading(true);
    setHasSearched(false);
    setSubmittedId(search.trim());
    
    try {
      const response = await fetch(`/api/v1/requests/${search.trim()}`);
      if (!response.ok) throw new Error("Request not found in database");
      const data = await response.json();
      setTrackData(data);
    } catch (error: any) {
      console.error(error);
      setTrackData(null);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const getSteps = (status: string | undefined) => {
    let s = 'pending';
    if (status) s = status.toLowerCase();
    
    let states = ['completed', 'completed', 'completed', 'current', 'upcoming', 'upcoming', 'upcoming'];
    
    if (s === 'accepted') {
      states = ['completed', 'completed', 'completed', 'completed', 'completed', 'current', 'upcoming'];
    } else if (s === 'in_progress') {
      states = ['completed', 'completed', 'completed', 'completed', 'completed', 'current', 'upcoming'];
    } else if (s === 'resolved') {
      states = ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed'];
    } else if (s === 'rejected') {
      states = ['completed', 'completed', 'completed', 'completed', 'completed', 'skipped', 'skipped'];
    }
    
    return [
      { label: 'Submitted', status: states[0] },
      { label: 'AI Analysis', status: states[1] },
      { label: 'Location Verified', status: states[2] },
      { label: 'Government Review', status: states[3] },
      { label: s === 'rejected' ? 'Decision (Rejected)' : 'Decision', status: states[4] },
      ...(s !== 'rejected' ? [
        { label: 'Implementation', status: states[5] },
        { label: 'Completed', status: states[6] }
      ] : [])
    ];
  };

  const steps = getSteps(trackData?.status);


  return (
    <div className="max-w-5xl mx-auto space-y-16 mt-8 relative pb-20">
      <div className="absolute top-0 left-1/2 w-96 h-96 bg-[#4285F4]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="text-center space-y-6 relative z-10">
        <div className="mx-auto w-20 h-20 bg-white border border-gray-100 shadow-lg text-[#4285F4] rounded-full flex items-center justify-center mb-6">
          <Search className="w-10 h-10" />
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
          Track Request
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mx-auto font-medium">
          Enter your CivicPulse ID to see real-time updates and AI routing status.
        </p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-[2.5rem] shadow-xl border border-gray-100 max-w-3xl mx-auto relative z-10">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#4285F4]/60" />
            <input 
              type="text" 
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-background/50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-lg text-primary placeholder:text-primary/40"
              required
            />
          </div>
          <button type="submit" className="px-10 py-5 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition shadow-md">
            {t("track")}
          </button>
        </form>
      </div>

      {loading && (
        <div className="text-center py-12 text-primary/60 font-medium animate-pulse">
          Retrieving updates...
        </div>
      )}

      {hasSearched && !trackData && !loading && (
        <div className="bg-surface p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center text-danger font-medium">
          Request not found. Please check the ID and try again.
        </div>
      )}

      {hasSearched && trackData && !loading && (
        <div className="bg-white p-8 sm:p-12 rounded-[3rem] shadow-xl border border-gray-200/60 space-y-12 animate-in fade-in slide-in-from-bottom-4 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-8 border-b border-gray-100">
            <div className="space-y-2">
              <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Request #{submittedId.slice(0,8).toUpperCase()}</h2>
              <p className="text-gray-500 font-medium text-lg">
                Submitted on {trackData?.created_at ? new Date(trackData.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
              </p>
            </div>
            <span className={`px-6 py-3 rounded-2xl font-bold text-sm tracking-wide uppercase ${
              trackData?.status === 'resolved' ? 'bg-[#34A853]/10 text-[#34A853]' :
              trackData?.status === 'rejected' ? 'bg-[#EA4335]/10 text-[#EA4335]' :
              trackData?.status === 'in_progress' ? 'bg-[#FBBC04]/10 text-[#FBBC04]' :
              'bg-[#4285F4]/10 text-[#4285F4]'
            }`}>
              {trackData?.status === 'resolved' ? 'Completed' :
               trackData?.status === 'rejected' ? 'Rejected' :
               trackData?.status === 'in_progress' ? 'In Progress' :
               'Pending Processing'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-1 space-y-12">
              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Categorization</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-2 bg-gray-50 rounded-xl text-gray-800 font-bold border border-gray-100">{trackData?.category || "Unknown"}</span>
                    <span className="px-4 py-2 bg-[#EA4335]/5 text-[#EA4335] rounded-xl font-bold border border-[#EA4335]/10">{trackData?.urgency || trackData?.severity || "Normal"}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Location</h3>
                  <div className="flex items-start gap-4 text-gray-800 bg-gray-50 p-6 rounded-3xl border border-gray-100/80">
                    <div className="w-10 h-10 bg-[#4285F4]/10 rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[#4285F4]" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Lat: {trackData?.latitude ? trackData.latitude.toFixed(4) : "..."} <br/> Lng: {trackData?.longitude ? trackData.longitude.toFixed(4) : "..."}</p>
                      <span className="block text-xs text-gray-500 mt-2 font-medium">Precise location hidden for privacy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-12">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-primary/40 uppercase tracking-widest">{t("problemSummary")}</h3>
                <p className="text-primary font-medium text-lg bg-background p-6 rounded-3xl border border-gray-100/50">
                  {trackData?.original_text || trackData?.description || "Loading description..."}
                </p>
              </div>
              
              {trackData?.transcript && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-purple-600/70 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    AI Official Assessment
                  </h3>
                  <div className="text-purple-900 font-medium text-lg bg-purple-50 p-6 rounded-3xl border border-purple-100/50">
                    <p className="mb-4"><strong>Summary:</strong> {trackData.transcript.includes('AI Summary:') ? trackData.transcript.split('AI Summary:')[1]?.split('\n\nRecommended Action:')[0]?.trim() : trackData.transcript}</p>
                    {trackData.transcript.includes('Recommended Action:') && (
                      <p className="mb-4"><strong>Recommended Gov Action:</strong> {trackData.transcript.split('Recommended Action:')[1]?.split('\n\nAssigned Department:')[0]?.trim()}</p>
                    )}
                    {trackData.transcript.includes('Assigned Department:') && (
                      <p className="mb-4"><strong>Routed To:</strong> {trackData.transcript.split('Assigned Department:')[1]?.split('\n\nRisk Assessment:')[0]?.trim()}</p>
                    )}
                    {trackData.transcript.includes('Risk Assessment:') && (
                      <p><strong>Hazard Risk:</strong> {trackData.transcript.split('Risk Assessment:')[1]?.trim()}</p>
                    )}
                  </div>
                </div>
              )}
              
              {trackData?.media && trackData.media.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-primary/40 uppercase tracking-widest">Uploaded Evidence</h3>
                  <div className="flex flex-wrap gap-4">
                    {trackData.media.map((m: any, idx: number) => (
                      <div key={idx} className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        {(m.type || '').includes('image') ? (
                          <img src={m.url} alt="Evidence" className="h-40 object-cover rounded-2xl" />
                        ) : (m.type || '').includes('audio') ? (
                          <div className="p-4 bg-gray-50 rounded-2xl">
                            <audio src={m.url} controls className="h-10" />
                          </div>
                        ) : (m.type || '').includes('video') ? (
                          <video src={m.url} controls className="h-40 rounded-2xl" />
                        ) : (
                          <a href={m.url} target="_blank" rel="noopener noreferrer" className="p-4 block text-primary text-sm font-bold">Download Attachment</a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-3 bg-background p-8 rounded-[2rem] border border-gray-100/50">
              <h3 className="text-sm font-bold text-primary/40 uppercase tracking-widest mb-8">{t("lifecycleStatus")}</h3>
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-5 relative">
                    {index < steps.length - 1 && (
                      <div className={`absolute left-[11px] top-8 bottom-[-32px] w-0.5 ${step.status === 'completed' ? 'bg-primary' : 'bg-primary/10'}`}></div>
                    )}
                    <div className="relative z-10 shrink-0">
                      {step.status === "completed" ? (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      ) : step.status === "current" ? (
                        <div className="w-6 h-6 rounded-full border-4 border-primary bg-background flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-primary/20 bg-background" />
                      )}
                    </div>
                    <div className="-mt-1">
                      <p className={`font-bold text-lg ${step.status === 'upcoming' ? 'text-primary/40' : 'text-primary'}`}>{step.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gamification & Share Section (Feature #11 & #17) */}
          {trackData?.status === 'resolved' && (
            <div className="mt-12 bg-gradient-to-r from-[#34A853]/10 to-[#4285F4]/10 p-8 sm:p-10 rounded-[3rem] border border-[#34A853]/20 flex flex-col md:flex-row items-center justify-between gap-8 shadow-inner animate-in zoom-in-95 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FBBC04]/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 shrink-0">
                  <span className="text-4xl">🏆</span>
                </div>
                <div className="space-y-1 text-left">
                  <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">Civic Duty Complete!</h3>
                  <p className="text-gray-600 font-medium text-lg">You earned <span className="font-extrabold text-[#34A853] bg-[#34A853]/10 px-2 py-1 rounded-lg">+50 Civic Points</span> for improving your community.</p>
                </div>
              </div>
              <button 
                onClick={() => alert("Social sharing API would open here! (Hackathon Demo)")}
                className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-2xl shadow-md hover:shadow-lg border border-gray-200 transition-all flex items-center gap-3 shrink-0 relative z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#4285F4]"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Share Impact
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

