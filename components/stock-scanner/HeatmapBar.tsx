// components/stock-scanner/HeatmapBar.tsx
import React from "react";

interface HeatmapBarProps {
  score: number;
  title: string;
  ticker: string;
}

const HeatmapBar: React.FC<HeatmapBarProps> = ({ score, title, ticker }) => {
  const roundedScore = Math.round(score);

  return (
    <div className="flex flex-col items-center text-center">
      <h4 className="font-semibold text-slate-200 mb-2 text-lg">{title}</h4>
      <div className="relative w-12 h-80 rounded-lg bg-slate-700 border-2 border-slate-600">
        {/* Gradient Background */}
        <div
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          style={{
            background:
              "linear-gradient(to top, #d62728, #ff7f0e, #f7fb0d, #5cf70d, #0d8df7)",
          }}
        />
        {/* Score Marker Line */}
        <div
          className="absolute w-full border-t-2 border-dashed border-black"
          style={{
            bottom: `${roundedScore}%`,
            transition: "bottom 0.5s ease-out",
          }}
        >
          {/* Score Label */}
          <div className="absolute left-full ml-2 -translate-y-1/2 bg-white text-black text-sm font-bold p-1 rounded shadow-lg whitespace-nowrap">
            {ticker}: {roundedScore}
          </div>
        </div>
        {/* Y-Axis Labels */}
        <div className="absolute -left-6 top-0 h-full text-xs text-slate-400 flex flex-col justify-between py-1">
          <span>100</span>
          <span>80</span>
          <span>60</span>
          <span>40</span>
          <span>20</span>
          <span>0</span>
        </div>
      </div>
    </div>
  );
};

export default HeatmapBar;
