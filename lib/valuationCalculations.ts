// lib/valuationCalculations.ts

import {
  ProjectionInputs,
  YearlyProjection,
  ValuationResults,
  ValuationMetrics,
} from "@/types/valuation";
import {
  QuoteSummaryResult,
  YahooFinanceRawValue,
  ApiAssetItem,
} from "@/types/api";

const getRawValue = (
  value: number | string | YahooFinanceRawValue | undefined | null
): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "object" && "raw" in value) {
    return value.raw;
  }
  if (typeof value === "number") {
    return value;
  }
  return null;
};

/**
 * Procesa los datos de la API para generar los valores iniciales para los formularios.
 */
export function processInitialData(apiAssetItem: ApiAssetItem): {
  projectionsData: ProjectionInputs;
  multiplesData: ValuationMetrics;
} {
  const { data } = apiAssetItem;
  const {
    price,
    defaultKeyStatistics,
    financialData,
    incomeStatementHistory,
    balanceSheetHistory,
    cashflowStatementHistory,
  } = data;

  // --- Proyecciones Iniciales ---
  const salesHistory = incomeStatementHistory?.incomeStatementHistory || [];
  const salesGrowth =
    salesHistory.length > 1 && getRawValue(salesHistory[1].totalRevenue) !== 0
      ? ((getRawValue(salesHistory[0].totalRevenue)! -
          getRawValue(salesHistory[1].totalRevenue)!) /
          Math.abs(getRawValue(salesHistory[1].totalRevenue)!)) *
        100
      : 10;

  const sharesHistory = balanceSheetHistory?.balanceSheetStatements || [];
  const sharesIncrease =
    sharesHistory.length > 1 && getRawValue(sharesHistory[1].shareIssued) !== 0
      ? ((getRawValue(sharesHistory[0].shareIssued)! -
          getRawValue(sharesHistory[1].shareIssued)!) /
          Math.abs(getRawValue(sharesHistory[1].shareIssued)!)) *
        100
      : 0.5;

  const projectionsData: ProjectionInputs = {
    salesGrowth: isNaN(salesGrowth) ? 10 : parseFloat(salesGrowth.toFixed(2)),
    ebitMargin:
      parseFloat(
        (getRawValue(financialData?.operatingMargins)! * 100).toFixed(2)
      ) || 15,
    taxRate: 21,
    sharesIncrease: isNaN(sharesIncrease)
      ? 0.5
      : parseFloat(sharesIncrease.toFixed(2)),
  };

  // --- Múltiplos Iniciales (LTM) ---
  const currentPrice = getRawValue(price?.regularMarketPrice) || 0;
  const trailingEps = getRawValue(defaultKeyStatistics?.trailingEps) || 0;
  const enterpriseValue =
    getRawValue(defaultKeyStatistics?.enterpriseValue) || 0;
  const ltmEbitda = getRawValue(financialData?.ebitda) || 0;
  const ltmEbit =
    getRawValue(incomeStatementHistory?.incomeStatementHistory?.[0]?.ebit) || 0;
  const ltmFcf =
    getRawValue(
      cashflowStatementHistory?.cashflowStatements?.[0]?.freeCashflow
    ) || 0;

  const multiplesData: ValuationMetrics = {
    PER: {
      ltm:
        trailingEps > 0
          ? parseFloat((currentPrice / trailingEps).toFixed(2))
          : "N/A",
      ntm: getRawValue(defaultKeyStatistics?.forwardPE)?.toFixed(2) || "N/A",
      target: 20,
    },
    EV_EBITDA: {
      ltm:
        ltmEbitda !== 0
          ? parseFloat((enterpriseValue / ltmEbitda).toFixed(2))
          : "N/A",
      ntm: "N/A",
      target: 16,
    },
    EV_EBIT: {
      ltm:
        ltmEbit !== 0
          ? parseFloat((enterpriseValue / ltmEbit).toFixed(2))
          : "N/A",
      ntm: "N/A",
      target: 18,
    },
    EV_FCF: {
      ltm:
        ltmFcf !== 0
          ? parseFloat((enterpriseValue / ltmFcf).toFixed(2))
          : "N/A",
      ntm: "N/A",
      target: 20,
    },
  };

  return { projectionsData, multiplesData };
}

