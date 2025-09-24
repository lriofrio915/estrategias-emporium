// app/actions/valuationActions.ts
"use server";

import { ValuationMetrics, ValuationResults } from "@/types/valuation";

interface KeyStatisticsData {
  metrics: {
    trailingPE?: number[];
    forwardPE?: number[];
    enterpriseValue?: number[];
    [key: string]: number[] | undefined;
  };
}

interface IncomeStatementData {
  metrics: {
    ebitda: number[];
    ebit: number[];
    totalRevenue: number[];
    pretaxIncome: number[];
    taxRateForCalcs: number[];
    basicAverageShares: number[];
    netIncome: number[];
  };
}

interface FreeCashFlowData {
  metrics: { freeCashFlow: number[] };
}

interface BalanceSheetData {
  metrics: {
    totalDebt: number[];
    cashAndCashEquivalents: number[];
    ordinarySharesNumber: number[];
    netDebt: number[];
  };
}

// --- TIPOS DE RESPUESTA ---
interface MultiplesResponseSuccess {
  success: true;
  data: ValuationMetrics;
}

interface MultiplesResponseError {
  success: false;
  error: string;
}

type MultiplesResponse = MultiplesResponseSuccess | MultiplesResponseError;

interface FinancialAverages {
  salesGrowth: string;
  ebitMargin: string;
  taxRate: string;
  sharesIncrease: string;
}

interface FinancialAveragesResponseSuccess {
  success: true;
  averages: FinancialAverages;
}

interface FinancialAveragesResponseError {
  success: false;
  error: string;
}

type FinancialAveragesResponse =
  | FinancialAveragesResponseSuccess
  | FinancialAveragesResponseError;

interface IntrinsicValueResponseSuccess {
  success: true;
  results: ValuationResults;
}

interface IntrinsicValueResponseError {
  success: false;
  error: string;
}

type IntrinsicValueResponse =
  | IntrinsicValueResponseSuccess
  | IntrinsicValueResponseError;

// --- INTERFACES PARA CÁLCULO DE VALOR INTRÍNSECO ---
interface IntrinsicValueParams {
  ticker: string;
  targets: {
    per: number;
    ev_ebitda: number;
    ev_ebit: number;
    ev_fcf: number;
  };
  estimates: {
    salesGrowth: number;
    ebitMargin: number;
    sharesIncrease: number;
  };
}

interface PriceCalculation {
  per: number;
  ev_fcf: number;
  ev_ebitda: number;
  ev_ebit: number;
}

// --- SERVER ACTION PARA OBTENER MÚLTIPLOS ---
export async function getValuationMultiples(
  ticker: string
): Promise<MultiplesResponse> {
  if (!ticker) {
    return { success: false, error: "Se requiere un ticker." };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const [
      keyStatisticsResponse,
      incomeStatementResponse,
      freeCashFlowResponse,
    ] = await Promise.all([
      fetch(`${baseUrl}/api/key-statistics?ticker=${ticker}`),
      fetch(`${baseUrl}/api/income-statement?ticker=${ticker}`),
      fetch(`${baseUrl}/api/free-cash-flow?ticker=${ticker}`),
    ]);

    if (
      !keyStatisticsResponse.ok ||
      !incomeStatementResponse.ok ||
      !freeCashFlowResponse.ok
    ) {
      throw new Error(
        "No se pudieron obtener todos los datos financieros de las APIs de scraping."
      );
    }

    const keyStatisticsData: KeyStatisticsData =
      await keyStatisticsResponse.json();
    const incomeStatementData: IncomeStatementData =
      await incomeStatementResponse.json();
    const freeCashFlowData: FreeCashFlowData =
      await freeCashFlowResponse.json();

    const trailingPE = (keyStatisticsData.metrics["trailingPE"] || [])[0] || 0;
    const enterpriseValue =
      (keyStatisticsData.metrics["enterpriseValue"] || [])[0] || 0;
    const ltmEBITDA = (incomeStatementData.metrics.ebitda || [])[0] || 0;
    const ltmEBIT = (incomeStatementData.metrics.ebit || [])[0] || 0;
    const ltmFCF = (freeCashFlowData.metrics.freeCashFlow || [])[0] || 0;
    const forwardPE = (keyStatisticsData.metrics["forwardPE"] || [])[0] || 0;

    // Corregir cálculos - verificar que los denominadores no sean cero
    const evEbitdaLtm = ltmEBITDA !== 0 ? enterpriseValue / ltmEBITDA : 0;
    const evEbitLtm = ltmEBIT !== 0 ? enterpriseValue / ltmEBIT : 0;
    const evFcfLtm = ltmFCF !== 0 ? enterpriseValue / ltmFCF : 0;

    const calculatedMetrics: ValuationMetrics = {
      per: { ltm: trailingPE, ntm: forwardPE, target: 20 },
      ev_ebitda: { ltm: evEbitdaLtm, ntm: "N/A", target: 16 },
      ev_ebit: { ltm: evEbitLtm, ntm: "N/A", target: 16 },
      ev_fcf: { ltm: evFcfLtm, ntm: "N/A", target: 20 },
    };

    return { success: true, data: calculatedMetrics };
  } catch (err) {
    const error = err as Error;
    console.error(
      "Error en Server Action getValuationMultiples:",
      error.message
    );
    return {
      success: false,
      error: `No se pudieron obtener los múltiplos de valoración: ${error.message}`,
    };
  }
}

