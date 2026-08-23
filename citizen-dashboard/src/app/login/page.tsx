"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone, Lock, User, ArrowRight, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";

import { useLanguage } from "@/lib/LanguageContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const redirectPath = searchParams.get("redirect") || "/report";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoMessage, setDemoMessage] = useState("");

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 5) {
      setError("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    setError("");
    
    // Generate a random 4-digit OTP for demo purposes
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      // Simulate an SMS by showing an alert/message in the UI
      setDemoMessage(`[DEMO SMS] Your CivicPulse verification code is: ${newOtp}`);
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== generatedOtp) {
      setError("Invalid OTP. Please try again.");
      return;
    }
    setLoading(true);
    setError("");
    setDemoMessage("");
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 600);
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Please enter your full name");
      return;
    }
    
    // Save to sessionStorage so it clears when tab is closed
    const authData = {
      name: name.trim(),
      phone: phone.trim(),
      isVerified: true
    };
    sessionStorage.setItem("citizen_auth", JSON.stringify(authData));
    
    // Notify other components (like Header) to update immediately
    window.dispatchEvent(new Event("auth_changed"));
    
    setLoading(true);
    setTimeout(() => {
      router.push(redirectPath);
    }, 600);
  };

  return (
    <div className="max-w-lg mx-auto mt-16 px-4 mb-20 relative">
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-[#4285F4]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#EA4335]/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="bg-white p-8 sm:p-12 rounded-[3rem] shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4 relative z-10">
        
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-[#34A853]/10 text-[#34A853] rounded-full flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-10 h-10" />
          </div>
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 text-center tracking-tight mb-3">
          {t("verifyIdentity")}
        </h1>
        <p className="text-gray-500 text-center font-medium mb-10 text-lg">
          {step === 1 && t("loginStep1")}
          {step === 2 && t("loginStep2")}
          {step === 3 && t("loginStep3")}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold text-center mb-6 border border-red-100">
            {error}
          </div>
        )}

        {demoMessage && step === 2 && (
          <div className="bg-blue-50 text-blue-700 p-4 rounded-2xl text-sm font-bold text-center mb-6 border border-blue-200 animate-in fade-in slide-in-from-top-4 shadow-sm">
            {demoMessage}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="relative group">
              <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-[#4285F4] transition-colors" />
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("phoneNumber")} 
                className="w-full pl-16 pr-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-[#4285F4] focus:ring-4 focus:ring-[#4285F4]/10 text-gray-900 font-bold text-lg placeholder:text-gray-400 transition-all" 
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-[#4285F4] text-white rounded-2xl font-bold text-lg hover:bg-[#4285F4]/90 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>{t("sendOtp")} <ArrowRight className="w-6 h-6" /></>
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/40" />
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder={t("digitCode")} 
                maxLength={4}
                className="w-full pl-14 pr-6 py-4 bg-background border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-primary font-bold text-lg text-center tracking-widest placeholder:text-primary/40 transition placeholder:tracking-normal" 
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition shadow-md flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>{t("verifyCode")} <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
            <button 
              type="button"
              onClick={() => { setStep(1); setDemoMessage(""); setOtp(""); }}
              className="w-full text-center text-sm font-bold text-primary/60 hover:text-primary transition"
            >
              {t("changePhone")}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleComplete} className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/40" />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("fullName")} 
                className="w-full pl-14 pr-6 py-4 bg-background border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-primary font-bold text-lg placeholder:text-primary/40 transition" 
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition shadow-md flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>{t("completeVerify")} <CheckCircle2 className="w-5 h-5" /></>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
