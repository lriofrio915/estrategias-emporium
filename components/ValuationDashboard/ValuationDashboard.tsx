// components/ValuationDashboard/ValuationDashboard.tsx
import React from "react";
import ProjectionsTable, {
  ProjectionsData,
} from "../ProjectionsTable/ProjectionsTable";
import ValuationMultiplesTable, {
  MultiplesData,
} from "../ValuationMultiplesTable/ValuationMultiplesTable";
import IntrinsicValueResults from "../IntrinsicValueResults/IntrinsicValueResults";

// Definimos la estructura de datos que este componente espera recibir
export interface ValuationDashboardData {
  projectionsData: ProjectionsData | null;
  multiplesData: MultiplesData | null;
  currentPrice: number | null;
}

interface Props {
  ticker: string;
  data: ValuationDashboardData | null;
}

const ValuationDashboard: React.FC<Props> = ({ ticker, data }) => {
  // Datos hardcodeados restantes (pueden ser movidos o calculados dinámicamente en el futuro)
  const valuationResults = {
    "2022e": {
      per_ex_cash: 221.71,
      ev_fcf: 224.9,
      ev_ebitda: 240.74,
      ev_ebit: 222.92,
    },
    "2023e": {
      per_ex_cash: 248.66,
      ev_fcf: 252.23,
      ev_ebitda: 269.51,
      ev_ebit: 249.56,
    },
    "2024e": {
      per_ex_cash: 278.83,
      ev_fcf: 282.83,
      ev_ebitda: 301.71,
      ev_ebit: 279.38,
    },
    "2025e": {
      per_ex_cash: 312.61,
      ev_fcf: 317.08,
      ev_ebitda: 337.76,
      ev_ebit: 312.77,
    },
    "2026e": {
      per_ex_cash: 350.42,
      ev_fcf: 355.42,
      ev_ebitda: 378.12,
      ev_ebit: 350.14,
    },
  };
  const marginOfSafety = 185;
  const cagrResults = { per: 33, ev_fcf: 33, ev_ebitda: 33, ev_ebit: 33 };

  return (
    <div className="bg-white text-gray-800 p-8 font-sans mb-8 rounded-lg shadow-xl border border-gray-200">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
          Análisis de Valoración: {ticker}
        </h2>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <ProjectionsTable
            ticker={ticker}
            data={data?.projectionsData || null}
          />
          <ValuationMultiplesTable
            ticker={ticker}
            currentPrice={data?.currentPrice || 0}
            data={data?.multiplesData || null}
          />
        </div>
        <IntrinsicValueResults
          results={valuationResults}
          marginOfSafety={marginOfSafety}
          cagrResults={cagrResults}
        />
      </div>
    </div>
  );
};

export default ValuationDashboard;
