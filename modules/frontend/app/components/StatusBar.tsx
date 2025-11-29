import React from 'react';
import { Signal, Battery, Wifi, Leaf } from 'lucide-react';

interface StatusBarProps {
  visionMode?: boolean;
}

export const StatusBar = ({ visionMode = false }: StatusBarProps) => {
  return (
    <div className={`absolute top-0 left-0 w-full h-12 z-50 flex justify-between items-center px-6 text-black font-bold text-sm select-none border-b transition-all duration-300 ${visionMode ? 'bg-white border-black border-b-2' : 'bg-white/80 backdrop-blur-sm border-gray-100/50'}`}>
       {/* Left: Time */}
       <div className="flex-1 flex justify-start">
          <span className="font-sans text-gray-900">12:30</span>
       </div>


       {/* Right: Status Icons */}
       <div className="flex-1 flex justify-end items-center space-x-3">
          <Wifi className="w-4 h-4 text-gray-800" />
          <Signal className="w-4 h-4 text-gray-800" />
          <Battery className="w-5 h-5 text-gray-800" />
       </div>
    </div>
  );
};
