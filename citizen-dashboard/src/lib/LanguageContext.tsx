"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "es" | "pt" | "ru" | "zh" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    title: "CivicPulse BRICS",
    heroTitle: "Empowering Communities with AI",
    heroSub: "CivicPulse BRICS is an AI-driven public-investment and decision-support platform. Report local issues, track resolution, and help build better infrastructure together.",
    reportBtn: "Report a Problem",
    trackBtn: "Track My Request",
    aiAnalysis: "AI-Powered Analysis",
    aiAnalysisSub: "Automatically categorized and prioritized for rapid response.",
    preciseLoc: "Precise Location",
    preciseLocSub: "Map-based reporting to pinpoint exactly where help is needed.",
    privacyFirst: "Privacy First",
    privacyFirstSub: "Your personal information and precise location are protected.",
    
    // Report Page
    reportTitle: "Report a Problem",
    reportDesc: "Provide details about the issue. You can type or use your voice.",
    describeIssue: "Describe the issue",
    describePlaceholder: "What seems to be the problem?",
    tapRecord: "Tap to Record Audio",
    orUpload: "or upload a file",
    detectedLang: "Detected Language:",
    location: "Location",
    useMyLocation: "Use My Location",
    searchAddress: "Or search for an address...",
    category: "Category",
    severity: "Severity / Urgency",
    consentLabel: "I consent to the processing of this data for problem resolution.",
    contactEmail: "Contact Email (Optional)",
    submitRequest: "Submit Request",
    
    // Track Page
    trackTitle: "Track Your Request",
    trackDesc: "Enter your reference number below to check the real-time status of your report.",
    trackPlaceholder: "e.g. REQ-8924B",
    track: "Track",
    underReview: "Under Review",
    problemSummary: "Problem Summary",
    lifecycleStatus: "Lifecycle Status",
    
    // Footer
    rights: "All rights reserved.",
    privacyPolicy: "Privacy Policy",
    terms: "Terms of Service",
    lowBandwidth: "Low-Bandwidth Mode"
  },
  es: {
    title: "CivicPulse BRICS",
    heroTitle: "Empoderando a las Comunidades con IA",
    heroSub: "CivicPulse BRICS es una plataforma de apoyo a la toma de decisiones e inversión pública impulsada por IA. Reporte problemas locales, siga su resolución y ayude a construir mejor infraestructura juntos.",
    reportBtn: "Reportar un Problema",
    trackBtn: "Rastrear mi Solicitud",
    aiAnalysis: "Análisis impulsado por IA",
    aiAnalysisSub: "Categorizado y priorizado automáticamente para una respuesta rápida.",
    preciseLoc: "Ubicación Precisa",
    preciseLocSub: "Reportes basados en mapas para señalar exactamente dónde se necesita ayuda.",
    privacyFirst: "Privacidad Primero",
    privacyFirstSub: "Su información personal y ubicación precisa están protegidas.",
    
    reportTitle: "Reportar un Problema",
    reportDesc: "Proporcione detalles sobre el problema. Puede escribir o usar su voz.",
    describeIssue: "Describa el problema",
    describePlaceholder: "¿Cuál parece ser el problema?",
    tapRecord: "Toca para Grabar Audio",
    orUpload: "o subir un archivo",
    detectedLang: "Idioma Detectado:",
    location: "Ubicación",
    useMyLocation: "Usar Mi Ubicación",
    searchAddress: "O buscar una dirección...",
    category: "Categoría",
    severity: "Severidad / Urgencia",
    consentLabel: "Doy mi consentimiento para el procesamiento de estos datos.",
    contactEmail: "Correo de contacto (Opcional)",
    submitRequest: "Enviar Solicitud",
    
    trackTitle: "Rastrear su Solicitud",
    trackDesc: "Ingrese su número de referencia a continuación para verificar el estado.",
    trackPlaceholder: "ej. REQ-8924B",
    track: "Rastrear",
    underReview: "En Revisión",
    problemSummary: "Resumen del Problema",
    lifecycleStatus: "Estado del Ciclo de Vida",
    
    rights: "Todos los derechos reservados.",
    privacyPolicy: "Política de Privacidad",
    terms: "Términos de Servicio",
    lowBandwidth: "Modo de Bajo Ancho de Banda"
  },
  hi: {
    title: "CivicPulse BRICS",
    heroTitle: "एआई के साथ समुदायों को सशक्त बनाना",
    heroSub: "CivicPulse BRICS एक एआई-संचालित सार्वजनिक-निवेश और निर्णय-समर्थन मंच है। स्थानीय समस्याओं की रिपोर्ट करें, समाधान ट्रैक करें।",
    reportBtn: "समस्या की रिपोर्ट करें",
    trackBtn: "मेरा अनुरोध ट्रैक करें",
    aiAnalysis: "एआई-संचालित विश्लेषण",
    aiAnalysisSub: "त्वरित प्रतिक्रिया के लिए स्वचालित रूप से वर्गीकृत।",
    preciseLoc: "सटीक स्थान",
    preciseLocSub: "सटीक रूप से इंगित करने के लिए मानचित्र-आधारित रिपोर्टिंग।",
    privacyFirst: "गोपनीयता पहले",
    privacyFirstSub: "आपकी व्यक्तिगत जानकारी और सटीक स्थान सुरक्षित हैं।",
    
    reportTitle: "समस्या की रिपोर्ट करें",
    reportDesc: "समस्या के बारे में विवरण प्रदान करें। आप टाइप कर सकते हैं या अपनी आवाज़ का उपयोग कर सकते हैं।",
    describeIssue: "समस्या का वर्णन करें",
    describePlaceholder: "क्या समस्या है?",
    tapRecord: "ऑडियो रिकॉर्ड करने के लिए टैप करें",
    orUpload: "या फ़ाइल अपलोड करें",
    detectedLang: "पहचानी गई भाषा:",
    location: "स्थान",
    useMyLocation: "मेरे स्थान का उपयोग करें",
    searchAddress: "या पता खोजें...",
    category: "श्रेणी",
    severity: "गंभीरता / तात्कालिकता",
    consentLabel: "मैं समस्या समाधान के लिए इस डेटा के प्रसंस्करण के लिए सहमति देता हूं।",
    contactEmail: "संपर्क ईमेल (वैकल्पिक)",
    submitRequest: "अनुरोध सबमिट करें",
    
    trackTitle: "अपना अनुरोध ट्रैक करें",
    trackDesc: "अपने रिपोर्ट की रीयल-टाइम स्थिति की जांच करने के लिए नीचे अपना संदर्भ संख्या दर्ज करें।",
    trackPlaceholder: "उदा. REQ-8924B",
    track: "ट्रैक करें",
    underReview: "समीक्षाधीन",
    problemSummary: "समस्या सारांश",
    lifecycleStatus: "जीवनचक्र स्थिति",
    
    rights: "सर्वाधिकार सुरक्षित।",
    privacyPolicy: "गोपनीयता नीति",
    terms: "सेवा की शर्तें",
    lowBandwidth: "कम बैंडविड्थ मोड"
  },
  pt: {
    title: "CivicPulse BRICS",
    heroTitle: "Capacitando Comunidades com IA",
    heroSub: "O CivicPulse BRICS é uma plataforma orientada por IA. Relate problemas locais e acompanhe a resolução.",
    reportBtn: "Relatar um Problema",
    trackBtn: "Acompanhar meu Pedido",
    aiAnalysis: "Análise por IA",
    aiAnalysisSub: "Categorizado automaticamente para resposta rápida.",
    preciseLoc: "Localização Precisa",
    preciseLocSub: "Relatórios baseados em mapas.",
    privacyFirst: "Privacidade em Primeiro Lugar",
    privacyFirstSub: "Suas informações estão protegidas.",
    
    reportTitle: "Relatar um Problema",
    reportDesc: "Forneça detalhes sobre o problema.",
    describeIssue: "Descreva o problema",
    describePlaceholder: "Qual é o problema?",
    tapRecord: "Toque para Gravar",
    orUpload: "ou envie um arquivo",
    detectedLang: "Idioma Detectado:",
    location: "Localização",
    useMyLocation: "Usar Minha Localização",
    searchAddress: "Ou pesquise um endereço...",
    category: "Categoria",
    severity: "Gravidade",
    consentLabel: "Eu concordo com o processamento destes dados.",
    contactEmail: "E-mail de Contato",
    submitRequest: "Enviar Pedido",
    
    trackTitle: "Acompanhar Pedido",
    trackDesc: "Insira seu número de referência.",
    trackPlaceholder: "ex. REQ-8924B",
    track: "Acompanhar",
    underReview: "Em Revisão",
    problemSummary: "Resumo do Problema",
    lifecycleStatus: "Status",
    
    rights: "Todos os direitos reservados.",
    privacyPolicy: "Política de Privacidade",
    terms: "Termos",
    lowBandwidth: "Modo Econômico"
  },
  ru: {
    title: "CivicPulse BRICS",
    heroTitle: "Расширение возможностей сообществ с помощью ИИ",
    heroSub: "CivicPulse BRICS — это платформа на базе ИИ. Сообщайте о проблемах и отслеживайте их решение.",
    reportBtn: "Сообщить о проблеме",
    trackBtn: "Отследить запрос",
    aiAnalysis: "Анализ на базе ИИ",
    aiAnalysisSub: "Автоматическая классификация для быстрого ответа.",
    preciseLoc: "Точное местоположение",
    preciseLocSub: "Отчеты на основе карт.",
    privacyFirst: "Конфиденциальность",
    privacyFirstSub: "Ваши данные защищены.",
    
    reportTitle: "Сообщить о проблеме",
    reportDesc: "Опишите проблему.",
    describeIssue: "Описание проблемы",
    describePlaceholder: "В чем проблема?",
    tapRecord: "Нажмите для записи",
    orUpload: "или загрузите файл",
    detectedLang: "Распознанный язык:",
    location: "Местоположение",
    useMyLocation: "Мое местоположение",
    searchAddress: "Или найдите адрес...",
    category: "Категория",
    severity: "Серьезность",
    consentLabel: "Я согласен на обработку данных.",
    contactEmail: "Контактный Email",
    submitRequest: "Отправить",
    
    trackTitle: "Отследить запрос",
    trackDesc: "Введите номер запроса.",
    trackPlaceholder: "напр. REQ-8924B",
    track: "Отследить",
    underReview: "На рассмотрении",
    problemSummary: "Суть проблемы",
    lifecycleStatus: "Статус",
    
    rights: "Все права защищены.",
    privacyPolicy: "Политика",
    terms: "Условия",
    lowBandwidth: "Экономия трафика"
  },
  zh: {
    title: "CivicPulse BRICS",
    heroTitle: "用 AI 赋能社区",
    heroSub: "CivicPulse BRICS 这是一个基于 AI 的平台。报告当地问题并跟踪解决进度。",
    reportBtn: "报告问题",
    trackBtn: "跟踪我的请求",
    aiAnalysis: "AI 分析",
    aiAnalysisSub: "自动分类以快速响应。",
    preciseLoc: "精准定位",
    preciseLocSub: "基于地图的报告。",
    privacyFirst: "隐私优先",
    privacyFirstSub: "您的信息受到保护。",
    
    reportTitle: "报告问题",
    reportDesc: "提供问题详情。",
    describeIssue: "描述问题",
    describePlaceholder: "出了什么问题？",
    tapRecord: "点击录音",
    orUpload: "或上传文件",
    detectedLang: "检测到的语言:",
    location: "位置",
    useMyLocation: "使用我的位置",
    searchAddress: "或搜索地址...",
    category: "类别",
    severity: "严重程度",
    consentLabel: "我同意处理这些数据。",
    contactEmail: "联系邮箱",
    submitRequest: "提交请求",
    
    trackTitle: "跟踪请求",
    trackDesc: "输入您的参考号。",
    trackPlaceholder: "例如 REQ-8924B",
    track: "跟踪",
    underReview: "审核中",
    problemSummary: "问题摘要",
    lifecycleStatus: "生命周期状态",
    
    rights: "版权所有。",
    privacyPolicy: "隐私政策",
    terms: "服务条款",
    lowBandwidth: "低带宽模式"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("preferred_language") as Language;
    if (saved && translations[saved]) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("preferred_language", lang);
  };

  const t = (key: string) => {
    return translations[language][key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
