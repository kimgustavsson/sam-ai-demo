import React from "react";
import { Home, ClipboardList, PersonStanding } from "lucide-react";

interface BottomNavProps {
  visionMode: boolean;
  currentTab: "home" | "history" | "settings";
  setCurrentTab: (tab: "home" | "history" | "settings") => void;
  handleHomeClick: () => void;
  labels: {
    home: string;
    history: string;
    settings: string;
  };
}

export const BottomNav: React.FC<BottomNavProps> = ({
  visionMode,
  currentTab,
  setCurrentTab,
  handleHomeClick,
  labels,
}) => {
  return (
    <nav
      className={`w-full bg-white flex justify-around items-center py-3 pt-4 pb-6 transition-all duration-300 ${
        visionMode
          ? ""
          : "border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]"
      }`}
    >
      <button
        onClick={handleHomeClick}
        className={`flex flex-col items-center space-y-1 w-16 transition-all ${
          currentTab === "home"
            ? visionMode
              ? "text-black font-bold rounded-xl p-1 bg-white"
              : "text-primary"
            : visionMode
            ? "text-black p-1"
            : "text-gray-500 hover:text-gray-600"
        }`}
      >
        <Home
          className={`${
            visionMode ? "w-8 h-8 text-black" : "w-7 h-7"
          }`}
        />
        <span
          className={`${
            visionMode
              ? "text-lg font-bold text-black"
              : "text-xs font-medium"
          }`}
        >
          {labels.home}
        </span>
      </button>

      <button
        onClick={() => setCurrentTab("history")}
        className={`flex flex-col items-center space-y-1 w-16 transition-all ${
          currentTab === "history"
            ? visionMode
              ? "text-black font-bold rounded-xl p-1 bg-white"
              : "text-primary"
            : visionMode
            ? "text-black p-1"
            : "text-gray-500 hover:text-gray-600"
        }`}
      >
        <ClipboardList
          className={`${
            visionMode ? "w-8 h-8 text-black" : "w-7 h-7"
          }`}
        />
        <span
          className={`${
            visionMode
              ? "text-lg font-bold text-black"
              : "text-xs font-medium"
          }`}
        >
          {labels.history}
        </span>
      </button>

      <button
        onClick={() => setCurrentTab("settings")}
        className={`flex flex-col items-center space-y-1 w-16 transition-all ${
          currentTab === "settings"
            ? visionMode
              ? "text-black font-bold rounded-xl p-1 bg-white"
              : "text-primary"
            : visionMode
            ? "text-black p-1"
            : "text-gray-500 hover:text-gray-600"
        }`}
      >
        <PersonStanding
          className={`${
            visionMode ? "w-8 h-8 text-black" : "w-7 h-7"
          }`}
        />
        <span
          className={`${
            visionMode
              ? "text-lg font-bold text-black"
              : "text-xs font-medium"
          }`}
        >
          {labels.settings}
        </span>
      </button>
    </nav>
  );
};
