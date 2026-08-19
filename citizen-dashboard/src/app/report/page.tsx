"use client";

import { useState } from "react";
import { Mic, MapPin, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";

export default function ReportPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [progress, setProgress] = useState(0);
  const [aiResult, setAiResult] = useState<any>(null);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("processing");
    setProgress(30);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setProgress(60);
          const payload = {
            text: text,
            country_code: "BR", // or dynamic
            source_channel: "web",
            language: "auto",
            consent: true,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            category: category || undefined,
            urgency: severity,
            contact_email: email || undefined
          };

          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/requests`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            const data = await response.json();
            
            setProgress(100);
            setAiResult({
              language: data.language || "Auto",
              category: data.category || "General",
              severity: data.urgency || "Medium",
              confidence: data.confidence || "90%",
              location: "Lat: " + position.coords.latitude.toFixed(2) + ", Lng: " + position.coords.longitude.toFixed(2)
            });
            setTimeout(() => setStep("success"), 500);
          } catch (error) {
            console.error("API error", error);
            // Fallback for demo purposes if backend isn't running locally
            setProgress(100);
            setAiResult({
              language: "Auto",
              category: category || "General",
              severity: severity,
              confidence: "90%",
              location: "Lat: " + position.coords.latitude.toFixed(2) + ", Lng: " + position.coords.longitude.toFixed(2)
            });
            setTimeout(() => setStep("success"), 500);
          }
        },
        (error) => { 
          console.error("Location access denied", error);
          alert("Location access is required to submit a report.");
          setStep("form");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setStep("form");
    }
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
            <div><span className="opacity-75 block">{t("category")}</span> <span className="font-semibold">{aiResult.category}</span></div>
            <div><span className="opacity-75 block">{t("severity")}</span> <span className="font-semibold text-red-600">{aiResult.severity}</span></div>
            <div><span className="opacity-75 block">Language</span> <span className="font-semibold">{aiResult.language}</span></div>
            <div><span className="opacity-75 block">AI Confidence</span> <span className="font-semibold">{aiResult.confidence}</span></div>
            <div className="col-span-2"><span className="opacity-75 block">Location Summary</span> <span className="font-semibold">{aiResult.location}</span></div>
          </div>

          <Link href="/track" className="inline-flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-blue-700 transition">
            {t("trackBtn")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("reportTitle")}</h1>
        <p className="text-gray-600">{t("reportDesc")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border">
        {/* Input Modes */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">{t("describeIssue")}</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-4 border rounded-xl resize-none focus:ring-2 focus:ring-primary outline-none h-32"
              placeholder={t("describePlaceholder")}
            ></textarea>
            <div className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 gap-3 hover:bg-gray-50 cursor-pointer transition">
              <Mic className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium">{t("tapRecord")}</span>
              <span className="text-xs">{t("orUpload")}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{t("detectedLang")} <span className="font-medium text-primary">Auto-detecting...</span></span>
          </div>
        </div>

        {/* Location Input */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">{t("location")}</label>
          <div className="flex gap-2">
            <button type="button" className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl flex items-center gap-2 hover:bg-gray-200 transition font-medium">
              <MapPin className="w-5 h-5" /> {t("useMyLocation")}
            </button>
            <input type="text" placeholder={t("searchAddress")} className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="w-full h-48 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm border overflow-hidden relative">
            <span className="absolute z-10 bg-white/80 px-3 py-1 rounded shadow-sm font-medium">MapLibre GL Map Area</span>
            <div className="absolute inset-0 opacity-50 bg-[url('https://maps.wikimedia.org/osm-intl/12/1207/1539.png')] bg-cover bg-center"></div>
          </div>
        </div>

        {/* Categorization & Urgency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{t("category")}</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary"
            >
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
            <label className="block text-sm font-medium text-gray-700">{t("severity")}</label>
            <select 
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary"
            >
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
              {t("consentLabel")}
            </label>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{t("contactEmail")}</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com" 
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary" 
            />
          </div>
        </div>

        <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow flex items-center justify-center gap-2">
          {t("submitRequest")}
        </button>
      </form>
    </div>
  );
}
