// components/ValuationDashboard/ValuationDashboard.tsx
import React from "react";
import ProjectionsTable from "../ProjectionsTable/ProjectionsTable";
import ValuationMultiplesTable from "../ValuationMultiplesTable/ValuationMultiplesTable";
import IntrinsicValueResults from "../IntrinsicValueResults/IntrinsicValueResults";

import { QuoteSummaryResult, YahooFinanceRawValue } from "@/types/api";

// Función de ayuda para obtener el valor 'raw' de forma segura.
const getRawValue = (
  value: number | YahooFinanceRawValue | undefined | null
): number | string => {
  if (typeof value === "object" && value !== null && "raw" in value) {
    return value.raw;
  }
  return typeof value === "number" ? value : "N/A";
};

// Esta es la interfaz de las props del componente.
interface Props {
  ticker: string;
  apiData: QuoteSummaryResult;
}

const ValuationDashboard: React.FC<Props> = ({ ticker, apiData }) => {
  const currentPrice = getRawValue(apiData.price?.regularMarketPrice);
  const trailingPE = getRawValue(apiData.defaultKeyStatistics?.trailingPE);
  const forwardPE = getRawValue(apiData.defaultKeyStatistics?.forwardPE);

  const enterpriseValue = getRawValue(
    apiData.defaultKeyStatistics?.enterpriseValue
  );
  const ebitda = getRawValue(apiData.financialData?.ebitda);

  const evToEbitda =
    typeof enterpriseValue === "number" &&
    typeof ebitda === "number" &&
    ebitda !== 0
      ? enterpriseValue / ebitda
      : "N/A";

  const evToFcf = "N/A";
  const evToEbit = "N/A";

  const targetPE = 20.0;
  const targetEvFcf = 20.0;
  const targetEvEbitda = 16.0;
  const targetEvEbit = 16.0;

  const processedData = {
    currentPrice: currentPrice,
    multiples: {
      per: { ltm: trailingPE, ntm: forwardPE, target: targetPE },
      ev_fcf: { ltm: evToFcf, ntm: evToFcf, target: targetEvFcf },
      ev_ebitda: { ltm: evToEbitda, ntm: evToEbitda, target: targetEvEbitda },
      ev_ebit: { ltm: evToEbit, ntm: evToEbit, target: targetEvEbit },
    },
    projections: {
      salesGrowth: "12%",
      ebitMargin: "28%",
      taxRate: "21%",
      sharesIncrease: "0.05%",
    },
    valuationResults: {
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
    },
    marginOfSafety: 185,
    cagrResults: {
      per: 33,
      ev_fcf: 33,
      ev_ebitda: 33,
      ev_ebit: 33,
    },
  };

  return (
    // CAMBIOS AQUI: bg-white y text-gray-800
    <div className="bg-white text-gray-800 min-h-screen p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* CAMBIO AQUI: text-gray-800 */}
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
          Análisis de Valoración: {ticker}
        </h2>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* El color del componente hijo se ajustará dentro de cada componente */}
          <ProjectionsTable ticker={ticker} />
          <ValuationMultiplesTable
            ticker={ticker}
            currentPrice={
              typeof processedData.currentPrice === "number"
                ? processedData.currentPrice
                : 0
            }
          />
        </div>
        <IntrinsicValueResults
          results={processedData.valuationResults}
          marginOfSafety={processedData.marginOfSafety}
          cagrResults={processedData.cagrResults}
        />
      </div>
    </div>
  );
};

export default ValuationDashboard;
