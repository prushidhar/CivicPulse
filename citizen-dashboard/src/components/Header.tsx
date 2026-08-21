"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check initial auth state
    const checkAuth = () => {
      setIsLoggedIn(!!sessionStorage.getItem("citizen_auth"));
    };
    checkAuth();
    
    // Listen for custom event to update header instantly when logging in/out across components
    window.addEventListener("auth_changed", checkAuth);
    return () => window.removeEventListener("auth_changed", checkAuth);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("citizen_auth");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("auth_changed"));
    router.push("/");
  };

  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
            C
          </div>
          <h1 className="text-xl font-extrabold text-primary tracking-tight">CivicPulse BRICS</h1>
        </Link>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <button 
              onClick={handleLogout}
              className="hidden sm:flex items-center justify-center px-5 py-2.5 bg-danger/10 hover:bg-danger/20 text-danger font-bold rounded-xl transition shadow-sm border border-danger/20"
            >
              Logout
            </button>
          ) : (
            <Link 
              href="/login" 
              className="hidden sm:flex items-center justify-center px-5 py-2.5 bg-primary/5 hover:bg-primary/10 text-primary font-bold rounded-xl transition shadow-sm border border-primary/10"
            >
              Login / Sign Up
            </Link>
          )}
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="text-sm bg-surface border border-gray-200 text-primary rounded-xl shadow-sm outline-none px-3 py-2.5 font-medium focus:border-primary/30"
          >
            <option value="en">English</option>
            <option value="es">Espanol</option>
            <option value="pt">Portuguese</option>
            <option value="ru">Russian</option>
            <option value="zh">Chinese</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
      </div>
    </header>
  );
}
