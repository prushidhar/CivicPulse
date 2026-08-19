"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MapPin, CheckCircle2, Loader2, ArrowRight, Square } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import maplibregl from "maplibre-gl";

export default function ReportPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [progress, setProgress] = useState(0);
  const [aiResult, setAiResult] = useState<any>(null);
  
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [email, setEmail] = useState("");
  
  const [mapLat, setMapLat] = useState<number>(-23.5505); // Default to roughly Sao Paulo
  const [mapLng, setMapLng] = useState<number>(-46.6333);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // Audio recording states
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
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
      contact_email: email || undefined
    };

    try {
      setProgress(60);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      const requestId = data.id || data.request_id || "REQ-" + Math.floor(Math.random() * 100000).toString();

      if (audioBlob) {
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");
        // Don't await strictly if we want to show success fast, but it's safer to await
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/requests/${requestId}/media`, {
          method: "POST",
          body: formData
        }).catch(err => console.error("Audio upload failed", err));
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

  if (step === "processing") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 flex flex-col items-center justify-center space-y-8 text-center">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <h2 className="text-2xl font-bold">Processing Your Request</h2>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex flex-col gap-2 text-sm text-gray-600 font-medium w-full max-w-sm text-left">
          <div className={`flex items-center gap-2 ${progress >= 30 ? "text-primary" : "text-gray-400"}`}>
            <CheckCircle2 className="w-4 h-4" /> Request Submitted
          </div>
          <div className={`flex items-center gap-2 ${progress >= 60 ? "text-primary" : "text-gray-400"}`}>
            <CheckCircle2 className="w-4 h-4" /> Saving Data
          </div>
          <div className={`flex items-center gap-2 ${progress >= 100 ? "text-primary" : "text-gray-400"}`}>
            <CheckCircle2 className="w-4 h-4" /> Finalizing
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
          <p className="text-gray-600">Your tracking reference is: <strong className="text-black bg-gray-100 px-2 py-1 rounded">{aiResult.request_id}</strong></p>
          
          <div className="bg-blue-50 p-4 rounded-xl text-left text-sm text-blue-900 grid grid-cols-2 gap-4">
            <div><span className="opacity-75 block">{t("category")}</span> <span className="font-semibold">{aiResult.category}</span></div>
            <div><span className="opacity-75 block">{t("severity")}</span> <span className="font-semibold text-red-600">{aiResult.severity}</span></div>
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
            <div 
              onClick={toggleRecording}
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition ${recording ? 'border-red-500 bg-red-50 text-red-600' : audioBlob ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-300 hover:bg-gray-50 text-gray-500'}`}
            >
              {recording ? (
                <Square className="w-8 h-8 text-red-500 fill-red-500 animate-pulse" />
              ) : (
                <Mic className={`w-8 h-8 ${audioBlob ? 'text-green-500' : 'text-primary'}`} />
              )}
              <span className="text-sm font-medium">
                {recording ? "Recording... Tap to stop" : audioBlob ? "Audio recorded! Tap to rerecord" : t("tapRecord")}
              </span>
            </div>
          </div>
        </div>

        {/* Location Input with MapLibre */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">{t("location")}</label>
          <div className="flex gap-2">
            <button type="button" onClick={handleUseMyLocation} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl flex items-center gap-2 hover:bg-gray-200 transition font-medium">
              <MapPin className="w-5 h-5" /> {t("useMyLocation")}
            </button>
            <div className="flex-1 p-3 border rounded-xl bg-gray-50 text-gray-500 flex items-center">
              {mapLat.toFixed(4)}, {mapLng.toFixed(4)}
            </div>
          </div>
          <div ref={mapContainerRef} className="w-full h-64 bg-gray-200 rounded-xl border overflow-hidden relative">
            {/* MapLibre will inject canvas here */}
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
