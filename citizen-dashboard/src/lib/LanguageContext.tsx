"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "es" | "pt" | "ru" | "zh" | "hi" | "te" | "ta" | "bn" | "mr" | "gu" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    poweredBy: "Powered by Google Gemini 2.5",
    intelligentCivic: "Intelligent Civic",
    infraForIndia: "Infrastructure for India.",
    heroDesc: "Report issues via voice, text, or photos in any regional language. Our AI routes it directly to the right department.",
    reportAnIssue: "Report an Issue",
    govPortalAccess: "Gov Portal Access",
    trackStatus: "Track Status",
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
    poweredBy: "Powered by Google Gemini 2.5",
    intelligentCivic: "Intelligent Civic",
    infraForIndia: "Infrastructure for India.",
    heroDesc: "Report issues via voice, text, or photos in any regional language. Our AI routes it directly to the right department.",
    reportAnIssue: "Report an Issue",
    govPortalAccess: "Gov Portal Access",
    trackStatus: "Track Status",
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
    poweredBy: "Google Gemini 2.5 द्वारा संचालित",
    intelligentCivic: "स्मार्ट नागरिक",
    infraForIndia: "भारत के लिए बुनियादी ढांचा।",
    heroDesc: "अपनी क्षेत्रीय भाषा में आवाज, टेक्स्ट या फोटो के माध्यम से समस्याओं की रिपोर्ट करें। हमारा AI इसे सीधे संबंधित विभाग को भेजता है।",
    reportAnIssue: "समस्या की रिपोर्ट करें",
    govPortalAccess: "सरकारी पोर्टल एक्सेस",
    trackStatus: "स्थिति ट्रैक करें",
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
    poweredBy: "Powered by Google Gemini 2.5",
    intelligentCivic: "Intelligent Civic",
    infraForIndia: "Infrastructure for India.",
    heroDesc: "Report issues via voice, text, or photos in any regional language. Our AI routes it directly to the right department.",
    reportAnIssue: "Report an Issue",
    govPortalAccess: "Gov Portal Access",
    trackStatus: "Track Status",
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
    poweredBy: "Powered by Google Gemini 2.5",
    intelligentCivic: "Intelligent Civic",
    infraForIndia: "Infrastructure for India.",
    heroDesc: "Report issues via voice, text, or photos in any regional language. Our AI routes it directly to the right department.",
    reportAnIssue: "Report an Issue",
    govPortalAccess: "Gov Portal Access",
    trackStatus: "Track Status",
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
    poweredBy: "Powered by Google Gemini 2.5",
    intelligentCivic: "Intelligent Civic",
    infraForIndia: "Infrastructure for India.",
    heroDesc: "Report issues via voice, text, or photos in any regional language. Our AI routes it directly to the right department.",
    reportAnIssue: "Report an Issue",
    govPortalAccess: "Gov Portal Access",
    trackStatus: "Track Status",
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
  },
  te: {
    poweredBy: "Google Gemini 2.5 ద్వారా ఆధారితం",
    intelligentCivic: "స్మార్ట్ సిటిజన్",
    infraForIndia: "భారతదేశం కోసం మౌలిక సదుపాయాలు.",
    heroDesc: "మీ ప్రాంతీయ భాషలో వాయిస్, టెక్స్ట్ లేదా ఫోటోల ద్వారా సమస్యలను నివేదించండి. మా AI దానిని నేరుగా సంబంధిత విభాగానికి పంపుతుంది.",
    reportAnIssue: "సమస్యను నివేదించండి",
    govPortalAccess: "ప్రభుత్వ పోర్టల్ యాక్సెస్",
    trackStatus: "స్థితిని ట్రాక్ చేయండి",
    title: "CivicPulse BRICS",
    reportBtn: "సమస్యను నివేదించండి", trackBtn: "నా అభ్యర్థనను ట్రాక్ చేయండి", aiAnalysis: "AI-ఆధారిత విశ్లేషణ", aiAnalysisSub: "త్వరిత ప్రతిస్పందన కోసం స్వయంచాలకంగా వర్గీకరించబడింది.",
    preciseLoc: "ఖచ్చితమైన స్థానం", preciseLocSub: "మ్యాప్ ఆధారిత నివేదన.", privacyFirst: "గోప్యతకు ప్రాధాన్యత", privacyFirstSub: "మీ వ్యక్తిగత సమాచారం రక్షించబడుతుంది.",
    reportTitle: "సమస్యను నివేదించండి", reportDesc: "సమస్య గురించి వివరాలను అందించండి.", describeIssue: "సమస్యను వివరించండి", describePlaceholder: "సమస్య ఏమిటి?",
    tapRecord: "ఆడియో రికార్డ్ చేయడానికి నొక్కండి", orUpload: "లేదా ఫైల్‌ను అప్‌లోడ్ చేయండి", detectedLang: "గుర్తించబడిన భాష:", location: "స్థానం", useMyLocation: "నా స్థానాన్ని ఉపయోగించండి", searchAddress: "లేదా చిరునామా కోసం శోధించండి...",
    category: "వర్గం", severity: "తీవ్రత", consentLabel: "నేను డేటా ప్రాసెసింగ్‌కు అంగీకరిస్తున్నాను.", contactEmail: "సంప్రదింపు ఇమెయిల్", submitRequest: "సమర్పించండి",
    trackTitle: "అభ్యర్థనను ట్రాక్ చేయండి", trackDesc: "మీ రిఫరెన్స్ నంబర్‌ను నమోదు చేయండి.", trackPlaceholder: "ఉదా. REQ-8924B", track: "ట్రాక్ చేయండి", underReview: "సమీక్షలో ఉంది", problemSummary: "సమస్య సారాంశం", lifecycleStatus: "స్థితి",
    rights: "అన్ని హక్కులూ ప్రత్యేకించుకోబడ్డాయి.", privacyPolicy: "గోప్యతా విధానం", terms: "సేవా నిబంధనలు", lowBandwidth: "తక్కువ బ్యాండ్‌విడ్త్ మోడ్"
  },
  ta: {
    title: "CivicPulse BRICS",
    poweredBy: "Powered by Google Gemini 2.5",
    intelligentCivic: "Intelligent Civic",
    infraForIndia: "Infrastructure for India.",
    heroDesc: "Report issues via voice, text, or photos in any regional language. Our AI routes it directly to the right department.",
    reportAnIssue: "Report an Issue",
    govPortalAccess: "Gov Portal Access",
    trackStatus: "Track Status", heroTitle: "AI மூலம் சமூகங்களை மேம்படுத்துதல்", heroSub: "உள்ளூர் பிரச்சனைகளை புகாரளித்து, அதன் தீர்வை கண்காணிக்கவும்.",
    reportBtn: "புகாரளி", trackBtn: "கோரிக்கையை கண்காணிக்க", aiAnalysis: "AI பகுப்பாய்வு", aiAnalysisSub: "விரைவான பதிலுக்கு தானாகவே வகைப்படுத்தப்படுகிறது.",
    preciseLoc: "துல்லியமான இடம்", preciseLocSub: "வரைபடம் சார்ந்த புகாரளித்தல்.", privacyFirst: "தனியுரிமை", privacyFirstSub: "உங்கள் தகவல்கள் பாதுகாக்கப்படுகின்றன.",
    reportTitle: "புகாரளி", reportDesc: "பிரச்சனை பற்றிய விவரங்களை வழங்கவும்.", describeIssue: "பிரச்சனையை விவரிக்கவும்", describePlaceholder: "என்ன பிரச்சனை?",
    tapRecord: "ஒலியை பதிவு செய்ய தட்டவும்", orUpload: "அல்லது கோப்பை பதிவேற்றவும்", detectedLang: "கண்டறியப்பட்ட மொழி:", location: "இடம்", useMyLocation: "என் இடத்தை பயன்படுத்து", searchAddress: "அல்லது முகவரியை தேடவும்...",
    category: "வகை", severity: "தீவிரம்", consentLabel: "தரவு செயலாக்கத்திற்கு நான் சம்மதிக்கிறேன்.", contactEmail: "மின்னஞ்சல்", submitRequest: "சமர்ப்பி",
    trackTitle: "கண்காணிக்க", trackDesc: "உங்கள் குறிப்பு எண்ணை உள்ளிடவும்.", trackPlaceholder: "உதா. REQ-8924B", track: "கண்காணிக்க", underReview: "மதிப்பாய்வில் உள்ளது", problemSummary: "பிரச்சனை சுருக்கம்", lifecycleStatus: "நிலை",
    rights: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.", privacyPolicy: "தனியுரிமைக் கொள்கை", terms: "விதிமுறைகள்", lowBandwidth: "குறைந்த அலைவரிசை முறை"
  },
  bn: {
    title: "CivicPulse BRICS",
    poweredBy: "Powered by Google Gemini 2.5",
    intelligentCivic: "Intelligent Civic",
    infraForIndia: "Infrastructure for India.",
    heroDesc: "Report issues via voice, text, or photos in any regional language. Our AI routes it directly to the right department.",
    reportAnIssue: "Report an Issue",
    govPortalAccess: "Gov Portal Access",
    trackStatus: "Track Status", heroTitle: "এআই দ্বারা সম্প্রদায়কে ক্ষমতায়ন", heroSub: "স্থানীয় সমস্যার রিপোর্ট করুন এবং সমাধানের অগ্রগতি ট্র্যাক করুন।",
    reportBtn: "সমস্যার রিপোর্ট করুন", trackBtn: "অনুরোধ ট্র্যাক করুন", aiAnalysis: "এআই বিশ্লেষণ", aiAnalysisSub: "দ্রুত প্রতিক্রিয়ার জন্য স্বয়ংক্রিয়ভাবে শ্রেণীবদ্ধ।",
    preciseLoc: "সঠিক অবস্থান", preciseLocSub: "মানচিত্র-ভিত্তিক রিপোর্টিং।", privacyFirst: "গোপনীয়তা", privacyFirstSub: "আপনার তথ্য সুরক্ষিত।",
    reportTitle: "সমস্যার রিপোর্ট করুন", reportDesc: "সমস্যাটির বিবরণ দিন।", describeIssue: "সমস্যা বর্ণনা করুন", describePlaceholder: "সমস্যাটা কী?",
    tapRecord: "অডিও রেকর্ড করতে ট্যাপ করুন", orUpload: "অথবা ফাইল আপলোড করুন", detectedLang: "শনাক্তকৃত ভাষা:", location: "অবস্থান", useMyLocation: "আমার অবস্থান ব্যবহার করুন", searchAddress: "অথবা ঠিকানা খুঁজুন...",
    category: "বিভাগ", severity: "তীব্রতা", consentLabel: "আমি ডেটা প্রক্রিয়াকরণে সম্মত।", contactEmail: "যোগাযোগের ইমেইল", submitRequest: "জমা দিন",
    trackTitle: "ট্র্যাক করুন", trackDesc: "আপনার রেফারেন্স নম্বর লিখুন।", trackPlaceholder: "উদা. REQ-8924B", track: "ট্র্যাক করুন", underReview: "পর্যালোচনাধীন", problemSummary: "সমস্যার সারাংশ", lifecycleStatus: "অবস্থা",
    rights: "সর্বস্বত্ব সংরক্ষিত।", privacyPolicy: "গোপনীয়তা নীতি", terms: "শর্তাবলী", lowBandwidth: "লো-ব্যান্ডউইথ মোড"
  },
  mr: {
    title: "CivicPulse BRICS",
    poweredBy: "Powered by Google Gemini 2.5",
    intelligentCivic: "Intelligent Civic",
    infraForIndia: "Infrastructure for India.",
    heroDesc: "Report issues via voice, text, or photos in any regional language. Our AI routes it directly to the right department.",
    reportAnIssue: "Report an Issue",
    govPortalAccess: "Gov Portal Access",
    trackStatus: "Track Status", heroTitle: "AI द्वारे समुदायांचे सक्षमीकरण", heroSub: "स्थानिक समस्या नोंदवा आणि ट्रॅक करा.",
    reportBtn: "समस्या नोंदवा", trackBtn: "माझी विनंती ट्रॅक करा", aiAnalysis: "AI विश्लेषण", aiAnalysisSub: "जलद प्रतिसादासाठी स्वयंचलित वर्गीकरण.",
    preciseLoc: "अचूक स्थान", preciseLocSub: "नकाशा-आधारित अहवाल.", privacyFirst: "गोपनीयता", privacyFirstSub: "तुमची माहिती सुरक्षित आहे.",
    reportTitle: "समस्या नोंदवा", reportDesc: "समस्येबद्दल तपशील द्या.", describeIssue: "समस्येचे वर्णन करा", describePlaceholder: "काय समस्या आहे?",
    tapRecord: "ऑडिओ रेकॉर्ड करण्यासाठी टॅप करा", orUpload: "किंवा फाईल अपलोड करा", detectedLang: "ओळखलेली भाषा:", location: "स्थान", useMyLocation: "माझे स्थान वापरा", searchAddress: "किंवा पत्ता शोधा...",
    category: "श्रेणी", severity: "तीव्रता", consentLabel: "मी डेटा प्रक्रियेस सहमती देतो.", contactEmail: "संपर्क ईमेल", submitRequest: "सबमिट करा",
    trackTitle: "ट्रॅक करा", trackDesc: "तुमचा संदर्भ क्रमांक प्रविष्ट करा.", trackPlaceholder: "उदा. REQ-8924B", track: "ट्रॅक करा", underReview: "पुनरावलोकनाखाली", problemSummary: "समस्या सारांश", lifecycleStatus: "स्थिती",
    rights: "सर्व हक्क राखीव.", privacyPolicy: "गोपनीयता धोरण", terms: "अटी", lowBandwidth: "लो-बँडविड्थ मोड"
  },
  gu: {
    title: "CivicPulse BRICS",
    poweredBy: "Powered by Google Gemini 2.5",
    intelligentCivic: "Intelligent Civic",
    infraForIndia: "Infrastructure for India.",
    heroDesc: "Report issues via voice, text, or photos in any regional language. Our AI routes it directly to the right department.",
    reportAnIssue: "Report an Issue",
    govPortalAccess: "Gov Portal Access",
    trackStatus: "Track Status", heroTitle: "AI દ્વારા સમુદાયોનું સશક્તિકરણ", heroSub: "સ્થાનિક સમસ્યાઓ નોંધાવો અને ઉકેલને ટ્રૅક કરો.",
    reportBtn: "સમસ્યા નોંધાવો", trackBtn: "મારી વિનંતી ટ્રૅક કરો", aiAnalysis: "AI વિશ્લેષણ", aiAnalysisSub: "ઝડપી પ્રતિસાદ માટે સ્વચાલિત વર્ગીકરણ.",
    preciseLoc: "ચોક્કસ સ્થાન", preciseLocSub: "નકશા-આધારિત રિપોર્ટિંગ.", privacyFirst: "ગોપનીયતા", privacyFirstSub: "તમારી માહિતી સુરક્ષિત છે.",
    reportTitle: "સમસ્યા નોંધાવો", reportDesc: "સમસ્યા વિશે વિગતો આપો.", describeIssue: "સમસ્યાનું વર્ણન કરો", describePlaceholder: "શું સમસ્યા છે?",
    tapRecord: "ઑડિઓ રેકૉર્ડ કરવા માટે ટૅપ કરો", orUpload: "અથવા ફાઇલ અપલોડ કરો", detectedLang: "ઓળખાયેલ ભાષા:", location: "સ્થાન", useMyLocation: "મારું સ્થાન વાપરો", searchAddress: "અથવા સરનામું શોધો...",
    category: "શ્રેણી", severity: "તીવ્રતા", consentLabel: "હું ડેટા પ્રોસેસિંગ માટે સંમત છું.", contactEmail: "સંપર્ક ઇમેઇલ", submitRequest: "સબમિટ કરો",
    trackTitle: "ટ્રૅક કરો", trackDesc: "તમારો સંદર્ભ નંબર દાખલ કરો.", trackPlaceholder: "ઉદા. REQ-8924B", track: "ટ્રૅક કરો", underReview: "સમીક્ષા હેઠળ", problemSummary: "સમસ્યા સારાંશ", lifecycleStatus: "સ્થિતિ",
    rights: "બધા હકો આરક્ષિત.", privacyPolicy: "ગોપનીયતા નીતિ", terms: "શરતો", lowBandwidth: "લો-બેન્ડવિડ્થ મોડ"
  },
  ar: {
    title: "CivicPulse BRICS",
    poweredBy: "Powered by Google Gemini 2.5",
    intelligentCivic: "Intelligent Civic",
    infraForIndia: "Infrastructure for India.",
    heroDesc: "Report issues via voice, text, or photos in any regional language. Our AI routes it directly to the right department.",
    reportAnIssue: "Report an Issue",
    govPortalAccess: "Gov Portal Access",
    trackStatus: "Track Status", heroTitle: "تمكين المجتمعات باستخدام الذكاء الاصطناعي", heroSub: "قم بالإبلاغ عن المشكلات المحلية وتتبع حلها.",
    reportBtn: "الإبلاغ عن مشكلة", trackBtn: "تتبع طلبي", aiAnalysis: "تحليل الذكاء الاصطناعي", aiAnalysisSub: "تصنيف تلقائي للاستجابة السريعة.",
    preciseLoc: "موقع دقيق", preciseLocSub: "الإبلاغ القائم على الخريطة.", privacyFirst: "الخصوصية أولاً", privacyFirstSub: "معلوماتك محمية.",
    reportTitle: "الإبلاغ عن مشكلة", reportDesc: "قدم تفاصيل حول المشكلة.", describeIssue: "صف المشكلة", describePlaceholder: "ما هي المشكلة؟",
    tapRecord: "اضغط لتسجيل الصوت", orUpload: "أو رفع ملف", detectedLang: "اللغة المكتشفة:", location: "الموقع", useMyLocation: "استخدام موقعي", searchAddress: "أو ابحث عن عنوان...",
    category: "فئة", severity: "شدة", consentLabel: "أوافق على معالجة البيانات.", contactEmail: "البريد الإلكتروني", submitRequest: "إرسال",
    trackTitle: "تتبع", trackDesc: "أدخل الرقم المرجعي.", trackPlaceholder: "مثال REQ-8924B", track: "تتبع", underReview: "قيد المراجعة", problemSummary: "ملخص المشكلة", lifecycleStatus: "الحالة",
    rights: "كل الحقوق محفوظة.", privacyPolicy: "سياسة الخصوصية", terms: "الشروط", lowBandwidth: "وضع النطاق الترددي المنخفض"
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
    } else if (typeof navigator !== "undefined" && navigator.language) {
      // Auto-detect browser language
      const browserLang = navigator.language.split("-")[0] as Language;
      if (translations[browserLang]) {
        setLanguage(browserLang);
      }
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