// --- FUNCIONES DE CÁLCULO DE PROMEDIOS ---
const calculateAverageSalesGrowth = (revenues: number[]): string => {
  const fiscalYearRevenues = revenues.slice(1);

  if (fiscalYearRevenues.length < 2) {
    return "N/A";
  }

  const growthRates: number[] = [];
  for (let i = 0; i < fiscalYearRevenues.length - 1; i++) {
    const currentYearRevenue = fiscalYearRevenues[i];
    const previousYearRevenue = fiscalYearRevenues[i + 1];
    if (previousYearRevenue && previousYearRevenue !== 0) {
      const growth =
        ((currentYearRevenue - previousYearRevenue) / previousYearRevenue) *
        100;
      growthRates.push(growth);
    }
  }

  if (growthRates.length === 0) return "N/A";
  const averageGrowth =
    growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
  return `${averageGrowth.toFixed(2)}`;
};

const calculateAverageEbitMargin = (
  ebits: number[],
  revenues: number[]
): string => {
  const fiscalYearEbits = ebits.slice(1);
  const fiscalYearRevenues = revenues.slice(1);

  if (fiscalYearEbits.length === 0 || fiscalYearRevenues.length === 0) {
    return "N/A";
  }

  const ebitMargins: number[] = [];
  const relevantDataLength = Math.min(
    fiscalYearEbits.length,
    fiscalYearRevenues.length,
    4
  );

  for (let i = 0; i < relevantDataLength; i++) {
    const ebit = fiscalYearEbits[i];
    const revenue = fiscalYearRevenues[i];
    if (revenue && revenue !== 0) {
      const margin = (ebit / revenue) * 100;
      ebitMargins.push(margin);
    }
  }

  if (ebitMargins.length === 0) return "N/A";
  const averageMargin =
    ebitMargins.reduce((sum, margin) => sum + margin, 0) / ebitMargins.length;
  return `${averageMargin.toFixed(2)}`;
};

const calculateAverageTaxRate = (
  taxProvisions: number[],
  pretaxIncomes: number[]
): string => {
  const fiscalYearTaxes = taxProvisions.slice(1);
  const fiscalYearIncomes = pretaxIncomes.slice(1);

  if (fiscalYearTaxes.length === 0 || fiscalYearIncomes.length === 0) {
    return "N/A";
  }

  const taxRates: number[] = [];
  const relevantDataLength = Math.min(
    fiscalYearTaxes.length,
    fiscalYearIncomes.length,
    4
  );

  for (let i = 0; i < relevantDataLength; i++) {
    const taxProvision = fiscalYearTaxes[i];
    const pretaxIncome = fiscalYearIncomes[i];
    if (pretaxIncome && pretaxIncome !== 0) {
      const rate = (taxProvision / pretaxIncome) * 100;
      if (isFinite(rate)) {
        taxRates.push(rate);
      }
    }
  }

  if (taxRates.length === 0) return "N/A";
  const averageRate =
    taxRates.reduce((sum, rate) => sum + rate, 0) / taxRates.length;
  return `${averageRate.toFixed(2)}`;
};

