"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Home,
  FileText,
  Mic,
  Send,
  Sparkles,
  Pill,
  Clock,
  Settings as SettingsIcon,
  CheckCircle,
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  Phone,
  Shield,
  Eye,
  Ear,
  Hand,
  Brain,
  Palette,
  Globe,
  PersonStanding,
  ClipboardList,
  Trash2,
  Square,
  ChevronDown,
  ChevronUp,
  Brush,
  TriangleAlert,
  Siren,
  CircleHelp,
  Paperclip,
  Volume2,
} from "lucide-react";
import CallOverlay from "./components/CallOverlay";
import { StatusBar } from "./components/StatusBar";
import { InstructionCard } from "./components/InstructionCard";
import { BottomNav } from "./components/BottomNav";

// Define types for SpeechRecognition
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

interface Message {
  role: string;
  content: string;
  image?: string; // Using string | undefined
}

const IMAGE_MAP: Record<string, string> = {
  "broken glass":
    "https://images.unsplash.com/photo-1585938389612-a552a28d6914?auto=format&fit=crop&q=80&w=600",
  broom:
    "https://images.unsplash.com/photo-1585938389612-a552a28d6914?auto=format&fit=crop&q=80&w=600",
  toilet:
    "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=600",
  brush:
    "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=600",
  gloves:
    "https://images.unsplash.com/photo-1584036561566-b93241b4d714?auto=format&fit=crop&q=80&w=600",
  waste:
    "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600",
  bin: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600",
};

const TRANSLATIONS = {
  English: {
    welcome: "Hi",
    greeting: "How can I help you today?",
    btn_questions: "Quick Questions",
    btn_instructions: "Instruction Files",
    tab_home: "Home",
    tab_history: "History",
    tab_settings: "Settings",
    header_common: "Common questions",
    header_workplace_guide: "Workplace Guide",
    header_select_problem: "Select a problem",
    header_accessibility: "Accessibility Settings",
    header_review: "Review your Report",
    header_security: "Security Notified!",
    label_name: "Name",
    label_type: "Type",
    label_details: "Details",
    label_text_size: "Text Size",
    label_language: "Language",
    btn_close: "Close",
    btn_back: "Back",
    btn_back_home: "Back to Home",
    btn_send_manager: "Send to Manager",
    btn_accept: "Accept",
    btn_pick_time: "Pick another time",
    thinking: "Thinking...",
    status_listening: "Listening...",
    status_in_progress: "In Progress",
    status_finished: "Finished",
    input_placeholder: "Ask me about anything",
    footer_run_by: "Run by",
    success_manager: "Sent to Manager! Get well soon.",
    success_late: "Logged Successfully! Get here safely.",
    security_msg: "Please proceed to the front desk.",
    instr_tool_title: "Cleaning Tools",
    instr_tool_text: "Red cloth = Toilets.\nBlue cloth = Desks.",
    instr_safety_title: "Safety Rules",
    instr_safety_text: "Wet floor sign must be visible.",
    instr_waste_title: "Waste Sorting",
    instr_waste_text: "Black bag = General.\nGreen bag = Food.",
    instr_emergency_title: "Emergency",
    instr_emergency_text: "Call 112.\nMeeting: Main Entrance.",
    chip_sick: "Sick leave",
    chip_late: "Late to work",
    chip_problem: "Report a problem",
    chip_upload: "Upload doctor's note",
    chip_forgot: "Forgot a key/card",
    chip_assist: "Need assistance",
    chip_call: "Call my manager",
    ai_recommendation: "AI Recommendation",
    setting_vision: "Vision",
    setting_vision_desc: "Large text, High contrast, Bold font",
    setting_hearing: "Hearing",
    setting_hearing_desc: "Vibrations, Visual alerts",
    setting_motor: "Motor",
    setting_motor_desc: "Voice control, large buttons",
    setting_cognitive: "Cognitive",
    setting_cognitive_desc: "Simple language, fewer choices",
    setting_color: "Color Vision",
    setting_color_desc: "High contrast, no red/green",
    setting_standard: "Standard",
    setting_standard_desc: "Default settings",
    btn_submit_done: "I am done (Submit)",
    btn_ask_more: "Ask More Questions",
    ticket_sick: "Sick Leave",
    ticket_late: "Late Arrival",
    ticket_it: "IT Support",
    ticket_key: "Lost Key",
    status_sent: "Sent",
    status_review: "Reviewing",
    status_done: "Done",
  },
  Swedish: {
    welcome: "Hej",
    greeting: "Hur kan jag hjälpa dig idag?",
    btn_questions: "Snabba Frågor",
    btn_instructions: "Instruktioner",
    tab_home: "Hem",
    tab_history: "Historik",
    tab_settings: "Inställningar",
    header_common: "Vanliga frågor",
    header_workplace_guide: "Arbetsplatsguide",
    header_select_problem: "Välj ett problem",
    header_accessibility: "Tillgänglighetsinställningar",
    header_review: "Granska din rapport",
    header_security: "Säkerhetsvakt meddelad!",
    label_name: "Namn",
    label_type: "Typ",
    label_details: "Detaljer",
    label_text_size: "Textstorlek",
    label_language: "Språk",
    btn_close: "Stäng",
    btn_back: "Tillbaka",
    btn_back_home: "Tillbaka till Hem",
    btn_send_manager: "Skicka till chefen",
    btn_accept: "Acceptera",
    btn_pick_time: "Välj en annan tid",
    thinking: "Tänker...",
    status_listening: "Lyssnar...",
    status_in_progress: "Pågående",
    status_finished: "Avslutat",
    input_placeholder: "Fråga mig om vad som helst",
    footer_run_by: "Drivs av",
    success_manager: "Skickat till chefen! Krya på dig.",
    success_late: "Loggat! Ta dig hit säkert.",
    security_msg: "Vänligen gå till receptionen.",
    instr_tool_title: "Städverktyg",
    instr_tool_text: "Röd trasa = Toaletter.\nBlå trasa = Skrivbord.",
    instr_safety_title: "Säkerhetsregler",
    instr_safety_text: "Skylt för halt golv måste synas.",
    instr_waste_title: "Sopsortering",
    instr_waste_text: "Svart påse = Allmänt.\nGrön påse = Mat.",
    instr_emergency_title: "Nödsituation",
    instr_emergency_text: "Ring 112.\nSamlingsplats: Huvudentrén.",
    chip_sick: "Sjukfrånvaro",
    chip_late: "Sen ankomst",
    chip_problem: "Rapportera problem",
    chip_upload: "Ladda upp läkarintyg",
    chip_forgot: "Glömt nyckel/kort",
    chip_assist: "Behöver hjälp",
    chip_call: "Ring min chef",
    ai_recommendation: "AI Rekommendation",
    setting_vision: "Syn",
    setting_vision_desc: "Stor text, Hög kontrast, ljud",
    setting_hearing: "Hörsel",
    setting_hearing_desc: "Vibrationer, Visuella varningar",
    setting_motor: "Motorik",
    setting_motor_desc: "Röststyrning, stora knappar",
    setting_cognitive: "Kognitiv",
    setting_cognitive_desc: "Enkelt språk, färre val",
    setting_color: "Färgseende",
    setting_color_desc: "Hög kontrast, inget rött/grönt",
    setting_standard: "Standard",
    setting_standard_desc: "Standardinställningar",
    btn_submit_done: "Jag är klar (Skicka)",
    btn_ask_more: "Ställ fler frågor",
    ticket_sick: "Sjukfrånvaro",
    ticket_late: "Sen Ankomst",
    ticket_it: "IT-stöd",
    ticket_key: "Förlorad Nyckel",
    status_sent: "Skickad",
    status_review: "Granskas",
    status_done: "Klar",
  },
  Arabic: {
    welcome: "مرحبا",
    greeting: "كيف يمكنني مساعدتك اليوم؟",
    btn_questions: "أسئلة سريعة",
    btn_instructions: "ملفات التعليمات",
    tab_home: "الرئيسية",
    tab_history: "السجل",
    tab_settings: "الإعدادات",
    header_common: "الأسئلة الشائعة",
    header_workplace_guide: "دليل العمل",
    header_select_problem: "حدد مشكلة",
    header_accessibility: "إعدادات الوصول",
    header_review: "مراجعة تقريرك",
    header_security: "تم إبلاغ الأمن!",
    label_name: "الاسم",
    label_type: "النوع",
    label_details: "التفاصيل",
    label_text_size: "حجم النص",
    label_language: "اللغة",
    btn_close: "إغلاق",
    btn_back: "رجوع",
    btn_back_home: "العودة للرئيسية",
    btn_send_manager: "إرسال للمدير",
    btn_accept: "قبول",
    btn_pick_time: "اختر وقتاً آخر",
    thinking: "جاري التفكير...",
    status_listening: "يستمع...",
    status_in_progress: "قيد المعالجة",
    status_finished: "منتهي",
    input_placeholder: "اسألني عن أي شيء",
    footer_run_by: "مشغل بواسطة",
    success_manager: "تم الإرسال للمدير! أتمنى لك الشفاء.",
    success_late: "تم التسجيل! طريباً.",
    security_msg: "يرجى التوجه للاستقبال.",
    instr_tool_title: "أدوات التنظيف",
    instr_tool_text: "قماش أحمر = دورات مياه.\nقماش أزرق = مكاتب.",
    instr_safety_title: "قواعد السلامة",
    instr_safety_text: "يجب وضع علامة أرضية مبللة.",
    instr_waste_title: "فرز النفايات",
    instr_waste_text: "كيس أسود = عام.\nكيس أخضر = طعام.",
    instr_emergency_title: "طوارئ",
    instr_emergency_text: "اتصل بـ 112.\nالتجمع: المدخل الرئيسي.",
    chip_sick: "إجازة مرضية",
    chip_late: "تأخر عن العمل",
    chip_problem: "إبلاغ عن مشكلة",
    chip_upload: "رفع تقرير طبي",
    chip_forgot: "نسيت مفتاح/بطاقة",
    chip_assist: "بحاجة لمساعدة",
    chip_call: "الاتصال بمديري",
    ai_recommendation: "توصية الذكاء الاصطناعي",
    setting_vision: "الرؤية",
    setting_vision_desc: "نص كبير، تباين عالي، صوت",
    setting_hearing: "السمع",
    setting_hearing_desc: "اهتزازات، تنبيهات بصرية",
    setting_motor: "حركي",
    setting_motor_desc: "تحكم صوتي، أزرار كبيرة",
    setting_cognitive: "إدراكي",
    setting_cognitive_desc: "لغة بسيطة، خيارات أقل",
    setting_color: "رؤية الألوان",
    setting_color_desc: "تباين عالي، لا أحمر/أخضر",
    setting_standard: "قياسي",
    setting_standard_desc: "الإعدادات الافتراضية",
    btn_submit_done: "أنا انتهيت (إرسال)",
    btn_ask_more: "طرح المزيد من الأسئلة",
    ticket_sick: "إجازة مرضية",
    ticket_late: "تأخر عن العمل",
    ticket_it: "دعم فني",
    ticket_key: "مفتاح مفقود",
    status_sent: "تم الإرسال",
    status_review: "قيد المراجعة",
    status_done: "تم",
  },
};

