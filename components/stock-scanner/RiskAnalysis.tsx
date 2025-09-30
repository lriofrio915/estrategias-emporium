import React from "react";
import { RiskScores } from "@/types/stock-scanner";
import HeatmapBar from "./HeatmapBar";

interface RiskAnalysisProps {
  scores: RiskScores;
  ticker: string;
}

const RiskMetric: React.FC<{
  title: string;
  value: number;
  score: number;
  format?: (v: number) => string;
}> = ({ title, value, score, format }) => {
  const formattedValue = format ? format(value) : value.toFixed(2);
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
      <p className="text-sm text-slate-400">{title}</p>
      <div className="flex justify-between items-baseline mt-1">
        <p className="text-2xl font-bold text-slate-100">{formattedValue}</p>
        <p className="text-lg font-semibold text-cyan-400">
          {Math.round(score)}{" "}
          <span className="text-xs text-slate-400">/ 100</span>
        </p>
      </div>
    </div>
  );
};

const RiskAnalysis: React.FC<RiskAnalysisProps> = ({ scores, ticker }) => {
  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg">
      <h3 className="text-2xl font-bold text-slate-100 mb-4 text-center lg:text-left">
        Análisis de Volatilidad
      </h3>
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
        <div className="flex-shrink-0">
          <HeatmapBar
            score={scores.overallScore}
            title="Puntuación de Riesgo"
            ticker={ticker}
          />
        </div>
        <div className="flex-grow w-full">
          <div className="space-y-4">
            <RiskMetric
              title="Volatilidad (Desv. Estándar Mensual)"
              value={scores.stdDev.value}
              score={scores.stdDev.score}
              format={(v) => `${v.toFixed(2)}%`}
            />
            <RiskMetric
              title="Beta (vs. SPY)"
              value={scores.beta.value}
              score={scores.beta.score}
            />
            <RiskMetric
              title="Mayor Caída Anual"
              value={scores.maxDrawdown.value}
              score={scores.maxDrawdown.score}
              format={(v) => `${v.toFixed(2)}%`}
            />
          </div>
          <div className="mt-6 text-xs text-slate-500 text-center lg:text-left">
            <p>
              <strong>Metodología:</strong> La puntuación de riesgo (0-100) mide
              la <strong>similitud</strong> del perfil de riesgo de la acción
              con el del mercado (S&amp;P 500), basado en los últimos{" "}
              <strong>{scores.monthsOfData} meses</strong> de datos de precios.
              Una puntuación de 100 indica un perfil de riesgo casi idéntico al
              del mercado. La puntuación es un promedio de tres métricas: 1){" "}
              <strong>Volatilidad</strong> (similitud de la desviación
              estándar), 2) <strong>Beta</strong> (similitud a un beta de 1.0),
              y 3) <strong>Mayor Caída Anual</strong> (similitud en la magnitud
              de la peor caída anual).
              {scores.monthsOfData < 12 && (
                <strong className="block mt-1 text-yellow-500/80">
                  Nota: El análisis se basa en un historial de precios corto, lo
                  que puede afectar la fiabilidad de las métricas de riesgo.
                </strong>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysis;
