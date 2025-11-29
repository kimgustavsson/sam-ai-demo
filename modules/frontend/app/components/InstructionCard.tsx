import React from 'react';

interface InstructionCardProps {
  imageSrc: string;
  text: string;
  visionMode?: boolean;
}

export const InstructionCard: React.FC<InstructionCardProps> = ({ imageSrc, text, visionMode }) => {
  return (
    <div className={`w-full max-w-sm overflow-hidden mt-2 ${
      visionMode 
        ? "bg-white border-4 border-black shadow-none rounded-xl" 
        : "bg-white rounded-2xl shadow-sm border border-gray-200"
    }`}>
      {/* Header */}
      <div className={`px-4 py-2 ${
        visionMode 
          ? "bg-black" 
          : "bg-[#9747FF]"
      }`}>
        <span className={`font-bold ${
          visionMode 
            ? "text-xl text-white" 
            : "text-sm text-white"
        }`}>Work Instruction</span>
      </div>

      {/* Image Area */}
      <div className="w-full h-48 bg-gray-100 relative">
        <img 
          src={imageSrc} 
          alt="Instruction Step" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Body */}
      <div className="p-4">
        <p className={`leading-relaxed ${
          visionMode 
            ? "text-black font-bold text-lg" 
            : "text-lg text-gray-800 font-medium"
        }`}>
          {text}
        </p>
      </div>
      
      {/* Footer area reserved for layout consistency */}
      <div className="px-4 pb-4"></div>
    </div>
  );
};
