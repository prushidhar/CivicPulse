"use client";

import { useState } from "react";
import { Search, MapPin, CheckCircle2, Circle } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function TrackPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trackData, setTrackData] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    
    setLoading(true);
    setHasSearched(false);
    
    try {
      const response = await fetch(`/api/v1/requests/${search.trim()}`);
      if (!response.ok) throw new Error("Request not found in database");
      const data = await response.json();
      setTrackData(data);
    } catch (error: any) {
      console.error(error);
      setTrackData(null);
      alert("Error: Could not find that request ID. Make sure you submit a real report first!");
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
      states = ['completed', 'completed', 'completed', 'completed', 'completed', 'upcoming', 'upcoming'];
    }
    
    return [
      { label: 'Submitted', status: states[0] },
      { label: 'AI Analysis', status: states[1] },
      { label: 'Location Verified', status: states[2] },
      { label: 'Government Review', status: states[3] },
      { label: s === 'rejected' ? 'Decision (Rejected)' : 'Decision', status: states[4] },
      { label: 'Implementation', status: states[5] },
      { label: 'Completed', status: states[6] },
    ];
  };

  const steps = getSteps(trackData?.status);


  return (
    <div className="max-w-4xl mx-auto space-y-12 mt-8">
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <Search className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
          {t("trackTitle")}
        </h1>
        <p className="text-xl text-primary/70 max-w-xl mx-auto font-medium">
          {t("trackDesc")}
        </p>
      </div>

      <div className="bg-surface p-4 sm:p-6 rounded-[2rem] shadow-sm border border-gray-100 max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/40" />
            <input 
              type="text" 
              placeholder={t("trackPlaceholder")}
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
        <div className="bg-surface p-8 sm:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-10 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-8 border-b border-gray-100">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-primary">Request #{search.toUpperCase()}</h2>
              <p className="text-primary/50 font-medium">Submitted on Aug 18, 2026</p>
            </div>
            <span className="px-6 py-3 bg-secondary/10 text-secondary rounded-2xl font-bold text-sm">
              {t("underReview")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
            <div className="md:col-span-3 space-y-8">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-primary/40 uppercase tracking-widest">{t("problemSummary")}</h3>
                <p className="text-primary font-medium text-lg bg-background p-6 rounded-3xl border border-gray-100/50">
                  {trackData?.text || trackData?.description || "Loading description..."}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-primary/40 uppercase tracking-widest">Category</h3>
                  <p className="font-bold text-primary text-lg">{trackData?.category || "N/A"}</p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-primary/40 uppercase tracking-widest">Severity</h3>
                  <p className="font-bold text-secondary text-lg">{trackData?.urgency || trackData?.severity || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-primary/40 uppercase tracking-widest">Location (Public View)</h3>
                <div className="flex items-start gap-4 text-primary bg-background p-6 rounded-3xl border border-gray-100/50">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">Lat: {trackData?.latitude ? trackData.latitude.toFixed(4) : "..."} Lng: {trackData?.longitude ? trackData.longitude.toFixed(4) : "..."}</p>
                    <span className="block text-sm text-primary/50 mt-1 font-medium">Precise location hidden for privacy</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-background p-8 rounded-[2rem] border border-gray-100/50">
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
        </div>
      )}
    </div>
  );
}

