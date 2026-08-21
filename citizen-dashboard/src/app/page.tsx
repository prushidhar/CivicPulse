"use client";

import Link from "next/link";
import { MessageCircle, FileText, Search, ArrowRight, ShieldCheck, HelpCircle, Map, Zap, Globe, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

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
