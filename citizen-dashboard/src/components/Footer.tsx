"use client";

import React from "react";
import { useLanguage } from "@/lib/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm font-bold text-gray-400">&copy; 2026 {t("title")}. {t("rights")}</p>
        <div className="flex space-x-6 text-sm font-medium text-gray-500">
          <a href="#" className="hover:text-[#4285F4] transition-colors">{t("privacyPolicy")}</a>
          <a href="#" className="hover:text-[#4285F4] transition-colors">{t("terms")}</a>
          <a href="#" className="hover:text-[#4285F4] transition-colors">{t("lowBandwidth")}</a>
        </div>
      </div>
    </footer>
  );
}
