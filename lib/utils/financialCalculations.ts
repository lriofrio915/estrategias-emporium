import {
  CompanyData,
  AdvancedAnalysisData,
  FundamentalScores,
  RiskScores,
  HistoricalDataPoint,
  MonthlyPrice,
  DcfValuationResult,
} from "@/types/stock-scanner";

// --- Constants from Python Scripts ---
const SECTOR_RANGES: { [key: string]: { min: number; max: number } } = {
  Technology: { min: 5, max: 92.33 },
  Healthcare: { min: 4, max: 64.82 },
  "Financial Services": { min: 3, max: 58.37 },
  "Consumer Cyclical": { min: 2, max: 41.64 },
  Industrials: { min: 3, max: 32.48 },
  Energy: { min: 5, max: 29.37 },
  Utilities: { min: 6, max: 20.78 },
  "Communication Services": { min: 3, max: 63.66 },
  "Basic Materials": { min: 3, max: 33.71 },
  "Real Estate": { min: 5, max: 54.48 },
  "Consumer Defensive": { min: 3, max: 31.22 },
  Other: { min: 3, max: 20 },
};

const Z_ALTMAN_RANGES = {
  "Distress Zone": { min: -20, max: 1.8 },
  "Grey Zone": { min: 1.81, max: 2.99 },
  "Safe Zone": { min: 3.0, max: 20 },
};

// --- Helper Functions ---
const getRating = (average_score: number): string => {
  if (average_score >= 80) return "⭐️⭐️⭐️⭐️⭐️ Excelente";
  if (average_score >= 65) return "⭐️⭐️⭐️⭐️ Bueno";
  if (average_score >= 50) return "⭐️⭐️⭐️ Regular";
  if (average_score >= 35) return "⭐️⭐️ Deficiente";
  return "⭐️ Muy deficiente";
};

const calculateCagr = (series: HistoricalDataPoint[]): number => {
  const clean_series = series
    .filter((s) => s.value !== null && s.value !== undefined)
    .sort((a, b) => a.year - b.year);
  if (clean_series.length < 2) return NaN;

  const initial = clean_series[0];
  const final = clean_series[clean_series.length - 1];

  if (initial.value <= 0) return NaN;
  const n_years = final.year - initial.year;
  if (n_years <= 0) return NaN;

  return ((final.value / initial.value) ** (1 / n_years) - 1) * 100;
};

// --- Fundamental Analysis Calculations ---
export const calculateFundamentalScores = (
  companyData: CompanyData,
  advancedData: AdvancedAnalysisData
): FundamentalScores => {
  // 1. Revenue Score
  const revenueHistory = advancedData.annualRevenue.sort(
    (a, b) => a.year - b.year
  );
  const revenueCagr = calculateCagr(revenueHistory);
  let cagrScore = 0;
  if (revenueCagr > 0) {
    if (revenueCagr <= 10) cagrScore = revenueCagr * 5;
    else if (revenueCagr <= 30) cagrScore = 50 + (revenueCagr - 10) * 2;
    else cagrScore = Math.min(90 + (revenueCagr - 30) * 0.5, 100);
  }
  const growthYears = revenueHistory.filter(
    (v, i, a) => i > 0 && v.value > a[i - 1].value
  ).length;
  const growthYearsScore =
    revenueHistory.length > 1
      ? (growthYears / (revenueHistory.length - 1)) * 100
      : 0;
  const revenueScore = (cagrScore + growthYearsScore) / 2;

  // 2. EPS Score
  const epsHistory = advancedData.annualEps.sort((a, b) => a.year - b.year);
  const epsValues = epsHistory.map((e) => e.value);
  const epsCagr = calculateCagr(epsHistory);
  const epsCagrScore = isNaN(epsCagr)
    ? 0
    : Math.min(Math.max(0, (epsCagr / 25) * 100), 100);
  const positiveYearsRatio =
    epsValues.filter((v) => v > 0).length / epsValues.length;
  const positiveYearsScore = positiveYearsRatio * 100;
  const epsScore = (epsCagrScore + positiveYearsScore) / 2;

  // 3. EV/EBITDA Score
  const evEbitda = companyData.keyMetrics.evToEbitda;
  const sector = companyData.profile.sector;
  let evEbitdaScore: number | null = null;
  if (evEbitda > 0) {
    const sectorRange = SECTOR_RANGES[sector] || SECTOR_RANGES["Other"];
    const { min, max } = sectorRange;
    if (evEbitda < min) evEbitdaScore = 100;
    else if (evEbitda > max) evEbitdaScore = 1;
    else {
      evEbitdaScore =
        100 *
        (1 -
          (Math.log(evEbitda) - Math.log(min)) /
            (Math.log(max) - Math.log(min)));
    }
  }

  // 4. Z-Score
  const z = advancedData.zScoreComponents;
  let zScore: number | null = null;
  if (z.totalAssets > 0) {
    const workingCapital = z.currentAssets - z.currentLiabilities;
    const A = workingCapital / z.totalAssets;
    const B = z.retainedEarnings / z.totalAssets;
    const C = z.ebit / z.totalAssets;
    const D = z.totalLiabilities > 0 ? z.marketCap / z.totalLiabilities : 0;
    const E = z.sales / z.totalAssets;
    const zValue = 1.2 * A + 1.4 * B + 3.3 * C + 0.6 * D + 1.0 * E;

    if (zValue < Z_ALTMAN_RANGES["Distress Zone"].max) {
      const { min, max } = Z_ALTMAN_RANGES["Distress Zone"];
      zScore = 1 + (32 * (zValue - min)) / (max - min);
    } else if (zValue < Z_ALTMAN_RANGES["Grey Zone"].max) {
      const { min, max } = Z_ALTMAN_RANGES["Grey Zone"];
      zScore = 34 + (32 * (zValue - min)) / (max - min);
    } else {
      const { min, max } = Z_ALTMAN_RANGES["Safe Zone"];
      zScore = 67 + (33 * (zValue - min)) / (max - min);
    }
    zScore = Math.max(1, Math.min(100, zScore));
  }

  // 5. Overall Score
  const validScores = [revenueScore, epsScore, evEbitdaScore, zScore].filter(
    (s) => s !== null && !isNaN(s)
  ) as number[];
  const overallScore =
    validScores.length > 0
      ? validScores.reduce((a, b) => a + b, 0) / validScores.length
      : 0;

  return {
    revenueScore,
    epsScore,
    evEbitdaScore,
    zScore,
    overallScore,
    rating: getRating(overallScore),
  };
};

