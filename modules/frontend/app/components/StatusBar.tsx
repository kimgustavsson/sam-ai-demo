import React from 'react';
import { Signal, Battery, Wifi, Leaf } from 'lucide-react';

export const StatusBar = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-12 z-50 flex justify-between items-center px-6 bg-white/80 backdrop-blur-sm text-black font-bold text-sm select-none border-b border-gray-100/50">
       {/* Left: Time */}
       <div className="flex-1 flex justify-start">
          <span className="font-sans text-gray-900">12:30</span>
       </div>

       {/* Center: App Logo */}
       <div className="flex items-center space-x-2 absolute left-1/2 transform -translate-x-1/2 opacity-90 hover:opacity-100 transition-opacity">
        <div className="p-1 bg-teal-50 rounded-full">
           <Leaf className="w-4 h-4 text-teal-600 fill-teal-100" />
        </div>
        <span className="text-xs font-bold text-gray-600 tracking-wide uppercase">SAM AI</span>
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
