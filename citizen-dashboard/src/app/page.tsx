"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { MessageCircle, FileText, Search, ArrowRight, ShieldCheck, HelpCircle, Map as MapIcon, Zap, Globe, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

export default function Home() {
  const { t } = useLanguage();
  const [liveReports, setLiveReports] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/requests')
      .then(res => res.json())
      .then(data => {
        const items = Array.isArray(data) ? data : data.items || [];
        setLiveReports(items.filter((r: any) => r.latitude && r.longitude).slice(0, 50));
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-16 max-w-5xl mx-auto mt-4 pb-20">
      
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center text-center space-y-8 relative px-4">
        <div className="absolute top-0 right-10 w-72 h-72 bg-[#4285F4]/10 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-[#EA4335]/10 rounded-full blur-3xl translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#FBBC04]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10 space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-bold text-gray-600 mb-2">
            <Sparkles className="w-4 h-4 text-[#34A853]" />
            Powered by Google Gemini 1.5
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Intelligent Civic <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC04]">Infrastructure for India.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Report issues via voice, text, or photos in any regional language. Our AI routes it directly to the right department.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
          <Link href="/report" className="px-8 py-4 bg-[#4285F4] hover:bg-[#4285F4]/90 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
            Report an Issue <ArrowRight className="w-5 h-5" />
          </Link>
          <a href={process.env.NEXT_PUBLIC_GOV_URL || "https://civic-pulse-gov.vercel.app"} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl font-bold text-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#34A853]" />
            Gov Portal Access
          </a>
          <Link href="/track" className="px-8 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-2xl font-bold text-lg shadow-sm transition-all flex items-center justify-center gap-2">
            Track Status <Search className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4 relative z-10 mt-12">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-[#EA4335]/10 text-[#EA4335] rounded-2xl flex items-center justify-center mb-6">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Voice & Multilingual</h3>
          <p className="text-gray-600 font-medium leading-relaxed">
            Speak in Hindi, Telugu, Marathi, or English. The AI instantly transcribes and translates your report.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-[#FBBC04]/10 text-[#FBBC04] rounded-2xl flex items-center justify-center mb-6">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Vision Analysis</h3>
          <p className="text-gray-600 font-medium leading-relaxed">
            Just snap a photo. Google Gemini automatically detects the severity of potholes, leaks, and hazards.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-[#34A853]/10 text-[#34A853] rounded-2xl flex items-center justify-center mb-6">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Nationwide Scale</h3>
          <p className="text-gray-600 font-medium leading-relaxed">
            Powered by H3 spatial indexing to seamlessly cluster and deduplicate reports across millions of citizens.
          </p>
        </div>
      </section>

      {/* Live Community Impact Map */}
      <section className="w-full px-4 mt-8 relative z-10">
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <MapIcon className="w-6 h-6 text-[#4285F4]" /> Live Community Impact
              </h2>
              <p className="text-gray-500 font-medium mt-1">See real-time civic issues reported by citizens across India.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-500">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#EA4335]"></div> Critical</span>
              <span className="flex items-center gap-1 ml-3"><div className="w-3 h-3 rounded-full bg-[#FBBC04]"></div> Medium</span>
              <span className="flex items-center gap-1 ml-3"><div className="w-3 h-3 rounded-full bg-[#4285F4]"></div> Logged</span>
            </div>
          </div>
          <div className="h-[400px] w-full bg-gray-100">
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
              <Map
                defaultCenter={{ lat: 21.1458, lng: 79.0882 }}
                defaultZoom={5}
                mapId="DEMO_CITIZEN_MAP"
                disableDefaultUI={true}
              >
                {liveReports.map((r, i) => (
                  <AdvancedMarker key={i} position={{ lat: r.latitude, lng: r.longitude }}>
                    <div style={{
                      width: '12px', height: '12px', borderRadius: '50%',
                      backgroundColor: r.severity === 'critical' || r.severity === 'high' ? '#EA4335' : r.severity === 'medium' ? '#FBBC04' : '#4285F4',
                      border: '2px solid white',
                      boxShadow: '0 0 8px rgba(0,0,0,0.2)'
                    }} />
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-12 text-sm font-bold text-gray-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#34A853]" />
          Secure & Encrypted Data
        </div>
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#4285F4]" />
          24/7 Automated Processing
        </div>
      </div>
    </div>
  );
}
