import { QuoteSummaryResult, YahooFinanceRawValue } from "@/types/api";
import { AssetData } from "@/types/valuation";

// --- Funciones de Ayuda Internas (No exportadas) ---

const getRawValue = (
  value: number | YahooFinanceRawValue | undefined | null
): number => {
  if (typeof value === "object" && value !== null && "raw" in value) {
    return typeof value.raw === "number" ? value.raw : 0;
  }
  return typeof value === "number" ? value : 0;
};

const calculateAverageGrowth = (values: number[]): number => {
  if (values.length < 2) return 0;
  const growthRates: number[] = [];
  const reversedValues = [...values].reverse();

  for (let i = 1; i < reversedValues.length; i++) {
    const previous = reversedValues[i - 1];
    const current = reversedValues[i];
    if (previous !== 0) {
      growthRates.push((current - previous) / Math.abs(previous));
    }
  }
  if (growthRates.length === 0) return 0;
  return (growthRates.reduce((a, b) => a + b, 0) / growthRates.length) * 100;
};

// --- Tipo de Retorno Personalizado ---
type ProcessedValuationData = AssetData & {
  averages: { salesGrowth: string; ebitMargin: string };
};

// --- Función Principal de Procesamiento (Exportada) ---

export const processValuationData = (
  apiData: QuoteSummaryResult,
  ticker: string
): ProcessedValuationData => {
  // --- 1. Extracción de Datos Base ---
  const currentPrice = getRawValue(apiData.price?.regularMarketPrice);
  const sharesOutstanding = getRawValue(
    apiData.defaultKeyStatistics?.sharesOutstanding
  );
  const totalCash = getRawValue(apiData.financialData?.totalCash);
  const enterpriseValue = getRawValue(
    apiData.defaultKeyStatistics?.enterpriseValue
  );
  const cashPerShare =
    sharesOutstanding > 0 ? totalCash / sharesOutstanding : 0;

  // --- 2. Extracción de Historial y Datos LTM ---
  const incomeHistory =
    apiData.incomeStatementHistory?.incomeStatementHistory ?? [];
  const latestIncomeStatement = incomeHistory[0];

  const trailingEps = getRawValue(apiData.defaultKeyStatistics?.trailingEps);
  const ltmEbitda = getRawValue(latestIncomeStatement?.ebitda);
  const ltmEbit = getRawValue(latestIncomeStatement?.ebit);
  const financialHistory = apiData.financialHistory ?? [];
  const ltmFcf =
    financialHistory.find((item) => item.year === "TTM")?.freeCashFlow ?? 0;

  const ltmFcfPerShare = sharesOutstanding > 0 ? ltmFcf / sharesOutstanding : 0;
  const ltmEbitdaPerShare =
    sharesOutstanding > 0 ? ltmEbitda / sharesOutstanding : 0;
  const ltmEbitPerShare =
    sharesOutstanding > 0 ? ltmEbit / sharesOutstanding : 0;

  // --- 3. Cálculo de Promedios ---
  const historicalRevenues = incomeHistory.map((s) =>
    getRawValue(s.totalRevenue)
  );
  const historicalEbits = incomeHistory.map((s) => getRawValue(s.ebit));

  const averageSalesGrowth = calculateAverageGrowth(historicalRevenues);
  const averageEbitMargin =
    historicalRevenues.reduce((a, b) => a + b, 0) !== 0
      ? (historicalEbits.reduce((a, b) => a + b, 0) /
          historicalRevenues.reduce((a, b) => a + b, 0)) *
        100
      : 0;

  // --- 4. Proyecciones y Múltiplos Objetivo ---
  const growthRate = averageSalesGrowth / 100;
  const targets = { per: 20, ev_fcf: 20, ev_ebitda: 16, ev_ebit: 16 };

  const projectedMetrics = {
    "2025e": {
      eps: trailingEps * (1 + growthRate),
      fcfPerShare: ltmFcfPerShare * (1 + growthRate),
      ebitdaPerShare: ltmEbitdaPerShare * (1 + growthRate),
      ebitPerShare: ltmEbitPerShare * (1 + growthRate),
    },
    "2026e": {
      eps: trailingEps * Math.pow(1 + growthRate, 2),
      fcfPerShare: ltmFcfPerShare * Math.pow(1 + growthRate, 2),
      ebitdaPerShare: ltmEbitdaPerShare * Math.pow(1 + growthRate, 2),
      ebitPerShare: ltmEbitPerShare * Math.pow(1 + growthRate, 2),
    },
  };

  // --- 5. Cálculo de Valores Intrínsecos ---
  const valuationResults: AssetData["valuationResults"] = {
    "2022e": { per: 0, ev_fcf: 0, ev_ebitda: 0, ev_ebit: 0 },
    "2023e": { per: 0, ev_fcf: 0, ev_ebitda: 0, ev_ebit: 0 },
    "2024e": { per: 0, ev_fcf: 0, ev_ebitda: 0, ev_ebit: 0 },
    "2025e": {
      per: projectedMetrics["2025e"].eps * targets.per + cashPerShare,
      ev_fcf: projectedMetrics["2025e"].fcfPerShare * targets.ev_fcf,
      ev_ebitda: projectedMetrics["2025e"].ebitdaPerShare * targets.ev_ebitda,
      ev_ebit: projectedMetrics["2025e"].ebitPerShare * targets.ev_ebit,
    },
    "2026e": {
      per: projectedMetrics["2026e"].eps * targets.per + cashPerShare,
      ev_fcf: projectedMetrics["2026e"].fcfPerShare * targets.ev_fcf,
      ev_ebitda: projectedMetrics["2026e"].ebitdaPerShare * targets.ev_ebitda,
      ev_ebit: projectedMetrics["2026e"].ebitPerShare * targets.ev_ebit,
    },
    // CORRECCIÓN: Añadimos la propiedad 'ntm' que faltaba
    ntm: {
      per: projectedMetrics["2025e"].eps * targets.per + cashPerShare,
      ev_fcf: projectedMetrics["2025e"].fcfPerShare * targets.ev_fcf,
      ev_ebitda: projectedMetrics["2025e"].ebitdaPerShare * targets.ev_ebitda,
      ev_ebit: projectedMetrics["2025e"].ebitPerShare * targets.ev_ebit,
    },
  };

  // --- 6. Cálculo Final de Margen de Seguridad y CAGR ---
  const avg2026 =
    Object.values(valuationResults["2026e"]).reduce((a, b) => a + b, 0) / 4;
  const marginOfSafety =
    currentPrice > 0 ? (avg2026 / currentPrice - 1) * 100 : 0;
  const cagr =
    currentPrice > 0 && avg2026 > 0
      ? (Math.pow(avg2026 / currentPrice, 1 / 2) - 1) * 100
      : 0;

  // --- 7. Ensamblaje del Objeto Final ---
  return {
    ticker,
    currentPrice,
    multiples: {
      per: {
        ltm: getRawValue(apiData.defaultKeyStatistics?.trailingPE),
        ntm: getRawValue(apiData.defaultKeyStatistics?.forwardPE),
        target: targets.per,
      },
      ev_fcf: {
        ltm:
          enterpriseValue && ltmFcf
            ? (enterpriseValue / ltmFcf).toFixed(2)
            : "N/A",
        ntm: "N/A",
        target: targets.ev_fcf,
      },
      ev_ebitda: {
        ltm:
          enterpriseValue && ltmEbitda
            ? (enterpriseValue / ltmEbitda).toFixed(2)
            : "N/A",
        ntm: "N/A",
        target: targets.ev_ebitda,
      },
      ev_ebit: {
        ltm:
          enterpriseValue && ltmEbit
            ? (enterpriseValue / ltmEbit).toFixed(2)
            : "N/A",
        ntm: "N/A",
        target: targets.ev_ebit,
      },
    },
    projections: {
      salesGrowth: `${averageSalesGrowth.toFixed(2)}%`,
      ebitMargin: `${averageEbitMargin.toFixed(2)}%`,
      taxRate: "21%",
      sharesIncrease: "0.05%",
    },
    valuationResults,
    marginOfSafety: marginOfSafety.toFixed(2),
    cagrResults: {
      per: cagr,
      ev_fcf: cagr,
      ev_ebitda: cagr,
      ev_ebit: cagr,
    },
    averages: {
      salesGrowth: `${averageSalesGrowth.toFixed(2)}%`,
      ebitMargin: `${averageEbitMargin.toFixed(2)}%`,
    },
  };
};