// --- Risk Analysis Calculations ---

/**
 * Calculates a score (1-100) based on similarity to a reference value,
 * mimicking the provided Python script's logic `calcular_calificacion`.
 * A value identical to the reference gets a score of 100.
 */
const calculateSimilarityScore = (value: number, reference: number): number => {
  if (isNaN(value) || isNaN(reference)) {
    return 1;
  }
  if (reference === 0) {
    return value === 0 ? 100 : 1;
  }
  if (value === 0) {
    return 1;
  }

  const ratio = value / reference;
  const invRatio = reference / value;

  const similarityRatio = Math.min(ratio, invRatio);

  return Math.max(1, Math.min(100, Math.round(100 * similarityRatio)));
};

const calculateMonthlyReturns = (prices: MonthlyPrice[]): number[] => {
  if (!Array.isArray(prices) || prices.length < 2) return [];

  const returns: number[] = [];
  const sortedPrices = prices
    .filter(
      (p) =>
        p &&
        typeof p.date === "string" &&
        typeof p.close === "number" &&
        isFinite(p.close)
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sortedPrices.length < 2) return [];

  for (let i = 1; i < sortedPrices.length; i++) {
    const prevPrice = sortedPrices[i - 1].close;
    const currPrice = sortedPrices[i].close;
    if (prevPrice > 0) {
      returns.push(((currPrice - prevPrice) / prevPrice) * 100);
    }
  }
  return returns;
};

const calculateStdDev = (returns: number[]): number => {
  if (returns.length === 0) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance);
};

const calculateBeta = (
  assetReturns: number[],
  marketReturns: number[]
): number => {
  const n = Math.min(assetReturns.length, marketReturns.length);
  if (n < 2) return 1.0;

  const y_asset = assetReturns.slice(-n);
  const x_market = marketReturns.slice(-n);

  const sumY = y_asset.reduce((a, b) => a + b, 0);
  const sumX = x_market.reduce((a, b) => a + b, 0);
  const meanY = sumY / n;
  const meanX = sumX / n;

  let covariance = 0;
  let varianceX = 0;

  for (let i = 0; i < n; i++) {
    covariance += (x_market[i] - meanX) * (y_asset[i] - meanY);
    varianceX += (x_market[i] - meanX) ** 2;
  }

  return varianceX === 0 ? 1.0 : covariance / varianceX;
};

