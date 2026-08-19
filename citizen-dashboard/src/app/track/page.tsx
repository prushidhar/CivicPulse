"use client";

import { useState } from "react";
import { Search, MapPin, CheckCircle2, Circle } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function TrackPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setHasSearched(true);
    }
  };

  const steps = [
    { label: "Submitted", status: "completed" },
    { label: "AI Analysis", status: "completed" },
    { label: "Location Verified", status: "completed" },
    { label: "Government Review", status: "current" },
    { label: "Decision", status: "upcoming" },
    { label: "Implementation", status: "upcoming" },
    { label: "Completed", status: "upcoming" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("trackTitle")}</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          {t("trackDesc")}
        </p>
      </div>

      <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-sm border max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder={t("trackPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border rounded-xl outline-none focus:ring-2 focus:ring-primary font-medium"
              required
            />
          </div>
          <button type="submit" className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 transition">
            {t("track")}
          </button>
        </form>
      </div>

      {hasSearched && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Request #{search.toUpperCase()}</h2>
              <p className="text-gray-500">Submitted on Aug 18, 2026</p>
            </div>
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold text-sm">
              {t("underReview")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">{t("problemSummary")}</h3>
                <p className="text-gray-800 font-medium bg-gray-50 p-4 rounded-xl border">
                  Large pothole on the main street causing traffic delays and vehicle damage.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Category</h3>
                  <p className="font-semibold text-gray-800">Roads</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Severity</h3>
                  <p className="font-semibold text-red-600">High</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Location (Public View)</h3>
                <div className="flex items-start gap-2 text-gray-600 bg-gray-50 p-4 rounded-xl border">
                  <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <p>Downtown Area <span className="block text-xs text-gray-400 mt-1">Precise location hidden for privacy</span></p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">{t("lifecycleStatus")}</h3>
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-4 relative">
                    {index < steps.length - 1 && (
                      <div className={`absolute left-3 top-8 bottom-[-24px] w-0.5 ${step.status === 'completed' ? 'bg-primary' : 'bg-gray-200'}`}></div>
                    )}
                    <div className="relative z-10 shrink-0">
                      {step.status === "completed" ? (
                        <CheckCircle2 className="w-6 h-6 text-primary bg-gray-50" />
                      ) : step.status === "current" ? (
                        <div className="w-6 h-6 rounded-full border-4 border-primary bg-white flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        </div>
                      ) : (
                        <Circle className="w-6 h-6 text-gray-300 bg-gray-50" />
                      )}
                    </div>
                    <div>
                      <p className={`font-semibold ${step.status === 'upcoming' ? 'text-gray-400' : 'text-gray-900'}`}>{step.label}</p>
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
