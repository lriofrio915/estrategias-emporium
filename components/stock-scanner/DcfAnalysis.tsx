import React, { useState } from "react";
import { DcfValuationResult } from "@/types/stock-scanner";
import { ChevronDownIcon } from "./Icons";

interface DcfAnalysisProps {
  result: DcfValuationResult;
  currentPrice: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    notation: "compact",
  }).format(value);

const DcfAnalysis: React.FC<DcfAnalysisProps> = ({ result, currentPrice }) => {
  const [isTableVisible, setIsTableVisible] = useState(false);
  const {
    fairValue,
    upsidePercentage,
    assumptions,
    projections,
    pvOfTerminalValue,
  } = result;

  const upsideColor = upsidePercentage >= 0 ? "text-green-400" : "text-red-400";
  const upsideSign = upsidePercentage >= 0 ? "▲" : "▼";

  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg">
      <h3 className="text-2xl font-bold text-slate-100 mb-6 text-center">
        Valoración por Flujo de Caja Descontado (DCF)
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Results Summary */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center bg-slate-800 p-6 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400">Precio Actual</p>
          <p className="text-4xl font-bold text-slate-100 my-1">
            {formatCurrency(currentPrice)}
          </p>
          <div className="w-24 h-px bg-slate-600 my-4"></div>
          <p className="text-sm text-cyan-400">Valor Intrínseco Estimado</p>
          <p className="text-5xl font-bold text-cyan-400 my-1">
            {formatCurrency(fairValue)}
          </p>
          <div
            className={`mt-4 text-2xl font-bold flex items-center gap-2 ${upsideColor}`}
          >
            <span>
              {upsideSign} {Math.abs(upsidePercentage).toFixed(2)}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Potencial de Subida/Bajada
          </p>
        </div>

        {/* Assumptions & Projections */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h4 className="font-semibold text-slate-200 text-lg mb-4">
              Supuestos Clave del Modelo
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-slate-700/50 p-3 rounded-md">
                <p className="text-xs text-slate-400">
                  Tasa de Descuento (WACC)
                </p>
                <p className="text-xl font-bold text-slate-100">
                  {assumptions.wacc.toFixed(2)}%
                </p>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-md">
                <p className="text-xs text-slate-400">
                  Crecimiento FCF (Años 1-5)
                </p>
                <p className="text-xl font-bold text-slate-100">
                  {assumptions.initialGrowthRate.toFixed(2)}%
                </p>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-md">
                <p className="text-xs text-slate-400">
                  Crecimiento a Perpetuidad
                </p>
                <p className="text-xl font-bold text-slate-100">
                  {assumptions.perpetualGrowthRate.toFixed(2)}%
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              <strong>Último FCF Anual Utilizado:</strong>{" "}
              {formatCompactCurrency(assumptions.latestFcf)}.
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setIsTableVisible(!isTableVisible)}
              className="w-full flex justify-between items-center text-left bg-slate-800 p-4 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              <span className="font-semibold text-slate-200">
                Ver Proyección a 10 Años
              </span>
              <ChevronDownIcon
                className={`w-5 h-5 text-slate-400 transition-transform ${
                  isTableVisible ? "rotate-180" : ""
                }`}
              />
            </button>
            {isTableVisible && (
              <div className="mt-2 p-4 bg-slate-800 border border-slate-700 rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-400">
                    <tr>
                      <th className="p-2">Año</th>
                      <th className="p-2 text-right">FCF Proyectado</th>
                      <th className="p-2 text-right">Valor Presente</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {projections.map((p) => (
                      <tr key={p.year} className="border-t border-slate-700">
                        <td className="p-2">
                          {new Date().getFullYear() + p.year}
                        </td>
                        <td className="p-2 text-right">
                          {formatCompactCurrency(p.fcf)}
                        </td>
                        <td className="p-2 text-right">
                          {formatCompactCurrency(p.pvOfFcf)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-slate-600 font-bold">
                      <td className="p-2 pt-3" colSpan={2}>
                        VP del Valor Terminal
                      </td>
                      <td className="p-2 pt-3 text-right">
                        {formatCompactCurrency(pvOfTerminalValue)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-6 text-center">
        <strong>Descargo de responsabilidad:</strong> Esta valoración es un
        modelo financiero generado por IA. Utiliza una tasa de descuento (WACC)
        estandarizada por sector para mayor consistencia, y proyecciones de
        flujo de caja libre basadas en el rendimiento histórico de la empresa.
        No constituye asesoramiento de inversión.
      </p>
    </div>
  );
};

export default DcfAnalysis;
