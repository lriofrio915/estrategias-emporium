"use client";
import React from "react";
import type { ProcessedIndicator } from "../../lib/reccesion/types";

interface KpiCardProps {
  indicator: ProcessedIndicator;
}

const formatPercent = (value: number): string => {
  if (isNaN(value) || value === null) return "—";
  return `${value.toFixed(2)}%`;
};

export const KpiCard: React.FC<KpiCardProps> = ({ indicator }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-medium text-gray-400 truncate">
          {indicator.name} [{indicator.id}]
        </h3>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className="text-4xl">{indicator.phase}</span>
          <p className="text-2xl font-semibold text-white">
            {formatPercent(indicator.yoy)}
          </p>
          <span className="text-gray-400 text-sm">YoY</span>
        </div>
      </div>
      <div className="mt-2">
        <p
          className={`text-sm ${
            indicator.mom >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {formatPercent(indicator.mom)} Secuencial
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Hasta {indicator.latest_date}
        </p>
      </div>
    </div>
  );
};
