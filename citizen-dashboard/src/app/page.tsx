"use client";

import Link from "next/link";
import { MessageCircle, FileText, Search, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  const timeOfDay = new Date().getHours();
  const greeting = timeOfDay < 12 ? "Good morning" : timeOfDay < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col items-center justify-center space-y-12 max-w-4xl mx-auto mt-8">
      {/* Assistant Greeting Area */}
      <section className="w-full bg-surface p-10 md:p-14 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mb-6 shadow-xl">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
            {greeting}, Citizen.
          </h1>
          <p className="text-xl text-primary/70 max-w-2xl mx-auto font-medium">
            I am Corra, your public services assistant. What would you like to do today?
          </p>
        </div>
      </section>

      {/* Quick Actions (Conversational Cards) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <Link href="/report" className="group bg-surface p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all flex flex-col justify-between min-h-[200px]">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-primary">Report an issue</h3>
            <p className="text-primary/60 font-medium leading-relaxed">
              Found a pothole, leak, or hazard? Tell me what's wrong and I'll route it to the right department.
            </p>
          </div>
          <div className="mt-8 flex items-center gap-2 text-secondary font-bold group-hover:gap-4 transition-all">
            Start report <ArrowRight className="w-5 h-5" />
          </div>
        </Link>

        <Link href="/track" className="group bg-surface p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all flex flex-col justify-between min-h-[200px]">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-primary">Track a request</h3>
            <p className="text-primary/60 font-medium leading-relaxed">
              Have a tracking ID? Enter it here to see real-time updates on your existing requests.
            </p>
          </div>
          <div className="mt-8 flex items-center gap-2 text-primary font-bold group-hover:gap-4 transition-all">
            Check status <ArrowRight className="w-5 h-5" />
          </div>
        </Link>
      </section>

      {/* Trust & Privacy Badges */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 text-sm font-medium text-primary/50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          Secure & Encrypted
        </div>
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Powered by AI Assistant
        </div>
      </div>
    </div>
  );
}
