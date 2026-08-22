"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MapPin, CheckCircle2, Loader2, ArrowRight, Square } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";
import maplibregl from "maplibre-gl";
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

export default function ReportPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [progress, setProgress] = useState(0);
  const [aiResult, setAiResult] = useState<any>(null);
  
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    const authDataStr = sessionStorage.getItem("citizen_auth");
    if (!authDataStr) {
      router.push("/login?redirect=/report");
      return;
    }
    try {
      const authData = JSON.parse(authDataStr);
      if (!authData.isVerified) {
        router.push("/login?redirect=/report");
        return;
      }
      if (authData.name) setName(authData.name);
      if (authData.phone) setPhone(authData.phone);
      setIsVerified(true);
      setAuthChecked(true);
    } catch (e) {
      console.error("Could not parse citizen_auth");
      router.push("/login?redirect=/report");
    }
  }, [router]);

  const [mapLat, setMapLat] = useState<number>(28.6139); // Default to New Delhi
  const [mapLng, setMapLng] = useState<number>(77.2090);

  // Audio recording states
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setMapLat(latitude);
        setMapLng(longitude);
      }, (err) => {
        console.error("Location error:", err);
        alert("Could not get your location. Please check permissions.");
      });
    }
  };

  const toggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          setAudioBlob(blob);
          stream.getTracks().forEach(track => track.stop());
          
          // Auto-transcribe using Gemini multimodal via backend
          try {
            // First create a temporary request to get an ID for transcription
            const tempFormData = new FormData();
            tempFormData.append("file", blob, "recording.webm");
            // Send directly to a quick transcription check endpoint
            const transcribeRes = await fetch("/api/v1/transcribe-audio", {
              method: "POST",
              body: tempFormData,
            });
            if (transcribeRes.ok) {
              const { transcription } = await transcribeRes.json();
              if (transcription) {
                setText(transcription);
              }
            }
          } catch (err) {
            console.error("Transcription error:", err);
            // Silently fail — user can still type manually
          }
        };

        mediaRecorder.start();
        setRecording(true);
      } catch (err) {
        console.error(err);
        alert("Microphone access denied or not available.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isVerified) {
      alert("Please log in to verify your identity before submitting.");
      return;
    }

    setStep("processing");
    setProgress(30);

    const payload = {
      text: text.trim() || (audioBlob ? "Attached audio recording" : uploadedFile ? "Attached media file" : "No description provided"),
      country_code: "IN",
      source_channel: "web",
      language: "auto",
      consent: true,
      latitude: mapLat,
      longitude: mapLng,
      category: category || undefined,
      urgency: severity,
      citizen_name: isAnonymous ? undefined : (name || undefined),
      citizen_phone: isAnonymous ? undefined : (phone || undefined)
    };

    try {
      setProgress(60);
      const response = await fetch(`/api/v1/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail ? JSON.stringify(data.detail) : "Failed to create request");
      }
      
      const requestId = data.id || data.request_id;

      if (audioBlob || uploadedFile) {
        const formData = new FormData();
        if (audioBlob) {
          formData.append("file", audioBlob, "recording.webm");
        } else if (uploadedFile) {
          formData.append("file", uploadedFile);
        }
        
        await fetch(`/api/v1/requests/${requestId}/media`, {
          method: "POST",
          body: formData
        }).catch(err => console.error("Media upload failed", err));
      }
      
      setProgress(100);
      setAiResult({
        request_id: requestId,
        language: data.language || "Auto",
        category: data.category || category || "General",
        severity: data.urgency || severity,
        confidence: data.confidence || "90%",
        location: `Lat: ${mapLat.toFixed(2)}, Lng: ${mapLng.toFixed(2)}`
      });
      setTimeout(() => setStep("success"), 500);
    } catch (error: any) {
      console.error("API error", error);
      alert("Failed to submit report. Please ensure you have entered a description and try again. Error: " + error.message);
      setStep("form");
      setProgress(0);
    }
  };

  if (!authChecked) return null;

  if (step === "processing") {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 flex flex-col items-center justify-center space-y-12 text-center animate-in fade-in zoom-in-95 relative">
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#4285F4]/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        
        <div className="relative z-10 w-full bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
          <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-[#4285F4] animate-spin" />
              <span className="text-xs font-mono text-gray-400 font-bold tracking-widest uppercase">Gemini Multimodal Engine</span>
            </div>
          </div>
          
          <div className="p-8 text-left space-y-6 font-mono">
            <div className={`flex items-center gap-4 transition-all duration-500 ${progress >= 30 ? "text-[#34A853]" : "text-gray-500"}`}>
              {progress >= 30 ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />}
              <span className="text-sm md:text-base">> Initializing secure government connection...</span>
            </div>
            <div className={`flex items-center gap-4 transition-all duration-500 delay-300 ${progress >= 60 ? "text-[#34A853]" : progress >= 30 ? "text-[#4285F4]" : "text-gray-700"}`}>
              {progress >= 60 ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : progress >= 30 ? <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" /> : <div className="w-5 h-5 rounded-full border-2 border-gray-700 flex-shrink-0"></div>}
              <span className="text-sm md:text-base">> Parsing citizen media & extracting geospatial context...</span>
            </div>
            <div className={`flex items-center gap-4 transition-all duration-500 delay-500 ${progress >= 100 ? "text-[#34A853]" : progress >= 60 ? "text-[#4285F4]" : "text-gray-700"}`}>
              {progress >= 100 ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : progress >= 60 ? <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" /> : <div className="w-5 h-5 rounded-full border-2 border-gray-700 flex-shrink-0"></div>}
              <span className="text-sm md:text-base">> Structuring AI summary & routing to official dashboard...</span>
            </div>
          </div>
          
          <div className="w-full bg-gray-800 h-1 relative">
            <div className="h-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC04] transition-all duration-1000 ease-in-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "success" && aiResult) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 animate-in fade-in slide-in-from-bottom-4 relative">
        <div className="absolute top-0 right-10 w-72 h-72 bg-[#34A853]/10 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-[#4285F4]/10 rounded-full blur-3xl translate-y-1/2"></div>

        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100 text-center space-y-10 relative z-10">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-[#34A853] to-[#2ecc71] text-white rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#34A853]/30">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Report Registered</h2>
            <p className="text-gray-500 font-medium text-xl leading-relaxed">
              Your tracking reference is: <br/>
              <strong className="text-gray-900 bg-gray-50 px-5 py-2 rounded-2xl border border-gray-200 mt-3 inline-block shadow-sm font-mono text-xl">{aiResult.request_id}</strong>
            </p>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-[2rem] text-left text-sm text-gray-900 grid grid-cols-2 gap-8 border border-gray-200/60 shadow-inner">
            <div className="space-y-2">
              <span className="text-[#4285F4] font-bold uppercase tracking-wider block text-xs">AI Category</span> 
              <span className="font-bold text-xl">{aiResult.category}</span>
            </div>
            <div className="space-y-2">
              <span className="text-[#EA4335] font-bold uppercase tracking-wider block text-xs">AI Severity</span> 
              <span className="font-bold text-xl">{aiResult.severity}</span>
            </div>
            <div className="col-span-2 space-y-2">
              <span className="text-[#FBBC04] font-bold uppercase tracking-wider block text-xs">Location Summary</span> 
              <span className="font-bold text-lg leading-snug">{aiResult.location}</span>
            </div>
          </div>

          <Link href="/track" className="inline-flex items-center justify-center gap-3 w-full py-5 bg-[#4285F4] text-white rounded-2xl font-bold text-xl hover:bg-[#4285F4]/90 transition shadow-lg shadow-[#4285F4]/20 hover:shadow-xl hover:shadow-[#4285F4]/30">
            Track Status <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-12 mb-20 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#4285F4]/5 rounded-full blur-3xl -translate-y-1/2"></div>
      
      <div className="space-y-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">{t("reportTitle")}</h1>
        <p className="text-xl text-gray-500 font-medium">{t("reportDesc")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
        
        {/* Input Modes */}
        <div className="bg-white p-8 sm:p-12 rounded-[3rem] shadow-xl border border-gray-100 space-y-6">
          <label className="block text-xl font-extrabold text-gray-900">{t("describeIssue")}</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-8 bg-gray-50 border border-gray-200 rounded-[2.5rem] resize-none focus:bg-white focus:border-[#4285F4] focus:ring-4 focus:ring-[#4285F4]/10 outline-none h-48 text-gray-900 font-medium placeholder:text-gray-400 transition-all text-lg"
              placeholder={t("describePlaceholder")}
            ></textarea>

            <div className="flex flex-col gap-5 h-48">
              <div 
                onClick={toggleRecording}
                className={`flex-1 rounded-[2rem] flex items-center justify-center gap-3 cursor-pointer transition-all border-2 shadow-sm hover:shadow-md ${recording ? 'border-[#EA4335] bg-[#EA4335]/5 text-[#EA4335]' : audioBlob ? 'border-[#34A853] bg-[#34A853]/5 text-[#34A853]' : 'border-gray-200 bg-white hover:border-[#4285F4] hover:bg-gray-50 text-gray-600'}`}
              >
                {recording ? (
                  <Square className="w-6 h-6 text-[#EA4335] fill-[#EA4335] animate-pulse" />
                ) : (
                  <Mic className={`w-7 h-7 ${audioBlob ? 'text-[#34A853]' : 'text-gray-400'}`} />
                )}
                <span className="font-bold text-lg tracking-wide">
                  {recording ? "Recording..." : audioBlob ? "Recorded!" : t("tapRecord")}
                </span>
              </div>
              <label className={`flex-1 rounded-[2rem] flex items-center justify-center gap-3 cursor-pointer transition-all border-2 shadow-sm hover:shadow-md ${uploadedFile ? 'border-[#4285F4] bg-[#4285F4]/5 text-[#4285F4]' : 'border-gray-200 bg-white hover:border-[#4285F4] hover:bg-gray-50 text-gray-600'}`}>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,video/*" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadedFile(e.target.files[0]);
                    }
                  }} 
                />
                <span className="font-bold truncate px-4 text-lg tracking-wide">
                  {uploadedFile ? uploadedFile.name : t("orUpload")}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Location Input */}
        <div className="bg-surface p-8 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
          <div className="flex justify-between items-center">
            <label className="block text-lg font-bold text-primary">{t("location")}</label>
            <button type="button" onClick={handleUseMyLocation} className="px-5 py-3 bg-background text-primary rounded-2xl flex items-center gap-2 hover:bg-primary/5 transition font-bold text-sm">
              <MapPin className="w-4 h-4" /> {t("useMyLocation")}
            </button>
          </div>
          <div className="relative w-full h-[300px] bg-muted/20 rounded-2xl overflow-hidden border border-border/50">
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
              <Map
                defaultCenter={{ lat: mapLat, lng: mapLng }}
                defaultZoom={12}
                mapId="DEMO_MAP_ID"
                onClick={(e) => {
                  if (e.detail.latLng) {
                    setMapLat(e.detail.latLng.lat);
                    setMapLng(e.detail.latLng.lng);
                  }
                }}
              >
                <AdvancedMarker 
                  position={{ lat: mapLat, lng: mapLng }} 
                  draggable={true}
                  onDragEnd={(e) => {
                    if (e.latLng) {
                      setMapLat(e.latLng.lat());
                      setMapLng(e.latLng.lng());
                    }
                  }}
                />
              </Map>
            </APIProvider>
            
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm text-xs font-mono font-bold text-primary">
              Lat: {mapLat.toFixed(4)} | Lng: {mapLng.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Categorization & Urgency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-surface p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
            <label className="block text-lg font-bold text-primary">{t("category")}</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-5 bg-background border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-primary font-bold appearance-none cursor-pointer"
            >
              <option value="">Auto-detect category</option>
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
          <div className="bg-surface p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
            <label className="block text-lg font-bold text-primary">{t("severity")}</label>
            <select 
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full p-5 bg-background border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-primary font-bold appearance-none cursor-pointer"
            >
              <option value="Low">Low - Not urgent</option>
              <option value="Medium">Medium - Needs attention</option>
              <option value="High">High - Urgent / Dangerous</option>
            </select>
          </div>
        </div>

        {/* Privacy & Consent */}
        <div className="bg-surface p-8 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
          
          <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-2xl border border-border/50">
            <input 
              type="checkbox" 
              id="anonymous" 
              checked={isAnonymous} 
              onChange={(e) => { setIsAnonymous(e.target.checked); if(e.target.checked) setSmsAlerts(false); }} 
              className="w-5 h-5 text-primary rounded-md cursor-pointer" 
            />
            <label htmlFor="anonymous" className="text-primary font-bold cursor-pointer">
              Submit Anonymously (Hide my identity from public records)
            </label>
          </div>

          {!isAnonymous && (
            isVerified ? (
              <div className="bg-success/5 border border-success/20 p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-success font-bold text-lg mb-1">Identity Verified</p>
                  <p className="text-success/70 font-medium text-sm">Reporting as: {name} ({phone})</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="block text-lg font-bold text-primary">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe" 
                    className="w-full p-5 bg-background border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-primary font-bold placeholder:text-primary/40" 
                    required={!isAnonymous}
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-lg font-bold text-primary">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000" 
                    className="w-full p-5 bg-background border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-primary font-bold placeholder:text-primary/40" 
                    required={!isAnonymous}
                  />
                </div>
              </div>
            )
          )}

          {!isAnonymous && (
            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/20">
              <input 
                type="checkbox" 
                id="smsAlerts" 
                checked={smsAlerts} 
                onChange={(e) => setSmsAlerts(e.target.checked)} 
                className="w-5 h-5 text-primary rounded-md cursor-pointer" 
              />
              <label htmlFor="smsAlerts" className="text-primary font-bold cursor-pointer">
                Opt-in to receive real-time SMS status updates
              </label>
            </div>
          )}

          <div className="flex items-start gap-4">
            <input type="checkbox" id="consent" required className="mt-1.5 w-5 h-5 text-primary rounded-md border-gray-300 focus:ring-primary cursor-pointer" />
            <label htmlFor="consent" className="text-primary/60 font-medium leading-relaxed cursor-pointer">
              {t("consentLabel")}
            </label>
          </div>
        </div>

        <button type="submit" className="w-full py-6 bg-primary text-white rounded-[2rem] font-extrabold text-xl hover:bg-primary/90 transition shadow-lg flex items-center justify-center gap-3">
          {t("submitRequest")}
        </button>
      </form>
    </div>
  );
}
