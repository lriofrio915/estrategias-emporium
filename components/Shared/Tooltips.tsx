// components/Shared/Tooltip.tsx

import React from "react";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="relative group inline-block">
      {children}
      <div className="absolute left-1/2 bottom-full mb-2 z-50 transform -translate-x-1/2 p-2 w-max max-w-xs text-sm text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
