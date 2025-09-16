"use client";

import React from "react";
import type { ProcessedIndicator } from "../../lib/reccesion/types";

interface KpiCardProps {
  indicator: ProcessedIndicator;
}

const phaseStyles = {
  "Fase 1": { bgGradient: "bg-gradient-to-br from-teal-300 to-green-500" },
  "Fase 2": { bgGradient: "bg-gradient-to-br from-yellow-300 to-yellow-500" },
  "Fase 3": { bgGradient: "bg-gradient-to-br from-red-400 to-red-600" },
  "Fase 4": { bgGradient: "bg-gradient-to-br from-orange-300 to-orange-500" },
  Neutral: { bgGradient: "bg-gradient-to-br from-gray-400 to-gray-600" },
  Error: { bgGradient: "bg-gradient-to-br from-gray-700 to-gray-900" },
};

export const KpiCard: React.FC<KpiCardProps> = ({ indicator }) => {
  const style = phaseStyles[indicator.phase] || phaseStyles.Error;

  const yoyValue = isNaN(indicator.yoy)
    ? "N/A"
    : `${indicator.yoy.toFixed(2)}%`;
  const momValue = isNaN(indicator.mom)
    ? "N/A"
    : `${indicator.mom.toFixed(2)}%`;

  const sequentialTextColor = isNaN(indicator.mom)
    ? "text-gray-400"
    : indicator.mom >= 0 // Usamos >= 0 para que el 0.00% sea verde
    ? "text-green-400"
    : "text-red-400";

  return (
    <a
      href={indicator.fred_url}
      target="_blank"
      rel="noopener noreferrer"
      // 1. Altura consistente y layout de columna
      className="bg-gray-800 rounded-xl p-4 flex flex-col h-44 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-500/10 border border-gray-700/50"
    >
      <h4 className="text-sm font-semibold text-gray-200 truncate text-left">
        {indicator.name}
      </h4>

      {/* 2. Contenedor principal centrado vertical y horizontalmente */}
      <div className="flex-grow flex items-center justify-center gap-3">
        {/* Círculo de color */}
        <div
          className={`w-12 h-12 rounded-full flex-shrink-0 ${style.bgGradient}`}
        />

        {/* 3. Contenedor de valores con alineación a la izquierda */}
        <div className="flex flex-col text-left">
          <p className="text-2xl font-bold text-white leading-tight">
            {yoyValue}
            {/* 4. Etiqueta YoY más sutil */}
            <span className="text-xs font-medium text-gray-400 ml-1.5">
              YoY
            </span>
          </p>
          <p className={`text-sm font-semibold ${sequentialTextColor}`}>
            {momValue} Secuencial
          </p>
        </div>
      </div>

      {/* La fecha se alinea al final por el flex-grow del contenedor superior */}
      <p className="text-xs text-gray-500 text-left">
        Hasta {indicator.latest_date}
      </p>
    </a>
  );
};
