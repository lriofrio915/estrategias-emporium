// components/ValuationDashboard/ValuationDashboard.tsx
"use client";

import React, { Dispatch, SetStateAction } from "react";
import ProjectionsTable from "../ProjectionsTable/ProjectionsTable";
import ValuationMultiplesTable from "../ValuationMultiplesTable/ValuationMultiplesTable";
import IntrinsicValueResults from "../IntrinsicValueResults/IntrinsicValueResults";
import { QuoteSummaryResult, YahooFinanceRawValue } from "@/types/api";
import { ValuationMetrics, ValuationResults } from "@/types/valuation";

// --- INTERFACES Y TIPOS (SIN CAMBIOS) ---
interface EstimatesState {
  salesGrowth: number;
  ebitMargin: number;
  taxRate: number;
  sharesIncrease: number;
}
interface TargetsState {
  per: number;
  ev_ebitda: number;
  ev_ebit: number;
  ev_fcf: number;
}
interface FinancialAverages {
  salesGrowth: string;
  ebitMargin: string;
  taxRate: string;
  sharesIncrease: string;
}
interface Props {
  ticker: string;
  apiData: QuoteSummaryResult;
  valuationMultiples: ValuationMetrics | null;
  loadingMultiples: boolean;
  financialAverages: FinancialAverages | null;
  estimates: EstimatesState;
  setEstimates: Dispatch<SetStateAction<EstimatesState>>;
  targets: TargetsState;
  setTargets: Dispatch<SetStateAction<TargetsState>>;
  handleCalculation: () => void;
  isCalculating: boolean;
  valuationResults: ValuationResults | null;
  marginOfSafety: string | null;
  cagr: number | null;
}

// --- CORRECCIÓN CLAVE: Definimos un tipo específico para reemplazar 'any' ---
type YahooFinanceValue = number | YahooFinanceRawValue | undefined | null;

/**
 * Extrae de forma segura el valor numérico 'raw' de un objeto de Yahoo Finance.
 * @param value El valor que puede ser un número, un objeto, o nulo.
 * @returns El valor numérico extraído, o 0 si no es válido.
 */
const getRawValue = (value: YahooFinanceValue): number => {
  // Comprobamos si es un objeto válido con la propiedad 'raw'
  if (typeof value === "object" && value !== null && "raw" in value) {
    return typeof value.raw === "number" ? value.raw : 0;
  }
  // Si no es un objeto, comprobamos si es un número
  return typeof value === "number" ? value : 0;
};
// -------------------------------------------------------------------------

const ValuationDashboard: React.FC<Props> = ({
  ticker,
  apiData,
  valuationMultiples,
  loadingMultiples,
  financialAverages,
  estimates,
  setEstimates,
  targets,
  setTargets,
  handleCalculation,
  isCalculating,
  valuationResults,
  marginOfSafety,
  cagr,
}) => {
  const currentPrice = getRawValue(apiData.price?.regularMarketPrice);

  return (
    <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg mt-8 border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Análisis de Valoración: {ticker}
      </h2>
      <div className="grid md:grid-cols-2 gap-8 mb-6">
        <ProjectionsTable
          apiData={apiData}
          estimates={estimates}
          setEstimates={setEstimates}
          financialAverages={financialAverages}
        />
        <ValuationMultiplesTable
          currentPrice={currentPrice}
          metrics={valuationMultiples}
          loading={loadingMultiples}
          targets={targets}
          setTargets={setTargets}
        />
      </div>
      <div className="text-center my-6">
        <button
          onClick={handleCalculation}
          disabled={isCalculating}
          className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed"
        >
          {isCalculating ? "Calculando..." : "Calcular Valor Intrínseco"}
        </button>
      </div>

      {valuationResults && marginOfSafety !== null && cagr !== null && (
        <IntrinsicValueResults
          results={valuationResults}
          marginOfSafety={marginOfSafety}
          cagrResults={{
            per: cagr,
            ev_fcf: cagr,
            ev_ebitda: cagr,
            ev_ebit: cagr,
          }}
          currentPrice={currentPrice}
        />
      )}
    </div>
  );
};

export default ValuationDashboard;
