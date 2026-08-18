"use client";

import { useState } from "react";
import { Mic, MapPin, UploadCloud, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ReportPage() {
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [progress, setProgress] = useState(0);
  const [aiResult, setAiResult] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("processing");
    
    // Simulate AI pipeline
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 15;
      setProgress(Math.min(currentProgress, 100));
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setAiResult({
          language: "English",
          category: "Roads",
          severity: "High",
          confidence: "92%",
          location: "Downtown Main St (Redacted)"
        });
        setTimeout(() => setStep("success"), 1000);
      }
    }, 500);
  };

  if (step === "processing") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 flex flex-col items-center justify-center space-y-8 text-center">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <h2 className="text-2xl font-bold">AI Analyzing Your Report</h2>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex flex-col gap-2 text-sm text-gray-600 font-medium w-full max-w-sm text-left">
          <div className={`flex items-center gap-2 ${progress >= 15 ? "text-primary" : "text-gray-400"}`}>
            <CheckCircle2 className="w-4 h-4" /> Request Submitted
          </div>
          <div className={`flex items-center gap-2 ${progress >= 30 ? "text-primary" : "text-gray-400"}`}>
            <CheckCircle2 className="w-4 h-4" /> Language Detected
          </div>
          <div className={`flex items-center gap-2 ${progress >= 45 ? "text-primary" : "text-gray-400"}`}>
            <CheckCircle2 className="w-4 h-4" /> Speech Transcribed
          </div>
          <div className={`flex items-center gap-2 ${progress >= 60 ? "text-primary" : "text-gray-400"}`}>
            <CheckCircle2 className="w-4 h-4" /> Problem Identified
          </div>
          <div className={`flex items-center gap-2 ${progress >= 75 ? "text-primary" : "text-gray-400"}`}>
            <CheckCircle2 className="w-4 h-4" /> Location Detected
          </div>
          <div className={`flex items-center gap-2 ${progress >= 90 ? "text-primary" : "text-gray-400"}`}>
            <CheckCircle2 className="w-4 h-4" /> Category Assigned
          </div>
        </div>
      </div>
    );
  }

  if (step === "success" && aiResult) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white border rounded-2xl p-8 shadow-sm text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Request Registered Successfully</h2>
          <p className="text-gray-600">Your tracking reference is: <strong className="text-black bg-gray-100 px-2 py-1 rounded">REQ-8924B</strong></p>
          
          <div className="bg-blue-50 p-4 rounded-xl text-left text-sm text-blue-900 grid grid-cols-2 gap-4">
            <div><span className="opacity-75 block">Category</span> <span className="font-semibold">{aiResult.category}</span></div>
            <div><span className="opacity-75 block">Severity</span> <span className="font-semibold text-red-600">{aiResult.severity}</span></div>
            <div><span className="opacity-75 block">Language</span> <span className="font-semibold">{aiResult.language}</span></div>
            <div><span className="opacity-75 block">AI Confidence</span> <span className="font-semibold">{aiResult.confidence}</span></div>
            <div className="col-span-2"><span className="opacity-75 block">Location Summary</span> <span className="font-semibold">{aiResult.location}</span></div>
          </div>

          <Link href="/track" className="inline-flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-blue-700 transition">
            Track My Request <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Report a Problem</h1>
        <p className="text-gray-600">Provide details about the issue. You can type or use your voice.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border">
        {/* Input Modes */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Describe the issue</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea 
              className="w-full p-4 border rounded-xl resize-none focus:ring-2 focus:ring-primary outline-none h-32"
              placeholder="What seems to be the problem?"
            ></textarea>
            <div className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 gap-3 hover:bg-gray-50 cursor-pointer transition">
              <Mic className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium">Tap to Record Audio</span>
              <span className="text-xs">or <span className="text-primary underline">upload a file</span></span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Detected Language: <span className="font-medium text-primary">Auto-detecting...</span></span>
            <select className="border-none bg-transparent font-medium cursor-pointer">
              <option>Manual Selection</option>
              <option>English</option>
              <option>Spanish</option>
            </select>
          </div>
        </div>

        {/* Location Input */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <div className="flex gap-2">
            <button type="button" className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl flex items-center gap-2 hover:bg-gray-200 transition font-medium">
              <MapPin className="w-5 h-5" /> Use My Location
            </button>
            <input type="text" placeholder="Or search for an address..." className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="w-full h-48 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm border overflow-hidden relative">
            <span className="absolute z-10 bg-white/80 px-3 py-1 rounded shadow-sm font-medium">MapLibre GL Map Area</span>
            <div className="absolute inset-0 opacity-50 bg-[url('https://maps.wikimedia.org/osm-intl/12/1207/1539.png')] bg-cover bg-center"></div>
          </div>
        </div>

        {/* Categorization & Urgency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select a category (Optional)</option>
              <option value="Water">Water</option>
              <option value="Roads">Roads</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Digital Connectivity">Digital Connectivity</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Energy">Energy</option>
              <option value="Public Safety">Public Safety</option>
              <option value="Environment">Environment</option>
              <option value="Transport">Transport</option>
              <option value="Housing">Housing</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Severity / Urgency</label>
            <select className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary">
              <option value="Low">Low - Not urgent</option>
              <option value="Medium">Medium - Needs attention soon</option>
              <option value="High">High - Urgent / Dangerous</option>
            </select>
          </div>
        </div>

        {/* Privacy & Consent */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-start gap-3">
            <input type="checkbox" id="consent" required className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
            <label htmlFor="consent" className="text-sm text-gray-600">
              I consent to the processing of this data for problem resolution. My personal information will be protected and my precise location will be obscured in public views.
            </label>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Contact Email (Optional)</label>
            <input type="email" placeholder="For updates on your request" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow flex items-center justify-center gap-2">
          Submit Request
        </button>
      </form>
    </div>
  );
}
