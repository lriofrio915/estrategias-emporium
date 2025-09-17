// components/ValuationDashboard/ValuationDashboard.tsx
import React from "react";
import ProjectionsTable from "../ProjectionsTable/ProjectionsTable";
import ValuationMultiplesTable from "../ValuationMultiplesTable/ValuationMultiplesTable";
import IntrinsicValueResults from "../IntrinsicValueResults/IntrinsicValueResults";
import { ValuationDashboardData } from "@/types/valuation";

interface Props {
  ticker: string;
  data: ValuationDashboardData | null;
}

const ValuationDashboard: React.FC<Props> = ({ ticker, data }) => {
  // El componente ahora es completamente presentacional.
  // Recibe todos los datos necesarios a través de la prop `data`.

  return (
    <div className="bg-white text-gray-800 p-8 font-sans mb-8 rounded-lg shadow-xl border border-gray-200">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
          Análisis de Valoración: {ticker}
        </h2>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <ProjectionsTable
            data={data?.projectionsData || null}
          />
          <ValuationMultiplesTable
            currentPrice={data?.currentPrice || 0}
            data={data?.multiplesData || null}
          />
        </div>

        {/* Pasamos los datos de valoración intrínseca al componente hijo */}
        {data && (
          <IntrinsicValueResults
            results={data.valuationResults}
            marginOfSafety={data.marginOfSafety}
            cagrResults={data.cagrResults}
          />
        )}
      </div>
    </div>
  );
};

export default ValuationDashboard;
