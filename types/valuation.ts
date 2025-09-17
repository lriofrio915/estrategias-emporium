// types/valuation.ts

import {
  ApiAssetItem,
  RawYahooFinanceIncomeStatementItem,
  RawYahooFinanceBalanceSheetItem,
} from "./api";

// (Interfaces no cambian)
export interface ProjectionsData {
  salesGrowth: number | string;
  ebitMargin: number | string;
  taxRate: number | string;
  sharesIncrease: number | string;
}

export interface MultiplesData {
  PER: { ltm: number | string; target: number };
  EV_EBITDA: { ltm: number | string; target: number };
  EV_EBIT: { ltm: number | string; target: number };
  EV_FCF: { ltm: number | string; target: number };
}

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

export interface ValuationDashboardData {
  projectionsData: ProjectionsData | null;
  multiplesData: MultiplesData | null;
  currentPrice: number | null;
  valuationResults: { [key: string]: ValuationResult };
  marginOfSafety: number | string;
  cagrResults: CagrResult;
}

const getRawValueHelper = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "object" && "raw" in value) {
    return value.raw;
  }
  return typeof value === "number" ? value : null;
};

const calculateAverageSalesGrowth = (
  history: RawYahooFinanceIncomeStatementItem[]
): number | string => {
  if (!history || history.length < 2) return "N/A";
  const growthRates: number[] = [];
  // Comparamos el dato TTM (índice 0) con el del año fiscal anterior (índice 1)
  const currentRevenue = getRawValueHelper(history[0]?.totalRevenue);
  const previousRevenue = getRawValueHelper(history[1]?.totalRevenue);
  if (currentRevenue && previousRevenue && previousRevenue !== 0) {
    const growth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    return parseFloat(growth.toFixed(2));
  }
  return "N/A";
};

const calculateAverageTaxRate = (
  history: RawYahooFinanceIncomeStatementItem[]
): number | string => {
  if (!history || history.length === 0) return "N/A";
  const rates: number[] = [];
  for (const item of history) {
    const tax = getRawValueHelper(item.incomeTaxExpense);
    const netIncome = getRawValueHelper(item.netIncome);
    if (tax !== null && netIncome !== null && netIncome + tax !== 0) {
      const preTaxIncome = netIncome + tax;
      if (preTaxIncome > 0) {
        rates.push((tax / preTaxIncome) * 100);
      }
    }
  }
  if (rates.length === 0) return "N/A";
  const averageRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  return parseFloat(averageRate.toFixed(2));
};

const calculateLastSharesIncrease = (
  incomeHistory: RawYahooFinanceIncomeStatementItem[],
  balanceHistory: RawYahooFinanceBalanceSheetItem[],
  defaultKeyStatistics: ApiAssetItem["data"]["defaultKeyStatistics"]
): number | string => {
  // Comparamos TTM (índice 0) vs el año anterior (índice 1)
  const currentShares =
    getRawValueHelper(incomeHistory[0]?.basicAverageShares) ||
    getRawValueHelper(incomeHistory[0]?.dilutedAverageShares) ||
    getRawValueHelper(balanceHistory[0]?.shareIssued) ||
    getRawValueHelper(defaultKeyStatistics?.sharesOutstanding);

  const previousShares =
    getRawValueHelper(incomeHistory[1]?.basicAverageShares) ||
    getRawValueHelper(incomeHistory[1]?.dilutedAverageShares) ||
    getRawValueHelper(balanceHistory[1]?.shareIssued);

  if (currentShares && previousShares && previousShares !== 0) {
    const increase = ((currentShares - previousShares) / previousShares) * 100;
    return parseFloat(increase.toFixed(2));
  }
  return "N/A";
};

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
    balanceSheetHistory,
  } = data;

  const getRawValue = (value: any): number | string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object" && "raw" in value) {
      return value.raw;
    }
    return typeof value === "number" ? value : "N/A";
  };
  const getMostRecentValue = (history: any[] | undefined, key: string) => {
    const statements =
      history?.[0]?.incomeStatementHistory ||
      history?.[0]?.cashflowStatements ||
      history ||
      [];
    if (!Array.isArray(statements) || statements.length === 0) return "N/A";
    return getRawValue(statements[0][key]);
  };

  const currentPrice =
    typeof getRawValue(price?.regularMarketPrice) === "number"
      ? (getRawValue(price?.regularMarketPrice) as number)
      : null;
  const enterpriseValue = getRawValue(defaultKeyStatistics?.enterpriseValue);
  const trailingEps = getRawValue(defaultKeyStatistics?.trailingEps);
  const ltmEbitda = getRawValue(financialData?.ebitda);
  let ltmFcf = getRawValue(financialData?.freeCashflow);
  if (ltmFcf === "N/A" || ltmFcf === 0) {
    ltmFcf = getMostRecentValue(
      cashflowStatementHistory?.cashflowStatements,
      "freeCashFlow"
    );
  }
  let ltmEbit = getMostRecentValue(
    incomeStatementHistory?.incomeStatementHistory,
    "ebit"
  );
  if (ltmEbit === 0 || ltmEbit === "N/A") {
    const totalRevenue = getRawValue(financialData?.totalRevenue);
    const operatingMargins = getRawValue(financialData?.operatingMargins);
    if (
      typeof totalRevenue === "number" &&
      typeof operatingMargins === "number"
    ) {
      ltmEbit = totalRevenue * operatingMargins;
    }
  }
  let calculatedTrailingPE: number | string = "N/A";
  if (
    typeof currentPrice === "number" &&
    typeof trailingEps === "number" &&
    trailingEps > 0
  ) {
    calculatedTrailingPE = currentPrice / trailingEps;
  } else {
    const preCalculatedPE = getRawValue(defaultKeyStatistics?.trailingPE);
    if (typeof preCalculatedPE === "number" && preCalculatedPE > 0) {
      calculatedTrailingPE = preCalculatedPE;
    }
  }
  const multiplesData: MultiplesData = {
    PER: { ltm: calculatedTrailingPE, target: 0.0 },
    EV_EBITDA: {
      ltm:
        typeof enterpriseValue === "number" &&
        typeof ltmEbitda === "number" &&
        ltmEbitda !== 0
          ? enterpriseValue / ltmEbitda
          : "N/A",
      target: 0.0,
    },
    EV_EBIT: {
      ltm:
        typeof enterpriseValue === "number" &&
        typeof ltmEbit === "number" &&
        ltmEbit !== 0
          ? enterpriseValue / ltmEbit
          : "N/A",
      target: 0.0,
    },
    EV_FCF: {
      ltm:
        typeof enterpriseValue === "number" &&
        typeof ltmFcf === "number" &&
        ltmFcf !== 0
          ? enterpriseValue / ltmFcf
          : "N/A",
      target: 0.0,
    },
  };
  const operatingMargins = getRawValue(financialData?.operatingMargins);
  const projectionsData: ProjectionsData = {
    salesGrowth: calculateAverageSalesGrowth(
      incomeStatementHistory?.incomeStatements || []
    ),
    ebitMargin:
      typeof operatingMargins === "number"
        ? parseFloat((operatingMargins * 100).toFixed(2))
        : "N/A",
    taxRate: calculateAverageTaxRate(
      incomeStatementHistory?.incomeStatements || []
    ),
    sharesIncrease: calculateLastSharesIncrease(
      incomeStatementHistory?.incomeStatements || [],
      balanceSheetHistory?.balanceSheetStatements || [],
      defaultKeyStatistics
    ),
  };

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
