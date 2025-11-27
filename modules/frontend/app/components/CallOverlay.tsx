import React, { useEffect, useState } from 'react';
import { PhoneOff, User } from 'lucide-react';

interface CallOverlayProps {
  onEndCall: () => void;
}

const CallOverlay: React.FC<CallOverlayProps> = ({ onEndCall }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between py-20 animate-in fade-in duration-300">
      
      {/* Top Section: Caller Info */}
      <div className="flex flex-col items-center space-y-6 mt-10">
        <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center shadow-2xl border-4 border-gray-800">
          <User className="w-16 h-16 text-gray-400" />
        </div>
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-wide">Manager</h2>
          <p className="text-lg text-gray-400 font-medium tracking-wide">
            Calling{dots}
          </p>
        </div>
      </div>

      {/* Middle Section: Pulse Animation visual */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-sm opacity-20 pointer-events-none">
         <div className="w-64 h-64 bg-primary/20 rounded-full blur-3xl mx-auto animate-pulse"></div>
      </div>

      {/* Bottom Section: Controls */}
      <div className="mb-10">
        <button 
          onClick={onEndCall}
          className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all active:scale-95"
        >
          <PhoneOff className="w-8 h-8 text-white fill-current" />
        </button>
        <p className="text-gray-500 text-sm font-medium mt-4 text-center">End Call</p>
      </div>

    </div>
  );
};

export default CallOverlay;