// ... (El resto de las funciones: projectFinancials, calculateIntrinsicValue, etc., van aquí sin cambios)

export const projectFinancials = (
  lastYearData: {
    revenue: number;
    ebit: number;
    fcf: number;
    shares: number;
  },
  inputs: ProjectionInputs
): YearlyProjection[] => {
  const projections: YearlyProjection[] = [];
  let currentRevenue = lastYearData.revenue;
  let currentShares = lastYearData.shares;

  for (let i = 1; i <= 5; i++) {
    const year = new Date().getFullYear() + i;
    currentRevenue *= 1 + inputs.salesGrowth / 100;
    currentShares *= 1 + inputs.sharesIncrease / 100;

    const ebit = currentRevenue * (inputs.ebitMargin / 100);
    const netIncome = ebit * (1 - inputs.taxRate / 100);
    const fcf = netIncome;

    projections.push({
      year: `${year}e`,
      revenue: currentRevenue,
      ebit,
      netIncome,
      fcf,
      sharesOutstanding: currentShares,
    });
  }
  return projections;
};

export const calculateIntrinsicValue = (
  projections: YearlyProjection[],
  multiples: ValuationMetrics,
  apiData: QuoteSummaryResult
): ValuationResults => {
  const valuationResults: ValuationResults = {};
  const totalDebt = getRawValue(apiData.financialData?.totalDebt) || 0;
  const totalCash = getRawValue(apiData.financialData?.totalCash) || 0;
  const netDebt = totalDebt - totalCash;

  projections.forEach((proj) => {
    const eps = proj.netIncome / proj.sharesOutstanding;
    const fcfPerShare = proj.fcf / proj.sharesOutstanding;
    const ebitdaPerShare = proj.ebit / proj.sharesOutstanding;
    const ebitPerShare = proj.ebit / proj.sharesOutstanding;
    const netDebtPerShare = netDebt / proj.sharesOutstanding;

    valuationResults[proj.year] = {
      per_ex_cash: eps * multiples.PER.target - netDebtPerShare,
      ev_fcf: fcfPerShare * multiples.EV_FCF.target,
      ev_ebitda: ebitdaPerShare * multiples.EV_EBITDA.target - netDebtPerShare,
      ev_ebit: ebitPerShare * multiples.EV_EBIT.target - netDebtPerShare,
    };
  });
  return valuationResults;
};

export const calculateCagr = (
  valuationResults: ValuationResults,
  currentPrice: number
) => {
  const finalYear = Object.keys(valuationResults).pop();
  if (!finalYear || !valuationResults[finalYear] || currentPrice <= 0) {
    return { per: 0, ev_fcf: 0, ev_ebitda: 0, ev_ebit: 0 };
  }
  const finalValues = valuationResults[finalYear];
  const finalAveragePrice =
    (finalValues.per_ex_cash +
      finalValues.ev_fcf +
      finalValues.ev_ebitda +
      finalValues.ev_ebit) /
    4;

  if (finalAveragePrice <= 0) {
    return { per: 0, ev_fcf: 0, ev_ebitda: 0, ev_ebit: 0 };
  }

  const cagr = (Math.pow(finalAveragePrice / currentPrice, 1 / 5) - 1) * 100;
  return { per: cagr, ev_fcf: cagr, ev_ebitda: cagr, ev_ebit: cagr };
};

export const calculateMarginOfSafety = (
  valuationResults: ValuationResults,
  currentPrice: number
): number => {
  const firstYear = Object.keys(valuationResults)[0];
  if (!firstYear || !valuationResults[firstYear] || currentPrice <= 0) {
    return 0;
  }
  const firstYearValues = valuationResults[firstYear];
  const firstYearAveragePrice =
    (firstYearValues.per_ex_cash +
      firstYearValues.ev_fcf +
      firstYearValues.ev_ebitda +
      firstYearValues.ev_ebit) /
    4;
  if (firstYearAveragePrice === 0) return 0;
  const margin =
    ((firstYearAveragePrice - currentPrice) / firstYearAveragePrice) * 100;
  return parseFloat(margin.toFixed(2));
};