export default function MainChatScreen() {
  // Helper state for navigation
  const [currentTab, setCurrentTab] = useState<"home" | "history" | "settings">(
    "home"
  );
  const [language, setLanguage] = useState<"English" | "Swedish" | "Arabic">(
    "English"
  );
  const t = TRANSLATIONS[language];

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [viewState, setViewState] = useState<
    "main" | "questions" | "problems" | "instructions"
  >("main");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [ticketState, setTicketState] = useState<
    "chat" | "decision" | "summary" | "success"
  >("chat");
  const [activeFlow, setActiveFlow] = useState<
    | "none"
    | "late_to_work"
    | "call_manager"
    | "lost_key"
    | "cleaning_tools_selection"
  >("none");
  const [successType, setSuccessType] = useState<
    "manager" | "security" | "late"
  >("manager");
  const [isCalling, setIsCalling] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [reportType, setReportType] = useState<
    "Sick Leave" | "Late Arrival" | null
  >(null);
  const [arrivalEstimate, setArrivalEstimate] = useState<string>("");
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [summaryData, setSummaryData] = useState({
    type: "Sick Leave",
    details:
      "User reported not feeling well and requested sick leave. Symptoms noted. Expecting to be out for 2 days.",
  });

  const INSTRUCTION_IMAGES: Record<string, string> = {
    "level2": "https://images.pexels.com/photos/21853674/pexels-photo-21853674.jpeg",
    "chemicals": "https://images.pexels.com/photos/3735732/pexels-photo-3735732.jpeg",
    "cloths": "https://images.pexels.com/photos/7876767/pexels-photo-7876767.jpeg",
    "meeting": "https://images.pexels.com/photos/18033206/pexels-photo-18033206.jpeg",
    // Mappings for backend tags which might differ slightly
    "cloths_wear": "https://images.pexels.com/photos/7876767/pexels-photo-7876767.jpeg", 
    "meeting_room": "https://images.pexels.com/photos/18033206/pexels-photo-18033206.jpeg"
  };

  // Instruction State
  const [activeInstruction, setActiveInstruction] = useState<{
    id: string;
    icon: any;
    title: string;
    text: string;
    color: string;
  } | null>(null);

  const [summaryCardContent, setSummaryCardContent] = useState<string | null>(null);

  // History State - "My Requests"
  const [historyItems, setHistoryItems] = useState([
    { title: "ticket_it", date: "Nov 15, 2025", status: "status_done" },
    { title: "ticket_key", date: "Nov 10, 2025", status: "status_done" },
  ]);

  const addHistoryItem = (type: string) => {
    let titleKey = "ticket_sick";
    if (type === "LATE") titleKey = "ticket_late";
    if (type === "INFO") titleKey = "ticket_it";

    const newItem = {
      title: titleKey,
      date: "Just now",
      status: "status_sent",
    };
    setHistoryItems((prev) => [newItem, ...prev]);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Settings State
  const [settings, setSettings] = useState({
    largerText: false,
    highContrast: false,
    textToSpeech: false,
    voiceControl: false,
  });
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [visionMode, setVisionMode] = useState(false);

  // New Settings State
  const [selectedMode, setSelectedMode] = useState("Standard");
  const [textSizeMode, setTextSizeMode] = useState("Normal");
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  // TTS State & Helper
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);

  const speak = (text: string) => {
    if (
      !isTTSEnabled ||
      typeof window === "undefined" ||
      !window.speechSynthesis
    )
      return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.replace(/[*_#`]/g, ""));

    // 1. Determine Target Code
    const targetLangCode =
      language === "Swedish" ? "sv" : language === "Arabic" ? "ar" : "en";

    // 2. Find Best Voice
    const voices = window.speechSynthesis.getVoices();
    const nativeVoice = voices.find((v) => v.lang.startsWith(targetLangCode));

    // 3. Apply Voice & Lang
    if (nativeVoice) utterance.voice = nativeVoice;
    utterance.lang = targetLangCode;
    utterance.rate = 0.9;

    window.speechSynthesis.speak(utterance);
  };

  // Ensure voices are loaded
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // TTS Effect for new AI messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant" || lastMsg.role === "system") {
        speak(lastMsg.content);
      }
    }
  }, [messages]);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTextSizeChange = (size: "Normal" | "Large" | "Huge") => {
    setTextSizeMode(size);
    setSettings((prev) => ({ ...prev, largerText: size !== "Normal" }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (currentTab === "home") {
      scrollToBottom();
    }
  }, [messages, isLoading, currentTab]);

  // Effect to handle "I am done" suggestion automatically via state
  useEffect(() => {
    if (
      currentSuggestions.some((s) => s.includes("I am done")) &&
      ticketState === "chat"
    ) {
      setTicketState("decision");
    }
  }, [currentSuggestions, ticketState]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const { webkitSpeechRecognition, SpeechRecognition } =
      window as unknown as IWindow;
    const SpeechRecognitionAPI = SpeechRecognition || webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + (prev ? " " : "") + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;

    // Special handling for "Ask More Questions" or "I have more questions"
    if (
      textToSend === "I have more questions" ||
      textToSend === t.btn_ask_more
    ) {
      setCurrentSuggestions([]);
      setTicketState("chat");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Okay, what else can I help with?" },
      ]);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return;
    }

    if (!textToSend.trim() || isLoading) return;

    // Capture Late Arrival Time logic
    if (
      reportType === "Late Arrival" &&
      !textToSend.toLowerCase().includes("late") &&
      !textToSend.toLowerCase().includes("done")
    ) {
      setArrivalEstimate(textToSend);
    }

    const userMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    // Clear suggestions when user replies
    setCurrentSuggestions([]);

    if (!messageText) setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();

      const rawContent = data.content || "";
      let cleanContent = rawContent;
      let newSuggestions: string[] = [];
      let extractedImageUrl: string | undefined = undefined;

      // 1. Extract Commit Tags
      const commitMatch = rawContent.match(/\|\|COMMIT:(.*?)\|\|/);
      if (commitMatch) {
        const commitType = commitMatch[1];
        addHistoryItem(commitType);
        cleanContent = cleanContent.replace(/\|\|COMMIT:.*?\|\|/g, "").trim();
      }

      // 2. Extract Suggestions using Regex (Robust)
      const suggestMatch = rawContent.match(/\|\|SUGGEST:(.*?)\|\|/);
      if (suggestMatch) {
        const optionsString = suggestMatch[1];
        newSuggestions = optionsString.split(",").map((s: string) => s.trim());
        // Remove the tag from the text shown to user
        cleanContent = rawContent.replace(/\|\|SUGGEST:.*?\|\|/g, "").trim();
      }

      // 3. Extract Image Tags (NEW: Instruction Mode)
      const imageMatch = rawContent.match(/\|\|IMAGE:(.*?)\|\|/);
      if (imageMatch) {
        const imageKey = imageMatch[1].toLowerCase().trim();
        // Look up the URL from INSTRUCTION_IMAGES (primary) or IMAGE_MAP (fallback)
        const mappedUrl = INSTRUCTION_IMAGES[imageKey] || IMAGE_MAP[imageKey];
        if (mappedUrl) extractedImageUrl = mappedUrl;

        // Remove the tag from the text shown to user
        cleanContent = cleanContent.replace(/\|\|IMAGE:.*?\|\|/g, "").trim();
      }

      // 4. Extract Summary Tag
      if (rawContent.includes("||TYPE:SUMMARY||")) {
        // Strip the tag
        cleanContent = cleanContent.replace("||TYPE:SUMMARY||", "").trim();
        // Set the State to trigger the Card UI
        setSummaryCardContent(cleanContent);
      }

      // Handle legacy or other tags if needed
      if (cleanContent.includes("[COMPLETE]")) {
        cleanContent = cleanContent.replace("[COMPLETE]", "").trim();
        setTicketState("decision");
      }

      setMessages((prev) => [
        ...prev,
        { role: data.role, content: cleanContent, image: extractedImageUrl },
      ]);
      setCurrentSuggestions(newSuggestions);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleHomeClick = () => {
    if (currentTab === "home") {
      setMessages([]); // Reset to initial state
      setInput("");
      setViewState("main");
      setTicketState("chat");
      setActiveFlow("none");
      setSelectedImage(null);
      setReportType(null);
      setArrivalEstimate("");
      setCurrentSuggestions([]);
      setShowSuggestions(false);
    } else {
      setCurrentTab("home");
    }
  };

  const handleLateToWork = () => {
    speak("Late to work selected");
    setReportType("Late Arrival");
    handleSend("I am late to work");
    setViewState("main");
  };

  const handleCleaningTools = () => {
    speak("Cleaning tools selected");
    setViewState("main");
    // NEW LOGIC: Let the AI handle the instruction flow
    handleSend("I need instructions for cleaning tools.");
  };

  const handleToolSelection = (tool: string) => {
    setMessages((prev) => [...prev, { role: "user", content: tool }]);
    setActiveFlow("none");

    setTimeout(() => {
      // Updated Image URL
      const imageUrl =
        "https://images.pexels.com/photos/7108400/pexels-photo-7108400.jpeg?auto=compress&cs=tinysrgb&w=600";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "They are in the **Utility Room (Level 2)**, inside the blue cabinet.",
          image: imageUrl,
        },
      ]);
    }, 1000);
  };

  const handleForgotKey = () => {
    speak("Forgot key selected");
    setViewState("main");
    setActiveFlow("lost_key");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "Forgot a key/card" },
      {
        role: "assistant",
        content:
          "Don't worry. Do you need me to notify the Security Desk for a temporary pass?",
      },
    ]);
  };

  const handleNotifySecurity = () => {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "Yes, notify Security" },
      {
        role: "assistant",
        content:
          "Security has been notified. Please proceed to the front desk.",
      },
    ]);
    setActiveFlow("none");
    setSuccessType("security");
    setTicketState("success");
  };

  const handleFoundKey = () => {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "No, I found it" },
      { role: "assistant", content: "Great! Have a productive day." },
    ]);
    setActiveFlow("none");
  };

  const handleReportProblem = () => {
    setViewState("problems");
  };

  const handleNeedAssistance = () => {
    speak("Assistance selected");
    setViewState("main");
    setActiveFlow("call_manager");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "Need assistance" },
      {
        role: "assistant",
        content: "I can help. Do you want to call your manager directly?",
      },
    ]);
  };

  const handleCallManager = () => {
    setIsCalling(true);
    setActiveFlow("none");
  };

  const handleEndCall = () => {
    setIsCalling(false);
    setMessages((prev) => [
      ...prev,
      {
        role: "system",
        content:
          "📞 Call ended. Duration: 0:42. A follow-up note has been sent to your manager.",
      },
    ]);
  };

  const handleUploadNote = () => {
    // Trigger file input
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadConfirm = () => {
    if (!selectedImage) return;

    // NEW: Simulate Loading the File into Knowledge Base
    // We send a hidden SYSTEM EVENT message to the backend

    // 1. Visual Feedback to User
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "Uploaded: cleaning_guide.pdf" },
    ]);
    setSelectedImage(null);
    setViewState("main");
    setIsLoading(true);

    // 2. Send Hidden Command to Backend
    // The backend matches 'SYSTEM_EVENT: LOAD_FILE:cleaning_guide'
    const hiddenMessage = {
      role: "system",
      content: "SYSTEM_EVENT: LOAD_FILE:cleaning_guide",
    };

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, hiddenMessage] }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages((prev) => [
          ...prev,
          { role: data.role, content: data.content },
        ]);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const cancelUpload = () => {
    setSelectedImage(null);
  };

  // Render Helper Functions
  const renderHome = () => {
    if (ticketState === "summary") {
      return (
        <div className="w-full flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4">
          <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-display text-2xl font-semibold text-gray-800 mb-4">
              {t.header_review}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {t.label_name}
                </label>
                <div className="text-lg font-medium text-gray-800">Fatima</div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {t.label_type}
                </label>
                <div className="text-lg font-medium text-gray-800">
                  {reportType === "Late Arrival"
                    ? "Late Arrival"
                    : "Sick Leave"}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {t.label_details}
                </label>
                <p className="text-base text-gray-600 mt-1 bg-gray-50 p-3 rounded-xl">
                  {reportType === "Late Arrival"
                    ? `Arriving in ${
                        arrivalEstimate.match(/\d$/)
                          ? arrivalEstimate + " mins"
                          : arrivalEstimate
                      }`
                    : summaryData.details}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => {
                  const newItem = {
                    title:
                      reportType === "Late Arrival"
                        ? "ticket_late"
                        : "ticket_sick",
                    date: "Just now",
                    status: "status_sent",
                  };
                  setHistoryItems((prev) => [newItem, ...prev]);
                  // Logic Check
                  if (reportType === "Late Arrival") {
                    setSuccessType("late");
                  } else {
                    setSuccessType("manager");
                  }
                  setTicketState("success");
                }}
                className="w-full bg-primary text-white text-lg font-semibold py-4 rounded-2xl shadow-lg hover:bg-primary/90 transition-all active:scale-95"
              >
                {t.btn_send_manager}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (ticketState === "success") {
      return (
        <div className="w-full flex flex-col items-center justify-center h-full space-y-6 animate-in zoom-in duration-500">
          {successType === "manager" ? (
            <>
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="font-display text-3xl font-bold text-gray-800 text-center">
                {t.success_manager}
              </h2>
            </>
          ) : successType === "late" ? (
            <>
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="font-display text-3xl font-bold text-gray-800 text-center">
                {t.success_late}
              </h2>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Shield className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="font-display text-3xl font-bold text-gray-800 text-center">
                {t.header_security}
              </h2>
              <p className="text-lg text-gray-600 text-center">
                {t.security_msg}
              </p>
            </>
          )}
          <button
            onClick={handleHomeClick}
            className="mt-8 px-8 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all"
          >
            {t.btn_back_home}
          </button>
        </div>
      );
    }

    // Chat View
    if (messages.length === 0) {
      return (
        <div className="w-full flex flex-col items-center mt-8 mb-8 max-w-2xl mx-auto">
          <div className="flex flex-col items-center text-center px-4 mb-12">
            <span className="text-xl font-medium text-gray-500 mb-4">
              {t.welcome}, Fatima
            </span>
            <h1 className="font-display text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
              {t.greeting}
            </h1>
          </div>

          {/* Action Buttons */}
          {viewState === "main" && (
            <>
              <div className="w-full flex flex-row gap-4">
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className={`flex-1 flex flex-col items-center justify-center h-40 transition-all active:scale-95 duration-200 bg-white rounded-2xl ${
                    visionMode
                      ? "border-4 border-black text-black"
                      : `border border-gray-200 shadow-lg shadow-purple-100/50 hover:border-purple-300 ${
                          showSuggestions
                            ? "ring-2 ring-purple-200 bg-purple-50/30"
                            : ""
                        }`
                  }`}
                  aria-label="Common questions"
                >
                  <div
                    className={`p-4 rounded-full mb-3 ${
                      visionMode ? "bg-transparent" : "bg-purple-50"
                    }`}
                  >
                    <CircleHelp
                      className={`w-8 h-8 ${
                        visionMode ? "text-black" : "text-primary"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-lg ${
                      visionMode
                        ? "font-bold text-black"
                        : "font-medium text-gray-800"
                    }`}
                  >
                    {t.btn_questions}
                  </span>
                </button>

                <button
                  onClick={() => setViewState("instructions")}
                  className={`flex-1 flex flex-col items-center justify-center h-40 transition-all active:scale-95 duration-200 bg-white rounded-2xl ${
                    visionMode
                      ? "border-4 border-black text-black"
                      : "border border-gray-200 shadow-lg shadow-purple-100/50 hover:border-purple-300"
                  }`}
                  aria-label="View instruction files"
                >
                  <div
                    className={`p-4 rounded-full mb-3 ${
                      visionMode ? "bg-transparent" : "bg-purple-50"
                    }`}
                  >
                    <FileText
                      className={`w-8 h-8 ${
                        visionMode ? "text-black" : "text-primary"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-lg ${
                      visionMode
                        ? "font-bold text-black"
                        : "font-medium text-gray-800"
                    }`}
                  >
                    {t.btn_instructions}
                  </span>
                </button>
              </div>

              {showSuggestions && (
                <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <span
                      className={`${
                        visionMode
                          ? "text-base font-bold text-black"
                          : "text-sm text-gray-500 font-medium"
                      }`}
                    >
                      Get help with above tasks
                    </span>
                  </div>

                  {/* Body */}
                  <div className="bg-white p-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        speak("Sick leave selected");
                        setReportType("Sick Leave");
                        handleSend("Sick leave");
                        setShowSuggestions(false);
                      }}
                      className={`px-4 py-2 bg-white rounded-full font-medium transition-all ${
                        visionMode
                          ? "border-4 border-black text-black text-xl font-bold shadow-none"
                          : "text-sm border border-[#9747FF] text-[#9747FF] hover:bg-purple-50 active:scale-95"
                      }`}
                    >
                      {t.chip_sick}
                    </button>

                    <button
                      onClick={() => {
                        handleLateToWork();
                        setShowSuggestions(false);
                      }}
                      className={`px-4 py-2 bg-white rounded-full font-medium transition-all ${
                        visionMode
                          ? "border-4 border-black text-black text-xl font-bold shadow-none"
                          : "text-sm border border-[#9747FF] text-[#9747FF] hover:bg-purple-50 active:scale-95"
                      }`}
                    >
                      {t.chip_late}
                    </button>

                    <button
                      onClick={() => {
                        handleReportProblem();
                        setShowSuggestions(false);
                      }}
                      className={`px-4 py-2 bg-white rounded-full font-medium transition-all ${
                        visionMode
                          ? "border-4 border-black text-black text-xl font-bold shadow-none"
                          : "text-sm border border-[#9747FF] text-[#9747FF] hover:bg-purple-50 active:scale-95"
                      }`}
                    >
                      {t.chip_problem}
                    </button>

                    <button
                      onClick={() => {
                        handleUploadNote();
                        setShowSuggestions(false);
                      }}
                      className={`px-4 py-2 bg-white rounded-full font-medium transition-all ${
                        visionMode
                          ? "border-4 border-black text-black text-xl font-bold shadow-none"
                          : "text-sm border border-[#9747FF] text-[#9747FF] hover:bg-purple-50 active:scale-95"
                      }`}
                    >
                      {t.chip_upload}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {viewState === "instructions" && (
            <div className="w-full flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between px-2">
                <h3
                  className={`font-display font-semibold text-gray-800 ${
                    visionMode ? "text-2xl font-bold text-black" : "text-lg"
                  }`}
                >
                  {t.header_workplace_guide}
                </h3>
                <button
                  onClick={() => setViewState("main")}
                  className={`${
                    visionMode
                      ? "text-lg font-bold text-black"
                      : "text-sm text-primary font-medium hover:text-primary/80"
                  }`}
                >
                  {t.btn_back}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    id: "tool",
                    icon: Brush,
                    title: t.instr_tool_title,
                    text: t.instr_tool_text,
                    color: "bg-blue-100",
                  },
                  {
                    id: "safety",
                    icon: TriangleAlert,
                    title: t.instr_safety_title,
                    text: t.instr_safety_text,
                    color: "bg-yellow-100",
                  },
                  {
                    id: "waste",
                    icon: Trash2,
                    title: t.instr_waste_title,
                    text: t.instr_waste_text,
                    color: "bg-green-100",
                  },
                  {
                    id: "emergency",
                    icon: Siren,
                    title: t.instr_emergency_title,
                    text: t.instr_emergency_text,
                    color: "bg-red-100",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "tool") handleCleaningTools();
                    }}
                    className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
                      visionMode
                        ? "bg-white border-4 border-black text-black shadow-none p-4 rounded-2xl"
                        : "h-32 bg-white border border-gray-200 shadow-lg shadow-purple-100/50 rounded-xl hover:border-purple-300 active:scale-95"
                    }`}
                  >
                    <div
                      className={`mb-2 ${
                        visionMode
                          ? "bg-transparent"
                          : "p-3 bg-purple-50 rounded-full"
                      }`}
                    >
                      <item.icon
                        className={`${
                          visionMode
                            ? "w-10 h-10 text-black"
                            : "w-6 h-6 text-primary"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-center ${
                        visionMode
                          ? "text-xl font-bold text-black"
                          : "font-semibold text-gray-800"
                      }`}
                    >
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {viewState === "problems" && (
            <div className="w-full flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between px-2">
                <h3
                  className={`font-display font-semibold text-gray-800 ${
                    visionMode ? "text-2xl font-bold text-black" : "text-lg"
                  }`}
                >
                  {t.header_select_problem}
                </h3>
                <button
                  onClick={() => setViewState("main")}
                  className={`${
                    visionMode
                      ? "text-lg font-bold text-black"
                      : "text-sm text-primary font-medium hover:text-primary/80"
                  }`}
                >
                  {t.btn_close}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleForgotKey}
                  className={`px-4 py-2 rounded-full font-medium shadow-sm active:scale-95 transition-all text-left ${
                    visionMode
                      ? "bg-white border-4 border-black text-black text-xl font-bold shadow-none"
                      : "bg-white border border-purple-100 text-primary hover:bg-purple-50"
                  }`}
                >
                  {t.chip_forgot}
                </button>

                <button
                  onClick={handleNeedAssistance}
                  className={`px-4 py-2 rounded-full font-medium shadow-sm active:scale-95 transition-all text-left ${
                    visionMode
                      ? "bg-white border-4 border-black text-black text-xl font-bold shadow-none"
                      : "bg-white border border-purple-100 text-primary hover:bg-purple-50"
                  }`}
                >
                  {t.chip_assist}
                </button>

                <button
                  onClick={() => {
                    handleCallManager();
                    setViewState("main");
                  }}
                  className={`px-4 py-2 rounded-full font-medium shadow-sm active:scale-95 transition-all text-left ${
                    visionMode
                      ? "bg-white border-4 border-black text-black text-xl font-bold shadow-none"
                      : "bg-white border border-purple-100 text-primary hover:bg-purple-50"
                  }`}
                >
                  {t.chip_call}
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="w-full flex flex-col space-y-4 pb-4 pt-4">
        {messages.map((msg, index) => {
          // Simplified render loop - no more heavy parsing here
          // We use handleSend to parse suggestions now

          // Legacy split check (keeping for fallback compatibility if needed)
          // This logic can be removed if strict tagging is fully enforced,
          // but good to keep for safety if older messages exist
          const [textPart, suggestionPart] = msg.content.split("[SUGGESTION|");
          const legacySuggestion = suggestionPart
            ? suggestionPart.replace("]", "").split("|")
            : null;

          // Check for Instruction Card Mode
          if (msg.role === "assistant" && msg.image) {
            return (
              <div key={index} className="flex justify-start">
                <InstructionCard
                  imageSrc={msg.image}
                  text={textPart || msg.content}
                  visionMode={visionMode}
                />
              </div>
            );
          }

          return (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === "user"
                    ? visionMode
                      ? "bg-white border-2 border-black rounded-br-none text-black font-bold"
                      : "bg-gray-100 text-gray-900 rounded-br-none"
                    : visionMode
                    ? "bg-white border-4 border-black shadow-none rounded-bl-none text-black font-bold"
                    : "bg-white border border-gray-200 text-gray-800 shadow-md rounded-bl-none"
                }`}
              >
                <div
                  className={`${
                    visionMode ? "text-lg font-bold" : "text-sm leading-relaxed"
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      strong: ({ node, ...props }) => (
                        <span
                          className={`font-bold ${
                            visionMode ? "text-black" : "text-[#9747FF]"
                          }`}
                          {...props}
                        />
                      ),
                    }}
                  >
                    {textPart || msg.content}
                  </ReactMarkdown>
                </div>

                {legacySuggestion && (
                  <div className="mt-3 bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span
                        className={`${
                          visionMode
                            ? "text-base font-bold text-black"
                            : "text-xs font-bold text-primary uppercase tracking-wide"
                        }`}
                      >
                        {t.ai_recommendation}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {legacySuggestion[0]}
                    </div>
                    <div className="text-sm text-gray-500 mb-4">
                      {legacySuggestion[1]}
                    </div>

                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => {
                          setReportType("Sick Leave");
                          handleSend(`Accept ${legacySuggestion[0]}`);
                        }}
                        className="w-full py-3 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-primary/90 transition-all"
                      >
                        {t.btn_accept} {legacySuggestion[0]}
                      </button>
                      <button
                        onClick={() => handleSend("I need a different time.")}
                        className="w-full py-3 bg-white text-gray-600 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        {t.btn_pick_time}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {messages.length > 0 &&
          messages[messages.length - 1].role === "system" &&
          messages[messages.length - 1].content.includes("Call ended") && (
            <div className="w-full mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={handleHomeClick}
                className="w-full bg-[#9747FF] text-white text-lg font-semibold py-4 rounded-2xl shadow-lg hover:bg-[#863ee0] transition-all active:scale-95 flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>{t.btn_back_home}</span>
              </button>
            </div>
          )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-4 rounded-2xl bg-white shadow-md rounded-bl-none">
              <div className="flex space-x-1 h-6 items-center px-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-blink"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-blink"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-blink"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  const renderHistory = () => {
    const getTheme = (titleKey: string) => {
      if (titleKey === "ticket_sick")
        return {
          border: "border-l-4 border-emerald-500",
          badge: "text-emerald-700 bg-emerald-50",
          icon: "text-emerald-500",
        };
      if (titleKey === "ticket_late")
        return {
          border: "border-l-4 border-pink-500",
          badge: "text-pink-700 bg-pink-50",
          icon: "text-pink-500",
        };
      return {
        border: "border-l-4 border-blue-500",
        badge: "text-blue-700 bg-blue-50",
        icon: "text-blue-500",
      };
    };

    return (
      <div className="w-full flex flex-col space-y-6 h-full">
        <h2 className="font-display text-2xl font-semibold text-gray-800 pl-2 mb-2">
          {t.tab_history}
        </h2>

        <div className="flex flex-col space-y-3">
          <h3
            className={`${
              visionMode
                ? "text-xl font-bold text-black pl-2"
                : "text-sm font-bold text-gray-400 uppercase tracking-wider pl-2"
            }`}
          >
            {t.status_in_progress}
          </h3>
          {historyItems
            .filter(
              (i) => i.status === "status_sent" || i.status === "status_review"
            )
            .map((item, idx) => {
              const theme = getTheme(item.title);
              // Use type assertion to access translation keys safely if needed, or just use as any
              const titleText = (t as any)[item.title] || item.title;
              const statusText = (t as any)[item.status] || item.status;

              return (
                <div
                  key={idx}
                  className={`p-4 bg-white rounded-xl shadow-md flex justify-between items-center animate-in slide-in-from-bottom-2 duration-300 ${theme.border}`}
                >
                  <div>
                    <div className="font-bold text-gray-800 text-lg">
                      {titleText}
                    </div>
                    <div
                      className={`${
                        visionMode
                          ? "text-base font-bold text-black"
                          : "text-xs text-gray-400 font-medium"
                      }`}
                    >
                      {item.date}
                    </div>
                  </div>
                  <span
                    className={`font-semibold px-3 py-1 rounded-full text-sm ${theme.badge}`}
                  >
                    {statusText}
                  </span>
                </div>
              );
            })}
        </div>

        <div className="flex flex-col space-y-3 mt-4">
          <h3
            className={`${
              visionMode
                ? "text-xl font-bold text-black pl-2"
                : "text-sm font-bold text-gray-400 uppercase tracking-wider pl-2"
            }`}
          >
            {t.status_finished}
          </h3>
          {historyItems
            .filter((i) => i.status === "status_done")
            .map((item, idx) => {
              const theme = getTheme(item.title);
              const titleText = (t as any)[item.title] || item.title;
              const statusText = (t as any)[item.status] || item.status;

              return (
                <div
                  key={idx}
                  className={`p-4 bg-gray-50 rounded-xl flex justify-between items-center animate-in slide-in-from-bottom-2 duration-300 ${theme.border}`}
                >
                  <div>
                    <div className="font-bold text-gray-600 text-lg">
                      {titleText}
                    </div>
                    <div
                      className={`${
                        visionMode
                          ? "text-base font-bold text-black"
                          : "text-xs text-gray-400 font-medium"
                      }`}
                    >
                      {item.date}
                    </div>
                  </div>
                  <span
                    className={`font-semibold px-3 py-1 text-sm rounded-full ${theme.badge}`}
                  >
                    {statusText}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="w-full flex flex-col space-y-6 h-full">
      <div className="flex items-center mb-2">
        <button
          onClick={handleHomeClick}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h2 className="font-display flex-1 text-xl font-semibold text-gray-800 text-center mr-10">
          {t.header_accessibility}
        </h2>
      </div>

      <div className="flex flex-col gap-4 px-1">
        {[
          {
            id: "Standard",
            icon: SettingsIcon,
            label: t.setting_standard,
            desc: t.setting_standard_desc,
          },
          {
            id: "Vision",
            icon: Eye,
            label: t.setting_vision,
            desc: t.setting_vision_desc,
          },
          {
            id: "Hearing",
            icon: Ear,
            label: t.setting_hearing,
            desc: t.setting_hearing_desc,
          },
        ].map((mode) => {
          const isActive =
            (mode.id === "Vision" && visionMode) ||
            (mode.id === "Hearing" && isTTSEnabled);
          const Icon = mode.icon;

          // Dynamic Font Sizes
          const titleSize =
            textSizeMode === "Huge"
              ? "text-xl"
              : textSizeMode === "Large"
              ? "text-lg"
              : "text-base";
          const descSize =
            textSizeMode === "Huge"
              ? "text-lg"
              : textSizeMode === "Large"
              ? "text-base"
              : "text-sm";

          const activeClasses =
            isActive && mode.id === "Vision"
              ? "bg-white border-4 border-black text-black shadow-none scale-[1.02]"
              : isActive
              ? "bg-[#9747FF] border-[#9747FF] text-white shadow-lg shadow-purple-500/30 scale-[1.02]"
              : "bg-white border-gray-200 text-gray-800 shadow-lg shadow-purple-100/50 hover:border-purple-300";

          return (
            <button
              key={mode.id}
              onClick={() => {
                if (mode.id === "Standard") {
                  setVisionMode(false);
                  setIsHighContrast(false);
                  setIsTTSEnabled(false);
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                } else if (mode.id === "Vision") {
                  setVisionMode(!visionMode);
                } else if (mode.id === "Hearing") {
                  const newState = !isTTSEnabled;
                  setIsTTSEnabled(newState);
                  if (
                    newState &&
                    typeof window !== "undefined" &&
                    window.speechSynthesis
                  ) {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(
                      "Voice mode enabled"
                    );
                    utterance.lang =
                      language === "Swedish"
                        ? "sv-SE"
                        : language === "Arabic"
                        ? "ar-SA"
                        : "en-US";
                    window.speechSynthesis.speak(utterance);
                  }
                }
              }}
              className={`flex flex-row items-center p-6 rounded-2xl text-left transition-all duration-300 border ${activeClasses}`}
            >
              <div className="mr-4">
                <Icon
                  className={`w-8 h-8 ${
                    isActive && mode.id !== "Vision"
                      ? "text-white"
                      : "text-black"
                  }`}
                />
              </div>
              <div>
                <span className={`font-bold block mb-1 ${titleSize}`}>
                  {mode.label}
                </span>
                <p
                  className={`leading-tight ${descSize} ${
                    isActive && mode.id !== "Vision"
                      ? "text-purple-100"
                      : "text-gray-500"
                  }`}
                >
                  {mode.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Language Selector */}
      <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
        <span className="font-bold text-gray-800 text-lg">
          {t.label_language}
        </span>
        <select
          className="bg-gray-50 border border-gray-300 text-gray-800 text-base rounded-lg focus:ring-primary focus:border-primary block p-2.5 min-w-[120px]"
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
        >
          <option value="English">English</option>
          <option value="Swedish">Svenska</option>
          <option value="Arabic">العربية</option>
        </select>
      </div>
    </div>
  );

  const baseClasses =
    "fixed inset-0 w-full h-[100dvh] flex flex-col overflow-hidden transition-all duration-300";
  const visionClasses = visionMode
    ? "bg-white text-black font-bold text-lg" // Vision ON: Big, Bold, Stark White
    : `bg-white font-sans text-gray-900 ${
        textSizeMode === "Huge"
          ? "text-2xl"
          : textSizeMode === "Large"
          ? "text-lg"
          : "text-base"
      } ${isHighContrast ? "contrast-125 font-medium" : ""}`;

  return (
    <div className={`${baseClasses} ${visionClasses}`}>
      {isCalling && <CallOverlay onEndCall={handleEndCall} />}

      {/* 1. Fixed Status Bar */}
      <div className="flex-none z-50">
        <StatusBar visionMode={visionMode} />
      </div>

      {/* 2. Scrollable Content Area */}
      <div
        className={`flex-1 w-full overflow-y-auto overflow-x-hidden pt-16 pb-64 px-4 sm:px-6 ${
          currentTab === "home" &&
          messages.length === 0 &&
          viewState === "main" &&
          ticketState === "chat"
            ? "flex flex-col justify-center items-center"
            : "flex flex-col justify-start"
        }`}
      >
        {currentTab === "home" && renderHome()}
        {currentTab === "history" && renderHistory()}
        {currentTab === "settings" && renderSettings()}
      </div>

      {/* Bottom Interaction Layer */}
      {currentTab === "home" &&
        ticketState !== "summary" &&
        ticketState !== "success" && (
          <div className="flex-none z-50 absolute bottom-[80px] left-0 w-full pointer-events-none px-4">
            <div className="pointer-events-auto max-w-lg mx-auto w-full flex flex-col items-center">
              {/* Chips */}
              <div className="pointer-events-auto flex flex-wrap justify-center gap-2 mb-4 animate-in slide-in-from-bottom-4 duration-300">
                {/* New Dynamic Suggestions from AI (Hidden if in Decision Mode) */}
                {currentSuggestions.length > 0 &&
                  ticketState !== "decision" && (
                    <>
                      {currentSuggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (s.includes("I am done")) {
                              setTicketState("summary");
                            } else {
                              handleSend(s);
                            }
                          }}
                          className={`px-4 py-2 rounded-full transition-all active:scale-95 ${
                            visionMode
                              ? "bg-white border-4 border-black text-black text-xl font-bold shadow-none"
                              : s.includes("I am done")
                              ? "bg-gray-900 text-white shadow-md hover:bg-gray-800 font-semibold"
                              : "bg-white border border-gray-300 text-gray-700 shadow-sm hover:bg-gray-50 font-semibold"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </>
                  )}

                {activeFlow === "cleaning_tools_selection" && (
                  <>
                    {["Mops", "Cloths", "Chemicals"].map((tool) => (
                      <button
                        key={tool}
                        onClick={() => handleToolSelection(tool)}
                        className={`px-4 py-2 rounded-full font-semibold transition-all active:scale-95 ${
                          visionMode
                            ? "bg-white border-4 border-black text-black text-xl font-bold shadow-none"
                            : "bg-purple-100 text-primary shadow-sm border border-purple-200 hover:bg-purple-200"
                        }`}
                      >
                        {tool}
                      </button>
                    ))}
                  </>
                )}

                {activeFlow === "call_manager" && (
                  <button
                    onClick={handleCallManager}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-all ${
                      visionMode
                        ? "bg-white border-4 border-black text-black text-xl shadow-none"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    <Phone className="w-5 h-5 fill-current" />{" "}
                    <span>Call Manager</span>
                  </button>
                )}

                {activeFlow === "lost_key" && (
                  <div className="flex gap-2 w-full justify-center">
                    <button
                      onClick={handleNotifySecurity}
                      className={`px-6 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-all ${
                        visionMode
                          ? "bg-white border-4 border-black text-black text-xl shadow-none"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      Yes, notify Security
                    </button>
                    <button
                      onClick={handleFoundKey}
                      className={`px-6 py-3 rounded-full font-bold shadow-sm active:scale-95 transition-all ${
                        visionMode
                          ? "bg-white border-4 border-black text-black text-xl shadow-none"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      No, I found it
                    </button>
                  </div>
                )}
              </div>

              {/* Preview */}
              {selectedImage && (
                <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-4 mb-4 animate-in zoom-in duration-300 flex flex-col items-center">
                  <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden mb-4">
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={cancelUpload}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={handleUploadConfirm}
                    className="w-full bg-primary text-white font-semibold py-3 rounded-xl shadow-md hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center space-x-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>{t.chip_upload}</span>
                  </button>
                </div>
              )}

              {/* Decision Buttons (Render IF ticketState === 'decision') */}
              {ticketState === "decision" && (
                <div className="w-full flex flex-col space-y-3 mb-3 animate-in slide-in-from-bottom-10 duration-300">
                  <button
                    onClick={() => setTicketState("summary")}
                    className={`w-full text-lg font-semibold py-3 rounded-2xl shadow-lg active:scale-95 transition-all ${
                      visionMode
                        ? "bg-white border-4 border-black text-black text-xl font-bold shadow-none"
                        : "bg-primary text-white hover:bg-primary/90"
                    }`}
                  >
                    {t.btn_submit_done}
                  </button>
                  <button
                    onClick={() => handleSend(t.btn_ask_more)}
                    className={`w-full text-lg font-semibold py-3 rounded-2xl active:scale-95 transition-all ${
                      visionMode
                        ? "bg-white border-4 border-black text-black text-xl font-bold shadow-none"
                        : "bg-white text-primary border-2 border-purple-100 hover:bg-purple-50"
                    }`}
                  >
                    {t.btn_ask_more}
                  </button>
                </div>
              )}

              {/* Input Bar (ALWAYS RENDER) */}
              <div
                className={`relative w-full flex items-center rounded-full p-2 pl-6 ${
                  visionMode
                    ? "border-4 border-black bg-white shadow-none"
                    : "bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100"
                }`}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={t.input_placeholder}
                  className={`flex-1 bg-transparent outline-none text-base ${
                    visionMode
                      ? "text-black font-bold placeholder:text-gray-600"
                      : "text-gray-700 placeholder-gray-400"
                  }`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <div className="flex items-center space-x-2">
                  <button
                    className={`p-2 transition-colors ${
                      visionMode
                        ? "text-black hover:bg-gray-100 rounded-full"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className={visionMode ? "w-6 h-6" : "w-5 h-5"} />
                  </button>
                  <button
                    className={`p-2 transition-colors ${
                      isListening
                        ? visionMode
                          ? "text-black animate-pulse"
                          : "text-[#9747FF] animate-pulse"
                        : visionMode
                        ? "text-black hover:bg-gray-100 rounded-full"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                    onClick={() => {
                      setShowVoiceOverlay(true);
                      if (!isListening) toggleListening();
                    }}
                  >
                    <Mic
                      className={`${visionMode ? "w-6 h-6" : "w-5 h-5"} ${
                        isListening ? "fill-current" : ""
                      }`}
                    />
                  </button>
                  <button
                    className={`p-3 rounded-full transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                      visionMode
                        ? "bg-black text-white hover:bg-gray-900"
                        : "bg-primary hover:bg-primary/90 text-white active:bg-primary/80"
                    }`}
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                  >
                    <Send className="w-5 h-5 fill-current translate-x-[-1px] translate-y-[1px]" />
                  </button>
                </div>
              </div>

              {/* Branding */}
              <div className="text-center mt-2">
                <span
                  className={`${
                    visionMode
                      ? "text-sm font-bold text-black"
                      : "text-[10px] text-gray-400 font-medium"
                  }`}
                >
                  {t.footer_run_by} <strong>Anduril 1.0 version</strong>
                </span>
              </div>
            </div>
          </div>
        )}

      {/* 3. Fixed Bottom Navigation */}
      <div className="flex-none z-50 absolute bottom-0 left-0 w-full">
        <BottomNav
          visionMode={visionMode}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          handleHomeClick={handleHomeClick}
          labels={{
            home: t.tab_home,
            history: t.tab_history,
            settings: t.tab_settings,
          }}
        />
      </div>

      {activeInstruction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl flex flex-col items-center relative animate-in zoom-in-95 duration-300">
            <h3 className="font-display text-2xl font-bold text-center text-gray-800 mb-6">
              {activeInstruction.title}
            </h3>
            <div
              className={`w-full h-40 rounded-2xl mb-6 ${activeInstruction.color} border-2 border-gray-100 flex items-center justify-center`}
            >
              <div className="w-16 h-16 bg-white/50 rounded-full" />
            </div>
            <p className="text-lg text-center text-gray-700 font-medium mb-8 whitespace-pre-line">
              {activeInstruction.text}
            </p>
            <button
              onClick={() => setActiveInstruction(null)}
              className="w-full py-3 bg-[#9747FF] text-white font-bold rounded-xl shadow-md hover:bg-[#863ee0] transition-all"
            >
              {t.btn_close}
            </button>
          </div>
        </div>
      )}

      {summaryCardContent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl relative animate-in slide-in-from-bottom duration-300">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-display text-2xl font-bold text-gray-900">Instruction Summary</h3>
              <button 
                onClick={() => setSummaryCardContent(null)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6 space-y-6">
               {/* Read Aloud Button */}
               <button
                onClick={() => speak(summaryCardContent)}
                className="w-full flex items-center justify-center space-x-3 bg-purple-50 border border-purple-100 rounded-xl p-4 hover:bg-purple-100 transition-colors group"
              >
                <div className="bg-white p-2 rounded-full shadow-sm group-active:scale-95 transition-transform">
                  <Volume2 className="w-6 h-6 text-[#9747FF]" />
                </div>
                <span className="text-lg font-bold text-[#9747FF]">Read Aloud</span>
              </button>

              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <ReactMarkdown>{summaryCardContent}</ReactMarkdown>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
              <button
                onClick={() => setSummaryCardContent(null)}
                className="w-full py-4 bg-[#9747FF] text-white text-lg font-bold rounded-2xl shadow-lg hover:bg-[#863ee0] transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            // Just show a visual cue for now
            alert(`File attached: ${e.target.files[0].name}`);
          }
        }}
      />

      {showVoiceOverlay && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            onClick={() => setShowVoiceOverlay(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 h-1/2 bg-white rounded-t-3xl shadow-2xl z-50 flex flex-col items-center justify-between py-12 animate-in slide-in-from-bottom duration-300 max-w-lg mx-auto">
            <span className="text-gray-500 font-medium text-lg animate-pulse">
              {t.status_listening}
            </span>
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#9747FF]/10 flex items-center justify-center mb-4">
                <Mic className="w-10 h-10 text-[#9747FF]" />
              </div>
            </div>
            <div className="flex items-center justify-center space-x-1 h-16 mb-8">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-[#9747FF] rounded-full animate-wave"
                  style={{
                    animationDuration: `${0.6 + Math.random() * 0.4}s`,
                    animationDelay: `${i * 0.1 - 0.2}s`,
                  }}
                />
              ))}
            </div>
            <div className="flex items-center w-full justify-between px-16">
              <button
                onClick={() => {
                  setShowVoiceOverlay(false);
                  if (isListening) toggleListening();
                  setInput("");
                }}
                className="w-16 h-16 rounded-full bg-[#9747FF] flex items-center justify-center shadow-lg hover:bg-[#863ee0] transition-all active:scale-95"
              >
                <Trash2 className="w-7 h-7 text-white" />
              </button>
              <button
                onClick={() => {
                  setShowVoiceOverlay(false);
                  if (isListening) toggleListening();
                  if (input.trim()) handleSend();
                }}
                className="w-16 h-16 rounded-full bg-[#9747FF] flex items-center justify-center shadow-lg hover:bg-[#863ee0] transition-all active:scale-95"
              >
                <Square className="w-7 h-7 text-white fill-current" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
