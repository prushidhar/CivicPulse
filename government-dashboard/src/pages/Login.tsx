import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, KeyRound, Smartphone, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Login() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    setIsLoading(true);
    
    // Simulate API call to send OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '1234') {
      setError('Invalid OTP code. Please use 1234.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Simulate verification delay
    setTimeout(() => {
      localStorage.setItem('isAdminAuthenticated', 'true');
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">CivicPulse Admin</h1>
          <p className="text-muted-foreground mt-2">Secure Government Dashboard</p>
        </div>

        <Card className="bg-white border-none shadow-xl shadow-slate-200/50">
          <CardHeader>
            <CardTitle>{step === 1 ? 'Admin Authentication' : 'Verify Identity'}</CardTitle>
            <CardDescription>
              {step === 1 
                ? 'Enter your authorized phone number to receive a one-time password.' 
                : 'Enter the 4-digit code sent to your device.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            
            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-4 py-2 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-transparent"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Send Secure Code
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">One-Time Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="• • • •"
                      className="w-full pl-10 pr-4 py-2 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-transparent tracking-[0.5em] font-mono text-lg"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">Mock code: 1234</p>
                </div>
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Verify & Access Dashboard'
                  )}
                </Button>
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="w-full text-sm text-muted-foreground hover:text-primary transition-colors mt-4"
                >
                  Back to phone number
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
