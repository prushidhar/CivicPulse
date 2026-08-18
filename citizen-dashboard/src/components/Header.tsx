"use client";

import React from "react";
import { useLanguage } from "@/lib/LanguageContext";

export default function Header() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">
            CP
          </div>
          <h1 className="text-xl font-bold text-gray-900">{t("title")}</h1>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="text-sm border-gray-300 rounded-md shadow-sm outline-none p-1"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="pt">Português</option>
            <option value="ru">Русский</option>
            <option value="zh">中文</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
      </div>
    </header>
  );
}
