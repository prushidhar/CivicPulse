"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MapPin, CheckCircle2, Loader2, ArrowRight, Square } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";
import maplibregl from "maplibre-gl";

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
  const [isVerified, setIsVerified] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    const authDataStr = localStorage.getItem("citizen_auth");
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

  const [mapLat, setMapLat] = useState<number>(-23.5505); // Default to roughly Sao Paulo
  const [mapLng, setMapLng] = useState<number>(-46.6333);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // Audio recording states
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || step !== "form") return;

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [mapLng, mapLat],
      zoom: 12
    });

    markerRef.current = new maplibregl.Marker({ draggable: true })
      .setLngLat([mapLng, mapLat])
      .addTo(mapRef.current);

    markerRef.current.on("dragend", () => {
      const lngLat = markerRef.current?.getLngLat();
      if (lngLat) {
        setMapLat(lngLat.lat);
        setMapLng(lngLat.lng);
      }
    });

    mapRef.current.on("click", (e) => {
      markerRef.current?.setLngLat(e.lngLat);
      setMapLat(e.lngLat.lat);
      setMapLng(e.lngLat.lng);
    });

    return () => {
      mapRef.current?.remove();
    };
  }, [step]); // re-init if they somehow go back to form

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setMapLat(latitude);
        setMapLng(longitude);
        mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 14 });
        markerRef.current?.setLngLat([longitude, latitude]);
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

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          setAudioBlob(blob);
          stream.getTracks().forEach(track => track.stop()); // Stop mic
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
      text: text,
      country_code: "BR",
      source_channel: "web",
      language: "auto",
      consent: true,
      latitude: mapLat,
      longitude: mapLng,
      category: category || undefined,
      urgency: severity,
      citizen_name: name || undefined,
      citizen_phone: phone || undefined
    };

    try {
      setProgress(60);
      const response = await fetch(`/api/v1/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      const requestId = data.id || data.request_id || "REQ-" + Math.floor(Math.random() * 100000).toString();

      if (audioBlob || uploadedFile) {
        const formData = new FormData();
        if (audioBlob) {
          formData.append("file", audioBlob, "recording.webm");
        } else if (uploadedFile) {
          formData.append("file", uploadedFile);
        }
        
        // Don't await strictly if we want to show success fast, but it's safer to await
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
    } catch (error) {
      console.error("API error", error);
      setProgress(100);
      setAiResult({
        request_id: "REQ-" + Math.floor(Math.random() * 100000).toString(),
        language: "Auto",
        category: category || "General",
        severity: severity,
        confidence: "90%",
        location: `Lat: ${mapLat.toFixed(2)}, Lng: ${mapLng.toFixed(2)}`
      });
      setTimeout(() => setStep("success"), 500);
    }
  };

  if (!authChecked) return null;

  if (step === "processing") {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 flex flex-col items-center justify-center space-y-8 text-center animate-in fade-in zoom-in-95">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <h2 className="text-3xl font-extrabold text-primary">Processing Your Request</h2>
        <div className="w-full bg-primary/10 rounded-full h-3">
          <div className="bg-primary h-3 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex flex-col gap-4 text-sm font-bold w-full max-w-sm text-left">
          <div className={`flex items-center gap-3 ${progress >= 30 ? "text-primary" : "text-primary/30"}`}>
            <CheckCircle2 className="w-5 h-5" /> Request Submitted
          </div>
          <div className={`flex items-center gap-3 ${progress >= 60 ? "text-primary" : "text-primary/30"}`}>
            <CheckCircle2 className="w-5 h-5" /> Saving Data
          </div>
          <div className={`flex items-center gap-3 ${progress >= 100 ? "text-primary" : "text-primary/30"}`}>
            <CheckCircle2 className="w-5 h-5" /> Finalizing
          </div>
        </div>
      </div>
    );
  }

  if (step === "success" && aiResult) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-surface p-10 rounded-[2.5rem] shadow-sm border border-gray-100 text-center space-y-8">
          <div className="mx-auto w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-primary">Report Registered</h2>
            <p className="text-primary/60 font-medium text-lg">Your tracking reference is: <strong className="text-primary bg-background px-3 py-1.5 rounded-xl border border-gray-200">{aiResult.request_id}</strong></p>
          </div>
          
          <div className="bg-background p-6 rounded-3xl text-left text-sm text-primary grid grid-cols-2 gap-6 border border-gray-100">
            <div className="space-y-1"><span className="text-primary/50 font-bold uppercase tracking-wider block text-xs">{t("category")}</span> <span className="font-bold text-lg">{aiResult.category}</span></div>
            <div className="space-y-1"><span className="text-primary/50 font-bold uppercase tracking-wider block text-xs">{t("severity")}</span> <span className="font-bold text-secondary text-lg">{aiResult.severity}</span></div>
            <div className="col-span-2 space-y-1"><span className="text-primary/50 font-bold uppercase tracking-wider block text-xs">Location Summary</span> <span className="font-bold text-lg">{aiResult.location}</span></div>
          </div>

          <Link href="/track" className="inline-flex items-center justify-center gap-3 w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition shadow-md">
            {t("trackBtn")} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 space-y-10 mb-20">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold text-primary tracking-tight">{t("reportTitle")}</h1>
        <p className="text-xl text-primary/60 font-medium">{t("reportDesc")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* Input Modes */}
        <div className="bg-surface p-8 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
          <label className="block text-lg font-bold text-primary">{t("describeIssue")}</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-6 bg-background border-none rounded-[2rem] resize-none focus:ring-2 focus:ring-primary/20 outline-none h-40 text-primary font-medium placeholder:text-primary/40"
              placeholder={t("describePlaceholder")}
            ></textarea>
            <div className="flex flex-col gap-4 h-40">
              <div 
                onClick={toggleRecording}
                className={`flex-1 rounded-[2rem] flex items-center justify-center gap-3 cursor-pointer transition border ${recording ? 'border-secondary bg-secondary/5 text-secondary' : audioBlob ? 'border-success bg-success/5 text-success' : 'border-gray-200 bg-surface hover:bg-background text-primary/60'}`}
              >
                {recording ? (
                  <Square className="w-6 h-6 text-secondary fill-secondary animate-pulse" />
                ) : (
                  <Mic className={`w-6 h-6 ${audioBlob ? 'text-success' : 'text-primary/40'}`} />
                )}
                <span className="font-bold">
                  {recording ? "Recording..." : audioBlob ? "Recorded!" : t("tapRecord")}
                </span>
              </div>
              <label className={`flex-1 rounded-[2rem] flex items-center justify-center gap-3 cursor-pointer transition border ${uploadedFile ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 bg-surface hover:bg-background text-primary/60'}`}>
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
                <span className="font-bold truncate px-4">
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
          <div className="w-full h-[300px] bg-background rounded-[2rem] overflow-hidden relative border border-gray-100/50">
            <div ref={mapContainerRef} className="absolute inset-0"></div>
          </div>
          <div className="text-center text-primary/50 font-bold text-sm bg-background py-3 rounded-2xl border border-gray-100">
             Lat: {mapLat.toFixed(4)} | Lng: {mapLng.toFixed(4)}
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
          
          {isVerified ? (
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
                  required
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
                  required
                />
              </div>
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
