import Link from "next/link";
import { AlertTriangle, MapPin, Activity, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-12">
      <section className="text-center max-w-3xl space-y-6 mt-12">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
          Empowering Communities with AI
        </h1>
        <p className="text-xl text-gray-600">
          CivicPulse BRICS is an AI-driven public-investment and decision-support platform. 
          Report local issues, track resolution, and help build better infrastructure together.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Link href="/report" className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Report a Problem
          </Link>
          <Link href="/track" className="w-full sm:w-auto px-8 py-4 bg-white text-primary border-2 border-primary rounded-xl font-bold text-lg hover:bg-gray-50 transition shadow-sm flex items-center justify-center gap-2">
            <Activity className="w-5 h-5" />
            Track My Request
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">AI-Powered Analysis</h3>
          <p className="text-gray-600 text-sm">Automatically categorized and prioritized for rapid response.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Precise Location</h3>
          <p className="text-gray-600 text-sm">Map-based reporting to pinpoint exactly where help is needed.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Privacy First</h3>
          <p className="text-gray-600 text-sm">Your personal information and precise location are protected.</p>
        </div>
      </section>
    </div>
  );
}
