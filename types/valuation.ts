// types/valuation.ts

import { ApiAssetItem } from "./api";

// Para el componente ProjectionsTable
export interface ProjectionsData {
  salesGrowth: number | string;
  ebitMargin: number | string;
  taxRate: number | string;
  sharesIncrease: number | string;
}

// Para el componente ValuationMultiplesTable
export interface MultiplesData {
  PER: { ltm: number | string; target: number };
  EV_EBITDA: { ltm: number | string; target: number };
  EV_EBIT: { ltm: number | string; target: number };
  EV_FCF: { ltm: number | string; target: number };
}

// Tipos para los resultados de valoración intrínseca
export interface ValuationResult {
  per_ex_cash: number;
  ev_fcf: number;
  ev_ebitda: number;
  ev_ebit: number;
}

export interface CagrResult {
  per: number;
  ev_fcf: number;
  ev_ebitda: number;
  ev_ebit: number;
}

// Estructura de datos principal para el ValuationDashboard
export interface ValuationDashboardData {
  projectionsData: ProjectionsData | null;
  multiplesData: MultiplesData | null;
  currentPrice: number | null;
  valuationResults: { [key: string]: ValuationResult };
  marginOfSafety: number | string;
  cagrResults: CagrResult;
}

// Helper para extraer y procesar los datos crudos de la API
export function processApiDataForDashboard(
  apiAssetItem: ApiAssetItem | null
): ValuationDashboardData | null {
  if (!apiAssetItem) return null;

  const { data } = apiAssetItem;
  const {
    price,
    defaultKeyStatistics,
    financialData,
    incomeStatementHistory,
    cashflowStatementHistory,
  } = data;

  const getRawValue = (value: any): number | string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object" && "raw" in value) {
      return value.raw;
    }
    return typeof value === "number" ? value : "N/A";
  };

  const getMostRecentValue = (history: any[] | undefined, key: string) => {
    if (!history || history.length === 0) return "N/A";
    return getRawValue(history[0][key]);
  };

  // --- Current Price ---
  const currentPrice =
    typeof getRawValue(price?.regularMarketPrice) === "number"
      ? (getRawValue(price?.regularMarketPrice) as number)
      : null;

  // --- Multiples Data ---
  const enterpriseValue = getRawValue(defaultKeyStatistics?.enterpriseValue);
  const trailingPE = getRawValue(defaultKeyStatistics?.trailingPE);
  const ltmEbitda = getRawValue(financialData?.ebitda);
  const ltmEbit = getMostRecentValue(
    incomeStatementHistory?.incomeStatementHistory,
    "ebit"
  );
  const ltmFcf = getMostRecentValue(
    cashflowStatementHistory?.cashflowStatements,
    "freeCashFlow"
  );

  const multiplesData: MultiplesData = {
    PER: { ltm: trailingPE, target: 20.0 },
    EV_EBITDA: {
      ltm:
        typeof enterpriseValue === "number" &&
        typeof ltmEbitda === "number" &&
        ltmEbitda !== 0
          ? enterpriseValue / ltmEbitda
          : "N/A",
      target: 16.0,
    },
    EV_EBIT: {
      ltm:
        typeof enterpriseValue === "number" &&
        typeof ltmEbit === "number" &&
        ltmEbit !== 0
          ? enterpriseValue / ltmEbit
          : "N/A",
      target: 16.0,
    },
    EV_FCF: {
      ltm:
        typeof enterpriseValue === "number" &&
        typeof ltmFcf === "number" &&
        ltmFcf !== 0
          ? enterpriseValue / ltmFcf
          : "N/A",
      target: 20.0,
    },
  };

  // --- Projections Data (Placeholder) ---
  const projectionsData: ProjectionsData | null = {
    salesGrowth: "12%",
    ebitMargin: "28%",
    taxRate: "21%",
    sharesIncrease: "0.05%",
  };

  // --- Intrinsic Value Data (Hardcoded for now) ---
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

  return {
    currentPrice,
    multiplesData,
    projectionsData,
    valuationResults,
    marginOfSafety,
    cagrResults,
  };
}
