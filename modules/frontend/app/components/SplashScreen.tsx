'use client';

import React, { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false); 
      setTimeout(() => setShouldRender(false), 500);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col justify-center items-center bg-white overflow-hidden transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
        {/* Background Aurora Blobs (Faster Pulse) */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-teal-400/30 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-400/20 rounded-full blur-3xl animate-pulse pointer-events-none" />

        {/* Main Content (Shifted Upwards) */}
        <div className="relative z-10 flex flex-col items-center text-center -mt-20 animate-in zoom-in-90 duration-1000">
            
            {/* Title with Moving Gradient */}
            <h1 className="font-display text-6xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-orange-500 bg-[length:200%_auto] animate-gradient pb-2">
                Enable
            </h1>

            {/* Subtitle */}
            <p className="uppercase tracking-[0.2em] font-light text-slate-400 text-sm mt-4 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200 fill-mode-forwards">
                Work without barriers
            </p>

        </div>

        {/* Footer Branding */}
        <div className="absolute bottom-10 relative z-10 text-gray-400 text-sm font-sans animate-in fade-in duration-1000 delay-500 fill-mode-forwards">
            Run by Anduril 1.0
        </div>
    </div>
  );
}
