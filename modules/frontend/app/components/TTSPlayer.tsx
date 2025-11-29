import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Square } from "lucide-react";

interface TTSPlayerProps {
  text: string;
  language: "English" | "Swedish" | "Arabic";
}

export const TTSPlayer: React.FC<TTSPlayerProps> = ({ text, language }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // On mount/unmount cleanup
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleStop = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handlePlay = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    // Determine Target Code
    const targetLangCode =
      language === "Swedish" ? "sv-SE" : language === "Arabic" ? "ar-SA" : "en-US";

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*_#`]/g, ""));
    
    // Find Best Voice
    const voices = window.speechSynthesis.getVoices();
    // Try to find a voice that matches the language code prefix (e.g. 'sv', 'ar', 'en')
    // Note: exact locale matching is better if possible, but prefix is a good fallback
    const langPrefix = targetLangCode.split('-')[0];
    
    const nativeVoice = voices.find((v) => v.lang.startsWith(langPrefix));
    if (nativeVoice) utterance.voice = nativeVoice;
    
    utterance.lang = targetLangCode;
    utterance.rate = 0.9;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onpause = () => {
        setIsPaused(true);
        setIsPlaying(false);
    }
    
    utterance.onresume = () => {
        setIsPlaying(true);
        setIsPaused(false);
    }

    utteranceRef.current = utterance;
    
    // Cancel any ongoing speech before starting new
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  return (
    <div className="w-full bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-200">
      <span className="text-gray-700 font-semibold text-lg">
        Audio Summary
      </span>

      <div className="flex items-center space-x-3">
        {/* Play/Pause Button */}
        {isPlaying ? (
          <button
            onClick={handlePause}
            className="p-3 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
            aria-label="Pause"
          >
            <Pause className="w-6 h-6 text-gray-800 fill-current" />
          </button>
        ) : (
          <button
            onClick={handlePlay}
            className="p-3 bg-[#9747FF] rounded-full shadow-md hover:bg-[#863ee0] transition-all active:scale-95"
            aria-label="Play"
          >
            <Play className="w-6 h-6 text-white fill-current pl-1" />
          </button>
        )}

        {/* Stop Button */}
        <button
          onClick={handleStop}
          className="p-3 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-red-50 hover:border-red-100 transition-all active:scale-95 group"
          aria-label="Stop"
        >
          <Square className="w-6 h-6 text-gray-500 group-hover:text-red-500 fill-current transition-colors" />
        </button>
      </div>
    </div>
  );
};
