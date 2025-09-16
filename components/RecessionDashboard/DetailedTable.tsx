"use client";

import React from "react";
import type { ProcessedIndicator } from "../../lib/reccesion/types";

interface DetailedTableProps {
  data: ProcessedIndicator[];
}

// 1. Reutilizamos el mismo objeto de estilos que en KpiCard para consistencia
const phaseStyles = {
  "Fase 1": { emoji: "🟢" },
  "Fase 2": { emoji: "🟡" },
  "Fase 3": { emoji: "🔴" },
  "Fase 4": { emoji: "🟠" },
  Neutral: { emoji: "⚪️" },
  Error: { emoji: "⚫️" },
};

export const DetailedTable: React.FC<DetailedTableProps> = ({ data }) => {
  // Función para obtener la clase de color basada en el valor numérico
  const getValueColor = (value: number) => {
    if (isNaN(value)) return "text-gray-400";
    return value >= 0 ? "text-green-400" : "text-red-400";
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Detalles</h3>
        <button className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg text-sm hover:bg-green-600 transition-colors">
          Exportar CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase">
            {/* 2. Cabeceras de la tabla actualizadas */}
            <tr className="border-b-2 border-gray-700">
              <th scope="col" className="py-3 px-4">
                Indicador
              </th>
              <th scope="col" className="py-3 px-4">
                Tipo
              </th>
              <th scope="col" className="py-3 px-4">
                Fase
              </th>
              <th scope="col" className="py-3 px-4">
                Última Fecha
              </th>
              <th scope="col" className="py-3 px-4">
                Último Valor
              </th>
              <th scope="col" className="py-3 px-4">
                YoY
              </th>
              <th scope="col" className="py-3 px-4">
                Secuencial
              </th>
              <th scope="col" className="py-3 px-4">
                Aceleración YoY
              </th>
              <th scope="col" className="py-3 px-4">
                Enlace FRED
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((indicator) => (
              <tr
                key={indicator.id}
                className="border-b border-gray-700/50 hover:bg-gray-700/30"
              >
                <td className="py-4 px-4 font-medium text-white">
                  {indicator.name}
                </td>
                <td className="py-4 px-4">{indicator.kind}</td>
                <td className="py-4 px-4 text-center">
                  {/* 3. Renderizado del emoji en lugar del texto */}
                  <span className="text-xl">
                    {phaseStyles[indicator.phase]?.emoji ||
                      phaseStyles.Error.emoji}
                  </span>
                </td>
                <td className="py-4 px-4">{indicator.latest_date}</td>
                <td className="py-4 px-4">
                  {isNaN(indicator.latest_value)
                    ? "N/A"
                    : indicator.latest_value.toFixed(2)}
                </td>
                <td
                  className={`py-4 px-4 font-semibold ${getValueColor(
                    indicator.yoy
                  )}`}
                >
                  {isNaN(indicator.yoy)
                    ? "N/A"
                    : `${indicator.yoy.toFixed(2)}%`}
                </td>
                <td
                  className={`py-4 px-4 font-semibold ${getValueColor(
                    indicator.mom
                  )}`}
                >
                  {isNaN(indicator.mom)
                    ? "N/A"
                    : `${indicator.mom.toFixed(2)}%`}
                </td>
                <td className="py-4 px-4">
                  {isNaN(indicator.accel) ? "N/A" : indicator.accel.toFixed(2)}
                </td>
                <td className="py-4 px-4">
                  <a
                    href={indicator.fred_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-400 hover:underline"
                  >
                    Enlace
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
