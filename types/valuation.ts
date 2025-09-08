// types/valuation.ts

export interface MultiplesData {
  ltm: number | string;
  ntm: number | string;
  target: number | string;
}

export interface ValuationMetrics {
  per: MultiplesData;
  ev_fcf: MultiplesData;
  ev_ebitda: MultiplesData;
  ev_ebit: MultiplesData;
}

export interface ProjectionsData {
  salesGrowth: string;
  ebitMargin: string;
  taxRate: string;
  sharesIncrease: string;
}

export interface ValuationResult {
  per_ex_cash: number;
  ev_fcf: number;
  ev_ebitda: number;
  ev_ebit: number;
}

export interface AssetData {
  ticker: string;
  currentPrice: number;
  multiples: ValuationMetrics;
  projections: ProjectionsData;
  valuationResults: {
    "2022e": ValuationResult;
    "2023e": ValuationResult;
    "2024e": ValuationResult;
    "2025e": ValuationResult;
    "2026e": ValuationResult;
  };
  marginOfSafety: number | string;
  cagrResults: {
    per: number;
    ev_fcf: number;
    ev_ebitda: number;
    ev_ebit: number;
  };
}
