// lib/stock-scanner/mock-data.ts
import {
  CompanyData,
  AdvancedAnalysisData,
  FundamentalScores,
  RiskScores,
  DcfValuationResult,
} from "@/types/stock-scanner";

export const mockCompanyData: CompanyData = {
  profile: {
    name: "Apple Inc.",
    ticker: "AAPL",
    exchange: "NasdaqGS",
    sector: "Technology",
    industry: "Consumer Electronics",
    description:
      "Apple Inc. diseña, fabrica y comercializa smartphones, ordenadores personales, tabletas, wearables y accesorios en todo el mundo. También vende una variedad de servicios relacionados.",
  },
  keyMetrics: {
    currentPrice: 175.25,
    marketCap: 2750000000000,
    enterpriseValue: 2800000000000,
    dividendYield: 0.55, // Porcentaje
    peRatio: 28.5,
    evToEbitda: 22.1,
    eps: 6.15,
    beta: 1.2,
  },
  historicalPrices: [
    { date: "2023-01-01", close: 130.0 },
    { date: "2023-02-01", close: 145.5 },
    { date: "2023-03-01", close: 160.75 },
    { date: "2023-04-01", close: 165.2 },
    { date: "2023-05-01", close: 172.1 },
    { date: "2023-06-01", close: 180.9 },
    { date: "2023-07-01", close: 195.4 },
    { date: "2023-08-01", close: 188.3 },
    { date: "2023-09-01", close: 170.15 },
    { date: "2023-10-01", close: 175.25 },
    { date: "2023-11-01", close: 185.0 },
    { date: "2023-12-01", close: 192.5 },
  ],
  incomeStatement: {
    revenue: [
      { year: 2023, value: 383290000000 },
      { year: 2022, value: 394330000000 },
      { year: 2021, value: 365820000000 },
    ],
    netIncome: [
      { year: 2023, value: 96990000000 },
      { year: 2022, value: 99800000000 },
      { year: 2021, value: 94680000000 },
    ],
    ebitda: [
      // Dato añadido para los cálculos
      { year: 2023, value: 125820000000 },
      { year: 2022, value: 130540000000 },
      { year: 2021, value: 120230000000 },
    ],
  },
  balanceSheet: {
    totalAssets: [
      { year: 2023, value: 352580000000 },
      { year: 2022, value: 352760000000 },
    ],
    totalLiabilities: [
      { year: 2023, value: 290440000000 },
      { year: 2022, value: 302080000000 },
    ],
    totalEquity: [
      { year: 2023, value: 62140000000 },
      { year: 2022, value: 50680000000 },
    ],
    totalDebt: [
      // Dato añadido para los cálculos
      { year: 2023, value: 111000000000 },
      { year: 2022, value: 120000000000 },
    ],
  },
  cashFlowStatement: {
    operatingCashFlow: [
      { year: 2023, value: 110540000000 },
      { year: 2022, value: 122150000000 },
    ],
    investingCashFlow: [
      { year: 2023, value: 3710000000 },
      { year: 2022, value: -22300000000 },
    ],
    financingCashFlow: [
      { year: 2023, value: -108480000000 },
      { year: 2022, value: -110690000000 },
    ],
    freeCashFlow: [
      { year: 2023, value: 99500000000 },
      { year: 2022, value: 111400000000 },
    ],
  },
};

export const mockAdvancedAnalysisData: AdvancedAnalysisData = {
  annualRevenue: mockCompanyData.incomeStatement.revenue,
  annualEps: [
    { year: 2023, value: 6.15 },
    { year: 2022, value: 6.11 },
    { year: 2021, value: 5.61 },
  ],
  zScoreComponents: {
    currentAssets: 154390000000,
    currentLiabilities: 147810000000,
    totalAssets: 352580000000,
    totalLiabilities: 290440000000,
    retainedEarnings: 75000000000,
    ebit: 114300000000,
    sales: 383290000000,
    marketCap: 2750000000000,
    interestExpense: 4930000000,
    incomeTaxExpense: 16740000000,
  },
  tickerPrices: mockCompanyData.historicalPrices.map((p) => ({
    date: p.date,
    close: p.close,
  })),
  spyPrices: mockCompanyData.historicalPrices.map((p) => ({
    date: p.date,
    close: p.close * 2.5,
  })), // Datos simulados para SPY
  historicalFcf: mockCompanyData.cashFlowStatement.freeCashFlow,
  sharesOutstanding: 15500000000,
  cashAndCashEquivalents: 29970000000,
  totalDebt: 111000000000,
};

export const mockAiAnalysis: string = `
**Análisis General:**
Apple muestra una sólida rentabilidad y una posición dominante en el mercado, aunque el crecimiento de sus ingresos se ha ralentizado recientemente.

**Fortalezas:**
* **Márgenes de beneficio robustos:** La empresa mantiene una alta rentabilidad en sus productos y servicios.
* **Fuerte generación de flujo de caja:** Su capacidad para generar efectivo sigue siendo un pilar fundamental.
* **Lealtad de marca:** La base de clientes de Apple es excepcionalmente fiel.

**Debilidades:**
* **Dependencia del iPhone:** Una parte significativa de sus ingresos sigue ligada a un solo producto.
* **Desaceleración del crecimiento:** El crecimiento de las ventas ha mostrado signos de estancamiento en comparación con años anteriores.
`;

export const mockFundamentalScores: FundamentalScores = {
  overallScore: 85,
  rating: "Compra Fuerte",
  revenueScore: 80,
  epsScore: 88,
  evEbitdaScore: 75,
  zScore: 92,
};

export const mockRiskScores: RiskScores = {
  overallScore: 88,
  stdDev: { value: 8.5, score: 90 },
  beta: { value: 1.2, score: 85 },
  maxDrawdown: { value: 25.0, score: 89 },
  monthsOfData: 60,
};

export const mockDcfValuationResult: DcfValuationResult = {
  fairValue: 210.5,
  upsidePercentage: 20.11,
  assumptions: {
    wacc: 8.5,
    initialGrowthRate: 5.0,
    perpetualGrowthRate: 2.5,
    latestFcf: 99500000000,
  },
  projections: [
    { year: 1, fcf: 104475000000, pvOfFcf: 96281106000 },
    { year: 2, fcf: 109700000000, pvOfFcf: 93100000000 },
    { year: 3, fcf: 115185000000, pvOfFcf: 90000000000 },
    { year: 4, fcf: 120944250000, pvOfFcf: 87000000000 },
    { year: 5, fcf: 126991462500, pvOfFcf: 84000000000 },
    { year: 6, fcf: 130801206375, pvOfFcf: 81000000000 },
    { year: 7, fcf: 134725242566, pvOfFcf: 78000000000 },
    { year: 8, fcf: 138767000000, pvOfFcf: 75000000000 },
    { year: 9, fcf: 142929000000, pvOfFcf: 72000000000 },
    { year: 10, fcf: 147217000000, pvOfFcf: 69000000000 },
  ],
  terminalValue: 2500000000000,
  pvOfTerminalValue: 1650000000000,
};
