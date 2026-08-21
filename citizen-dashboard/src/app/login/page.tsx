"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Lock, User, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 5) {
      setError("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== "1234") {
      setError("Invalid OTP. Try 1234.");
      return;
    }
    setLoading(true);
    setError("");
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
      router.push("/report");
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
          Verify Identity
        </h1>
        <p className="text-gray-500 text-center font-medium mb-10 text-lg">
          {step === 1 && "Enter your phone number to receive a secure code."}
          {step === 2 && `We sent a code to ${phone}. Enter it below.`}
          {step === 3 && "Almost done! What should we call you?"}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold text-center mb-6 border border-red-100">
            {error}
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
                placeholder="Phone Number" 
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
                <>Send OTP <ArrowRight className="w-6 h-6" /></>
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
                placeholder="4-digit Code (e.g. 1234)" 
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
                <>Verify Code <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
            <button 
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-sm font-bold text-primary/60 hover:text-primary transition"
            >
              Change Phone Number
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
                placeholder="Full Name" 
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
                <>Complete Verification <CheckCircle className="w-5 h-5" /></>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// Add this missing icon since we use it above
function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
