export interface CompanyProfile {
  name: string;
  ticker: string;
  exchange: string;
  sector: string;
  industry: string;
  description: string;
}

export interface KeyMetrics {
  currentPrice: number;
  marketCap: number;
  peRatio: number;
  eps: number;
  dividendYield: number;
  beta: number;
  enterpriseValue: number;
  evToEbitda: number;
}

export interface FinancialStatementItem {
  year: number;
  value: number;
}

export interface IncomeStatement {
  revenue: FinancialStatementItem[];
  netIncome: FinancialStatementItem[];
  ebitda: FinancialStatementItem[];
}

export interface BalanceSheet {
  totalAssets: FinancialStatementItem[];
  totalLiabilities: FinancialStatementItem[];
  totalEquity: FinancialStatementItem[];
  totalDebt: FinancialStatementItem[];
}

export interface CashFlowStatement {
  operatingCashFlow: FinancialStatementItem[];
  investingCashFlow: FinancialStatementItem[];
  financingCashFlow: FinancialStatementItem[];
  freeCashFlow: FinancialStatementItem[];
}

export interface HistoricalPrice {
  date: string;
  close: number;
}

export interface CompanyData {
  profile: CompanyProfile;
  keyMetrics: KeyMetrics;
  incomeStatement: IncomeStatement;
  balanceSheet: BalanceSheet;
  cashFlowStatement: CashFlowStatement;
  historicalPrices: HistoricalPrice[];
}

export interface CompanyQuarterlyComparison {
  metric:
    | "Ventas e Ingresos"
    | "Liquidez"
    | "Deuda"
    | "Capital de Trabajo"
    | "Nivel de Inventarios"
    | "Rotación de Inventarios";
  currentQuarter: string;
  previousQuarter: string;
  sameQuarterLastYear: string;
  analysis: string;
}

export interface CompanyFinancials {
  name: string;
  quarterlyComparisons: CompanyQuarterlyComparison[];
}

export interface SectorAnalysis {
  sectorName: string;
  riskLevel: "Alto" | "Medio" | "Bajo";
  recessionProbabilityPercentage: number;
  summary: string;
  sourceEtf: string;
  representativeCompanies: CompanyFinancials[];
}

export interface RecessionAnalysisData {
  overallRecessionProbability: number;
  sectors: SectorAnalysis[];
}

export interface SectorPerformance {
  sectorName: string;
  performance: {
    "1D": number;
    "1W": number;
    "1M": number;
    "3M": number;
    "6M": number;
    "1Y": number;
    YTD: number;
  };
}

export interface CommodityPerformance {
  name: "Cobre" | "Gas Natural" | "Oro" | "Plata" | "Petroleo";
  price: number;
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

// New types for Macroeconomics tab
export interface FredObservation {
  date: string; // YYYY-MM-DD
  value: number | null;
}

export interface FredSeriesResponseItem {
  id: string;
  observations: FredObservation[];
}

export interface MacroIndicator {
  name: string;
  kind: "Adelantado" | "Mercado" | "Coincidente";
  ticker: string;
  fredUrl: string;
  lastDate: string;
  lastValue: number | null;
  yoy: number | null;
  sequential: number | null;
  yoyAccel: number | null;
  phase: string; // emoji: 🟢🟡🔴🟠⚪
  chartData: FredObservation[];
}

// --- New types for Advanced Analysis ---
export interface HistoricalDataPoint {
  year: number;
  value: number;
}

export interface ZScoreComponents {
  currentAssets: number;
  currentLiabilities: number;
  totalAssets: number;
  totalLiabilities: number;
  retainedEarnings: number;
  ebit: number;
  sales: number;
  marketCap: number;
  interestExpense: number;
  incomeTaxExpense: number;
}

export interface MonthlyPrice {
  date: string; // YYYY-MM-DD
  close: number;
}

export interface AdvancedAnalysisData {
  annualRevenue: HistoricalDataPoint[];
  annualEps: HistoricalDataPoint[];
  zScoreComponents: ZScoreComponents;
  tickerPrices: MonthlyPrice[];
  spyPrices: MonthlyPrice[];
  // New fields for DCF
  historicalFcf: HistoricalDataPoint[];
  sharesOutstanding: number;
  cashAndCashEquivalents: number;
  totalDebt: number; // Most recent annual value
}

// New type for DCF Valuation
export interface DcfValuationResult {
  fairValue: number;
  upsidePercentage: number;
  assumptions: {
    wacc: number;
    initialGrowthRate: number;
    perpetualGrowthRate: number;
    latestFcf: number;
  };
  projections: {
    year: number;
    fcf: number;
    pvOfFcf: number;
  }[];
  terminalValue: number;
  pvOfTerminalValue: number;
}

export interface FundamentalScores {
  revenueScore: number;
  epsScore: number;
  evEbitdaScore: number | null;
  zScore: number | null;
  overallScore: number;
  rating: string;
}

export interface RiskScores {
  stdDev: { value: number; score: number };
  beta: { value: number; score: number };
  maxDrawdown: { value: number; score: number };
  overallScore: number;
  monthsOfData: number;
}
