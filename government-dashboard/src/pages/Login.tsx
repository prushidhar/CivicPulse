import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Smartphone, ArrowRight, Loader2, KeyRound, Lock, Database, Globe, Zap } from 'lucide-react';

export default function Login() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAppLoader, setShowAppLoader] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 5) {
      setError('Please enter a valid authorized number.');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '1234' && otp !== 'admin') {
      setError('Invalid OTP code. Please use 1234.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      setIsLoading(false);
      setShowAppLoader(true);
      
      setTimeout(() => {
        localStorage.setItem('isAdminAuthenticated', 'true');
        navigate('/dashboard');
      }, 2500);
    }, 600);
  };

  if (showAppLoader) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden">
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-[#4285F4]/10 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#EA4335]/10 rounded-full blur-3xl -translate-y-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
          <div className="w-24 h-24 mb-8 bg-[#34A853]/10 text-[#34A853] rounded-full flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">Authenticating Secure Session</h1>
          <div className="flex items-center gap-3 text-[#4285F4] font-bold text-lg">
            <Loader2 className="w-6 h-6 animate-spin" />
            Establishing encrypted connection to CivicPulse BRICS...
          </div>
          
          <div className="mt-12 w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC04] animate-pulse w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Blurred Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4285F4]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#EA4335]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      {/* Navigation */}
      <nav className="w-full px-8 py-6 relative z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-[#4285F4]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-gray-900">CivicPulse <span className="text-[#4285F4]">Gov</span></span>
        </div>
        <a href="http://localhost:3000" className="text-sm font-bold text-gray-500 hover:text-[#4285F4] transition-colors">
          Citizen Portal &rarr;
        </a>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-8 py-12 gap-16 relative z-10 items-center">
        
        {/* Landing Page Content */}
        <div className="flex-1 space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm text-sm font-bold text-[#EA4335]">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EA4335] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#EA4335]"></span>
            </span>
            Live BRICS Infrastructure Monitoring
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Intelligent <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] to-[#EA4335]">Governance</span> <br/>At Scale.
          </h1>
          
          <p className="text-xl text-gray-500 font-medium max-w-xl leading-relaxed">
            CivicPulse equips administrators with AI-driven analytics, geospatial mapping, and automated prioritization to rapidly respond to citizen infrastructure reports.
          </p>

          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-2xl bg-white shadow-sm text-[#FBBC04]">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Geospatial Intelligence</h3>
                <p className="text-sm text-gray-500 mt-1">H3 clustering for pinpoint accuracy.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-2xl bg-white shadow-sm text-[#34A853]">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Real-time AI Prioritization</h3>
                <p className="text-sm text-gray-500 mt-1">Gemini powered multimodal triage.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md">
          <div className="bg-white p-8 sm:p-12 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-[#4285F4]/10 text-[#4285F4] rounded-full flex items-center justify-center shadow-inner">
                <Lock className="w-10 h-10" />
              </div>
            </div>
            
            <h2 className="text-3xl font-extrabold text-gray-900 text-center tracking-tight mb-3">
              Secure Access
            </h2>
            <p className="text-gray-500 text-center font-medium mb-10 text-lg">
              {step === 1 ? "Enter authorized mobile number." : "Enter your 2FA security code."}
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold text-center mb-6 border border-red-100">
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="relative group">
                  <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-[#4285F4] transition-colors" />
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Official Mobile Number"
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-[#4285F4] focus:ring-4 focus:ring-[#4285F4]/10 text-gray-900 font-bold text-lg placeholder:text-gray-400 transition-all"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-[#4285F4] text-white rounded-2xl font-bold text-lg hover:bg-[#4285F4]/90 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>Send Code <ArrowRight className="w-6 h-6" /></>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="relative group">
                  <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-[#34A853] transition-colors" />
                  <input 
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="4-Digit Code"
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-[#34A853] focus:ring-4 focus:ring-[#34A853]/10 text-gray-900 font-bold text-lg placeholder:text-gray-400 tracking-[1em] text-center transition-all"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-[#34A853] text-white rounded-2xl font-bold text-lg hover:bg-[#34A853]/90 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>Verify Identity <ArrowRight className="w-6 h-6" /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