const calculateAverageSharesIncrease = (shares: number[]): string => {
  const fiscalYearShares = shares.slice(1);

  if (fiscalYearShares.length < 2) {
    return "N/A";
  }

  const sharesIncreases: number[] = [];
  for (let i = 0; i < fiscalYearShares.length - 1; i++) {
    const currentShares = fiscalYearShares[i];
    const previousShares = fiscalYearShares[i + 1];
    if (previousShares && previousShares !== 0) {
      const increase =
        ((currentShares - previousShares) / previousShares) * 100;
      sharesIncreases.push(increase);
    }
  }

  if (sharesIncreases.length === 0) return "N/A";
  const averageIncrease =
    sharesIncreases.reduce((sum, rate) => sum + rate, 0) /
    sharesIncreases.length;
  return `${averageIncrease.toFixed(2)}`;
};

// --- SERVER ACTION PARA CALCULAR PROMEDIOS FINANCIEROS ---
export async function getFinancialAverages(
  ticker: string
): Promise<FinancialAveragesResponse> {
  try {
    if (!ticker) {
      throw new Error("Se requiere un ticker.");
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/income-statement?ticker=${ticker}`
    );

    if (!response.ok) {
      throw new Error(
        "No se pudieron obtener los datos del estado de resultados."
      );
    }

    const incomeData: IncomeStatementData = await response.json();

    const salesGrowth = calculateAverageSalesGrowth(
      incomeData.metrics.totalRevenue
    );
    const ebitMargin = calculateAverageEbitMargin(
      incomeData.metrics.ebit,
      incomeData.metrics.totalRevenue
    );
    const taxRate = calculateAverageTaxRate(
      incomeData.metrics.taxRateForCalcs,
      incomeData.metrics.pretaxIncome
    );
    const sharesIncrease = calculateAverageSharesIncrease(
      incomeData.metrics.basicAverageShares
    );

    const averages: FinancialAverages = {
      salesGrowth,
      ebitMargin,
      taxRate,
      sharesIncrease,
    };

    return { success: true, averages };
  } catch (err) {
    const error = err as Error;
    console.error(
      "Error en Server Action getFinancialAverages:",
      error.message
    );
    return { success: false, error: error.message };
  }
}

// --- SERVER ACTION PARA CALCULAR VALOR INTRÍNSECO ---
export async function calculateIntrinsicValue(
  params: IntrinsicValueParams
): Promise<IntrinsicValueResponse> {
  try {
    console.log("Calculando valor intrínseco con:", params);

    if (!params.ticker) {
      throw new Error("El ticker es requerido");
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const [keyStatsRes, incomeStatementRes, freeCashFlowRes, balanceSheetRes] =
      await Promise.all([
        fetch(`${baseUrl}/api/key-statistics?ticker=${params.ticker}`),
        fetch(`${baseUrl}/api/income-statement?ticker=${params.ticker}`),
        fetch(`${baseUrl}/api/free-cash-flow?ticker=${params.ticker}`),
        fetch(`${baseUrl}/api/balance-sheet?ticker=${params.ticker}`),
      ]);

    if (
      !keyStatsRes.ok ||
      !incomeStatementRes.ok ||
      !freeCashFlowRes.ok ||
      !balanceSheetRes.ok
    ) {
      throw new Error(
        "No se pudieron obtener todos los datos financieros base."
      );
    }

    const incomeStatementData: IncomeStatementData =
      await incomeStatementRes.json();
    const freeCashFlowData: FreeCashFlowData = await freeCashFlowRes.json();
    const balanceSheetData: BalanceSheetData = await balanceSheetRes.json();

    const ltmNetIncome = (incomeStatementData.metrics.netIncome || [])[0] || 0;
    const ltmRevenue = (incomeStatementData.metrics.totalRevenue || [])[0] || 0;
    const ltmEBITDA = (incomeStatementData.metrics.ebitda || [])[0] || 0;
    const ltmEBIT = (incomeStatementData.metrics.ebit || [])[0] || 0;
    const ltmFCF = (freeCashFlowData.metrics.freeCashFlow || [])[0] || 0;
    const sharesOutstanding =
      (balanceSheetData.metrics.ordinarySharesNumber || [])[0] || 1;
    const ltmNetDebt = (balanceSheetData.metrics.netDebt || [])[0] || 0;
    const ltmEPS = sharesOutstanding > 0 ? ltmNetIncome / sharesOutstanding : 0;

    const projectedRevenue2026 =
      ltmRevenue * (1 + params.estimates.salesGrowth / 100);
    const projectedEBIT2026 =
      projectedRevenue2026 * (params.estimates.ebitMargin / 100);

    const ebitdaToEbitRatio = ltmEBIT > 0 ? ltmEBITDA / ltmEBIT : 1.1;
    const fcfToEbitRatio = ltmEBIT > 0 ? ltmFCF / ltmEBIT : 0.8;

    const projectedEBITDA2026 = projectedEBIT2026 * ebitdaToEbitRatio;
    const projectedFCF2026 = projectedEBIT2026 * fcfToEbitRatio;
    const projectedShares2026 =
      sharesOutstanding * (1 + params.estimates.sharesIncrease / 100);
    const projectedEPS2026 =
      projectedShares2026 > 0
        ? (projectedEBIT2026 * (ltmEBIT > 0 ? ltmNetIncome / ltmEBIT : 0.7)) /
          projectedShares2026
        : 0;

    const zeroYear: PriceCalculation = {
      per: 0,
      ev_fcf: 0,
      ev_ebitda: 0,
      ev_ebit: 0,
    };

    const price2025e: PriceCalculation = {
      per: params.targets.per * ltmEPS,
      ev_ebitda:
        sharesOutstanding > 0
          ? (params.targets.ev_ebitda * ltmEBITDA - ltmNetDebt) /
            sharesOutstanding
          : 0,
      ev_ebit:
        sharesOutstanding > 0
          ? (params.targets.ev_ebit * ltmEBIT - ltmNetDebt) / sharesOutstanding
          : 0,
      ev_fcf:
        sharesOutstanding > 0
          ? (params.targets.ev_fcf * ltmFCF - ltmNetDebt) / sharesOutstanding
          : 0,
    };

    const price2026e: PriceCalculation = {
      per: params.targets.per * projectedEPS2026,
      ev_ebitda:
        projectedShares2026 > 0
          ? (params.targets.ev_ebitda * projectedEBITDA2026 - ltmNetDebt) /
            projectedShares2026
          : 0,
      ev_ebit:
        projectedShares2026 > 0
          ? (params.targets.ev_ebit * projectedEBIT2026 - ltmNetDebt) /
            projectedShares2026
          : 0,
      ev_fcf:
        projectedShares2026 > 0
          ? (params.targets.ev_fcf * projectedFCF2026 - ltmNetDebt) /
            projectedShares2026
          : 0,
    };

    // Construir el objeto de resultados SIN la columna "ntm"
    const results: ValuationResults = {
      "2022e": zeroYear,
      "2023e": zeroYear,
      "2024e": zeroYear,
      "2025e": price2025e,
      "2026e": price2026e,
      // La propiedad "ntm" ha sido eliminada.
    };

    return { success: true, results };
  } catch (err) {
    const error = err as Error;
    console.error(
      "Error en Server Action calculateIntrinsicValue:",
      error.message
    );
    return {
      success: false,
      error: `Error al calcular el valor intrínseco: ${error.message}`,
    };
  }
}
