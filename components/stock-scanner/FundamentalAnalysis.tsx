import React from "react";
import { FundamentalScores } from "@/types/stock-scanner";
import HeatmapBar from "./HeatmapBar";

interface FundamentalAnalysisProps {
  scores: FundamentalScores;
  ticker: string;
}

const ScoreCard: React.FC<{
  title: string;
  score: number | null;
  rating?: string;
}> = ({ title, score, rating }) => (
  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
    <p className="text-sm text-slate-400">{title}</p>
    <p className="text-3xl font-bold text-slate-100 mt-1">
      {score !== null ? Math.round(score) : "N/A"}
    </p>
    {rating && <p className="text-xs text-slate-300 mt-1">{rating}</p>}
  </div>
);

const FundamentalAnalysis: React.FC<FundamentalAnalysisProps> = ({
  scores,
  ticker,
}) => {
  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg">
      <h3 className="text-2xl font-bold text-slate-100 mb-4 text-center lg:text-left">
        Análisis Fundamental Cuantitativo
      </h3>
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
        <div className="flex-shrink-0">
          <HeatmapBar
            score={scores.overallScore}
            title="Puntuación General"
            ticker={ticker}
          />
        </div>
        <div className="flex-grow w-full">
          <div className="text-center mb-6">
            <p className="text-slate-300">Calificación General</p>
            <p className="text-2xl font-bold text-cyan-400">{scores.rating}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ScoreCard
              title="Crecimiento Ingresos"
              score={scores.revenueScore}
            />
            <ScoreCard title="Crecimiento EPS" score={scores.epsScore} />
            <ScoreCard
              title="Valoración (EV/EBITDA)"
              score={scores.evEbitdaScore}
            />
            <ScoreCard
              title="Salud Financiera (Z-Score)"
              score={scores.zScore}
            />
          </div>
          <div className="mt-6 text-xs text-slate-500 text-center lg:text-left">
            <p>
              <strong>Metodología:</strong> La puntuación general es un promedio
              de cuatro pilares: 1) **Crecimiento de Ingresos** (basado en CAGR
              y consistencia), 2) **Crecimiento de EPS** (basado en CAGR y años
              positivos), 3) **Valoración** (ratio EV/EBITDA comparado con su
              sector), y 4) **Salud Financiera** (basado en el Z-Score de Altman
              para riesgo de quiebra). Cada pilar se califica de 0 a 100.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundamentalAnalysis;
