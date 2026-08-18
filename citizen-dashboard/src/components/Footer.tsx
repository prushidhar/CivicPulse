"use client";

import React from "react";
import { useLanguage } from "@/lib/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white mt-auto border-t">
      <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
        <p>&copy; 2026 {t("title")}. {t("rights")}</p>
        <div className="mt-2 space-x-4">
          <a href="#" className="hover:text-primary">{t("privacyPolicy")}</a>
          <a href="#" className="hover:text-primary">{t("terms")}</a>
          <a href="#" className="hover:text-primary">{t("lowBandwidth")}</a>
        </div>
      </div>
    </footer>
  );
}