const calculateMaxDrawdown = (prices: MonthlyPrice[]): number => {
  if (!Array.isArray(prices) || prices.length === 0) return 0;

  const annualReturns: number[] = [];
  const sortedPrices = prices
    .filter(
      (p) =>
        p &&
        typeof p.date === "string" &&
        typeof p.close === "number" &&
        isFinite(p.close)
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sortedPrices.length === 0) return 0;

  const groupedByYear = sortedPrices.reduce((acc, price) => {
    const year = new Date(price.date).getUTCFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(price.close);
    return acc;
  }, {} as Record<number, number[]>);

  for (const yearStr in groupedByYear) {
    const yearPrices = groupedByYear[parseInt(yearStr, 10)];
    if (yearPrices && yearPrices.length > 0) {
      const startPrice = yearPrices[0];
      const endPrice = yearPrices[yearPrices.length - 1];
      if (startPrice > 0) {
        annualReturns.push(((endPrice - startPrice) / startPrice) * 100);
      }
    }
  }

  const drawdowns = annualReturns.filter((r) => r < 0);
  return drawdowns.length > 0 ? Math.min(...drawdowns) : 0;
};

export const calculateRiskScores = (
  advancedData: AdvancedAnalysisData
): RiskScores => {
  const MIN_MONTHS_REQUIRED = 3; // Lowered to handle newer stocks

  // Add strict checks for sufficient data
  if (
    !advancedData ||
    !Array.isArray(advancedData.tickerPrices) ||
    !Array.isArray(advancedData.spyPrices) ||
    advancedData.tickerPrices.length < MIN_MONTHS_REQUIRED ||
    advancedData.spyPrices.length < MIN_MONTHS_REQUIRED
  ) {
    throw new Error(
      `Datos de precios históricos insuficientes (se requieren al menos ${MIN_MONTHS_REQUIRED} meses) para el análisis de riesgo.`
    );
  }

  const tickerReturns = calculateMonthlyReturns(advancedData.tickerPrices);
  const spyReturns = calculateMonthlyReturns(advancedData.spyPrices);

  // Also check the returns length, just in case
  if (
    tickerReturns.length < MIN_MONTHS_REQUIRED - 1 ||
    spyReturns.length < MIN_MONTHS_REQUIRED - 1
  ) {
    throw new Error(
      `No se pudieron calcular suficientes retornos mensuales (se requieren al menos ${
        MIN_MONTHS_REQUIRED - 1
      }) para el análisis de riesgo.`
    );
  }

  const tickerStdDev = calculateStdDev(tickerReturns);
  const spyStdDev = calculateStdDev(spyReturns);
  const stdDevScore = calculateSimilarityScore(tickerStdDev, spyStdDev);

  const beta = calculateBeta(tickerReturns, spyReturns);
  const betaScore = calculateSimilarityScore(beta, 1.0);

  const tickerMaxDrawdown = calculateMaxDrawdown(advancedData.tickerPrices);
  const spyMaxDrawdown = calculateMaxDrawdown(advancedData.spyPrices);
  const maxDrawdownScore = calculateSimilarityScore(
    Math.abs(tickerMaxDrawdown),
    Math.abs(spyMaxDrawdown)
  );

  const overallScore = (stdDevScore + betaScore + maxDrawdownScore) / 3;

  return {
    stdDev: { value: tickerStdDev, score: stdDevScore },
    beta: { value: beta, score: betaScore },
    maxDrawdown: { value: tickerMaxDrawdown, score: maxDrawdownScore },
    overallScore: overallScore,
    monthsOfData: advancedData.tickerPrices.length,
  };
};

// --- DCF Valuation Calculations ---
const calculateFcfGrowthRate = (fcfHistory: HistoricalDataPoint[]): number => {
  const cleanFcf = fcfHistory
    .filter((item) => item.value > 0)
    .sort((a, b) => a.year - b.year);
  if (cleanFcf.length < 2) {
    // Not enough data for CAGR, return a conservative default
    return 5.0;
  }

  const start = cleanFcf[0];
  const end = cleanFcf[cleanFcf.length - 1];
  const years = end.year - start.year;

  if (years <= 0 || start.value <= 0) {
    return 5.0; // Return default if years is 0 or start value is non-positive
  }

  const cagr = ((end.value / start.value) ** (1 / years) - 1) * 100;

  // Clamp the growth rate to a reasonable range to avoid extreme projections
  return Math.max(0, Math.min(cagr, 15.0));
};

export const calculateDcfValuation = (
  advancedData: AdvancedAnalysisData,
  currentPrice: number,
  companyData: CompanyData
): DcfValuationResult => {
  const {
    historicalFcf,
    sharesOutstanding,
    totalDebt,
    cashAndCashEquivalents,
  } = advancedData;

  if (!historicalFcf || historicalFcf.length === 0) {
    throw new Error(
      "No se encontraron datos históricos de Flujo de Caja Libre para realizar la valoración."
    );
  }
  if (sharesOutstanding <= 0) {
    throw new Error(
      "Faltan datos clave (Acciones en Circulación) para la valoración DCF."
    );
  }

  // --- Standardized WACC Calculation ---
  // Using a standardized WACC per sector to ensure deterministic results and avoid
  // variability from live market data (like beta or market cap) for this valuation model.
  const SECTOR_WACC_MAP: { [key: string]: number } = {
    // Primary Names
    Technology: 9.5,
    Healthcare: 7.5,
    "Financial Services": 8.0,
    "Consumer Cyclical": 9.0,
    Industrials: 8.5,
    Energy: 10.0,
    Utilities: 6.5,
    "Communication Services": 8.8,
    "Basic Materials": 9.2,
    "Real Estate": 7.8,
    "Consumer Defensive": 7.0,
    // Aliases
    "Information Technology": 9.5,
    "Health Care": 7.5,
    Financials: 8.0,
    "Consumer Discretionary": 9.0,
    Materials: 9.2,
    "Consumer Staples": 7.0,
    // Default
    Other: 8.5,
  };

  const sector = companyData.profile.sector;
  // Get WACC from map, or use default if sector is not found
  const wacc = SECTOR_WACC_MAP[sector] || SECTOR_WACC_MAP["Other"];

  const sortedFcf = [...historicalFcf].sort((a, b) => b.year - a.year);
  const latestFcf = sortedFcf[0].value;

  if (latestFcf <= 0) {
    throw new Error(
      "El Flujo de Caja Libre más reciente es negativo, no se puede realizar una valoración DCF estándar."
    );
  }

  const initialGrowthRate = calculateFcfGrowthRate(historicalFcf);
  const perpetualGrowthRate = 2.5; // Long-term GDP/inflation growth proxy

  if (wacc <= perpetualGrowthRate) {
    throw new Error(
      `La tasa de descuento (WACC ${wacc.toFixed(
        2
      )}%) no puede ser menor o igual a la tasa de crecimiento a perpetuidad (${perpetualGrowthRate}%).`
    );
  }

  const discountRate = wacc / 100;
  const terminalGrowthRate = perpetualGrowthRate / 100;

  const projections: { year: number; fcf: number; pvOfFcf: number }[] = [];
  let enterpriseValue = 0;
  let lastProjectedFcf = latestFcf;

  // Project FCF for 10 years
  for (let i = 1; i <= 10; i++) {
    let currentGrowthRate: number;
    // Years 1-5: Use initial growth rate
    if (i <= 5) {
      currentGrowthRate = initialGrowthRate / 100;
    }
    // Years 6-10: Taper growth rate down to perpetual rate
    else {
      const taperFactor = (10 - i) / 5;
      currentGrowthRate =
        terminalGrowthRate +
        (initialGrowthRate / 100 - terminalGrowthRate) * taperFactor;
    }

    const projectedFcf = lastProjectedFcf * (1 + currentGrowthRate);
    const pvOfFcf = projectedFcf / (1 + discountRate) ** i;

    projections.push({ year: i, fcf: projectedFcf, pvOfFcf });
    enterpriseValue += pvOfFcf;
    lastProjectedFcf = projectedFcf;
  }

  // Calculate Terminal Value
  const terminalValue =
    (lastProjectedFcf * (1 + terminalGrowthRate)) /
    (discountRate - terminalGrowthRate);
  const pvOfTerminalValue = terminalValue / (1 + discountRate) ** 10;
  enterpriseValue += pvOfTerminalValue;

  // Calculate Equity Value and Fair Value per Share
  const equityValue = enterpriseValue - totalDebt + cashAndCashEquivalents;
  const fairValue = equityValue / sharesOutstanding;

  if (isNaN(fairValue) || !isFinite(fairValue)) {
    throw new Error(
      "El cálculo resultó en un valor no válido. Verifica los datos de entrada (deuda, efectivo, acciones)."
    );
  }

  const upsidePercentage = ((fairValue - currentPrice) / currentPrice) * 100;

  return {
    fairValue,
    upsidePercentage,
    assumptions: {
      wacc,
      initialGrowthRate,
      perpetualGrowthRate,
      latestFcf,
    },
    projections,
    terminalValue,
    pvOfTerminalValue,
  };
};
