// types/api.ts

// =====================================
// Interfaces de Portafolio
// =====================================
export interface Portfolio {
  name: string;
  slug: string;
  tickers: string[];
}

// Definimos la interfaz para los datos de cada activo, como se mostrarán en la tabla
export interface AssetData {
  data: any;
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  price: number | null;
  dailyChange: number | null;
  incomeStatementHistory?: RawYahooFinanceIncomeStatementItem[];
  error?: string; // Para manejar errores individuales por activo
}

// =====================================
// Interfaces de la API y Tipos Auxiliares
// =====================================

export type YahooFinanceModule =
  | "price"
  | "financialData"
  | "summaryDetail"
  | "assetProfile"
  | "defaultKeyStatistics"
  | "cashflowStatementHistory"
  | "balanceSheetHistory"
  | "incomeStatementHistory"
  | "earningsTrend";

// Tipo auxiliar para valores numéricos de Yahoo Finance (con 'raw' y 'fmt')
export interface YahooFinanceRawValue {
  raw: number;
  fmt?: string;
  longFmt?: string;
}

export type RawValueType =
  | number
  | string
  | YahooFinanceRawValue
  | null
  | undefined;

export type GetRawValueReturnType = number | string | null | undefined;

// Tipo auxiliar para valores de fecha de Yahoo Finance
export type YahooFinanceDateValue = { raw: number; fmt: string };

// 2. Interfaces para los Items RAW de Yahoo Finance
export interface RawYahooFinanceCashflowItem {
  maxAge: number;
  endDate: Date | YahooFinanceDateValue;
  freeCashFlow?: YahooFinanceRawValue | number;
  operatingCashFlow?: YahooFinanceRawValue | number;
  capitalExpenditures?: YahooFinanceRawValue | number;
  netIncome?: YahooFinanceRawValue | number;
  depreciation?: number;
  changeToNetincome?: number;
  changeToAccountReceivables?: number;
  changeToLiabilities?: number;
  changeToInventory?: number;
  [key: string]: any;
}

export interface RawYahooFinanceBalanceSheetItem {
  maxAge: number;
  endDate: Date | YahooFinanceDateValue;
  totalDebt?: YahooFinanceRawValue | number;
  totalStockholderEquity?: YahooFinanceRawValue | number;
  totalAssets?: number;
  cash?: number;
  shortTermInvestments?: number;
  netReceivables?: number;
  inventory?: number;
  otherCurrentAssets?: number;
  [key: string]: any;
}

export interface RawYahooFinanceIncomeStatementItem {
  maxAge: number;
  endDate: Date | YahooFinanceDateValue;
  totalRevenue?: YahooFinanceRawValue | number;
  netIncome?: YahooFinanceRawValue | number;
  grossProfit?: YahooFinanceRawValue | number;
  [key: string]: any;
}

// 3. Interfaces de Módulos de la API
export interface PriceData {
  longName?: string | null;
  regularMarketPrice?: YahooFinanceRawValue | number;
  regularMarketPreviousClose?: YahooFinanceRawValue | number;
  symbol?: string | null;
  marketState?: string | null;
  marketCap?: YahooFinanceRawValue | number;
  regularMarketChange?: YahooFinanceRawValue | number;
  regularMarketChangePercent?: YahooFinanceRawValue | number;
  exchange?: string | null;
  exchangeName?: string | null;
  fromCurrency?: string | null;
  averageDailyVolume10Day?: number;
  averageDailyVolume3Month?: number;
  currencySymbol?: string | null;
}

export interface FinancialData {
  totalCash: undefined;
  totalDebt: undefined;
  quickRatio: undefined;
  currentRatio: undefined;
  operatingCashflow: undefined;
  freeCashflow: undefined;
  totalCashPerShare: string | number | YahooFinanceRawValue | null | undefined;
  ebitda?: YahooFinanceRawValue | number;
  totalRevenue?: YahooFinanceRawValue | number;
  totalAssets?: YahooFinanceRawValue | number;
  currentPrice?: YahooFinanceRawValue | number;
  targetHighPrice?: YahooFinanceRawValue | number;
  targetLowPrice?: YahooFinanceRawValue | number;
  targetMeanPrice?: YahooFinanceRawValue | number;
  targetMedianPrice?: YahooFinanceRawValue | number;
  financialCurrency?: string | null;
  recommendationMean?: YahooFinanceRawValue | number;
  recommendationKey?: string | null;
  numberOfAnalystOpinions?: number;
  grossMargins?: YahooFinanceRawValue | number;
  operatingMargins?: YahooFinanceRawValue | number;
  profitMargins?: YahooFinanceRawValue | number;
  earningsGrowth?: YahooFinanceRawValue | number;
  revenueGrowth?: YahooFinanceRawValue | number;
  debtToEquity?: YahooFinanceRawValue | number;
  returnOnAssets?: YahooFinanceRawValue | number;
  returnOnEquity?: YahooFinanceRawValue | number;
  revenuePerShare?: YahooFinanceRawValue | number;
  grossProfits?: YahooFinanceRawValue | number;
  ebitdaMargins?: YahooFinanceRawValue | number;
}

export interface AssetProfileData {
  longBusinessSummary?: string | null;
  sector?: string | null;
  industry?: string | null;
  website?: string | null;
  employees?: number;
  fullTimeEmployees?: number;
  address1?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  companyOfficers?: any[];
  overallRisk?: number;
  auditRisk?: number;
  boardRisk?: number;
  compensationRisk?: number;
  shareHolderRightsRisk?: number;
}

export interface KeyStatisticsData {
  trailingPE?: YahooFinanceRawValue | number;
  forwardPE?: YahooFinanceRawValue | number;
  marketCap?: YahooFinanceRawValue | number;
  beta?: YahooFinanceRawValue | number;
  enterpriseValue?: YahooFinanceRawValue | number;
  profitMargins?: YahooFinanceRawValue | number;
  floatShares?: YahooFinanceRawValue | number;
  sharesOutstanding?: YahooFinanceRawValue | number;
  lastSplitFactor?: string | null;
  priceToSalesTrailing12Months?: YahooFinanceRawValue | number;
  priceToBook?: YahooFinanceRawValue | number;
  bookValue?: YahooFinanceRawValue | number;
  heldPercentInsiders?: YahooFinanceRawValue | number;
  heldPercentInstitutions?: YahooFinanceRawValue | number;
  shortRatio?: YahooFinanceRawValue | number;
  sharesShort?: YahooFinanceRawValue | number;
  sharesPercentSharesOut?: YahooFinanceRawValue | number;
  shortPercentOfFloat?: YahooFinanceRawValue | number;
  fiveYearAvgReturn?: YahooFinanceRawValue | number;
  lastFiscalYearEnd?: YahooFinanceDateValue;
  nextFiscalYearEnd?: YahooFinanceDateValue;
  mostRecentQuarter?: YahooFinanceDateValue;
  netIncomeToCommon?: YahooFinanceRawValue | number;
  revenuePerShare?: YahooFinanceRawValue | number;
  earningsQuarterlyGrowth?: YahooFinanceRawValue | number;
  revenueQuarterlyGrowth?: YahooFinanceRawValue | number;
  fiftyTwoWeekChange?: YahooFinanceRawValue | number;
  trailingEps?: YahooFinanceRawValue | number;
  forwardEps?: YahooFinanceRawValue | number;
}

export interface DividendData {
  trailingAnnualDividendRate?: YahooFinanceRawValue;
  trailingAnnualDividendYield?: YahooFinanceRawValue;
}

export interface AnalystData {
  targetHighPrice?: YahooFinanceRawValue;
  targetLowPrice?: YahooFinanceRawValue;
  numberOfAnalystOpinions?: number;
  recommendationMean?: YahooFinanceRawValue;
  recommendationKey?: string | null;
}

// 4. Interfaces de Historial Financiero (para los datos procesados)
export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
}

export interface FinancialHistoryItem {
  year: string;
  freeCashFlow: number | null;
  totalDebt: number | null;
  totalEquity: number | null;
  debtToEquity: number | null;
  operatingCashFlow: number | null;
  capitalExpenditures: number | null;
}

export interface CashflowStatement {
  maxAge?: number;
  endDate?: YahooFinanceDateValue;
  freeCashFlow?: YahooFinanceRawValue;
  operatingCashFlow?: YahooFinanceRawValue;
  capitalExpenditures?: YahooFinanceRawValue;
  netIncome?: YahooFinanceRawValue;
}

export interface BalanceSheet {
  maxAge?: number;
  endDate?: YahooFinanceDateValue;
  totalDebt?: YahooFinanceRawValue;
  totalStockholderEquity?: YahooFinanceRawValue;
}

export interface IncomeStatement {
  maxAge?: number;
  endDate?: YahooFinanceDateValue;
  totalRevenue?: YahooFinanceRawValue;
  netIncome?: YahooFinanceRawValue;
  grossProfit?: YahooFinanceRawValue;
}

// 5. Interfaces para los Contenedores de Historial de Yahoo Finance
export interface QuoteSummaryCashflowStatementHistory {
  maxAge: number;
  cashflowStatements: RawYahooFinanceCashflowItem[];
}

export interface QuoteSummaryBalanceSheetHistory {
  maxAge: number;
  balanceSheetStatements: RawYahooFinanceBalanceSheetItem[];
}

export interface IncomeStatementHistory {
  maxAge: number;
  incomeStatements: RawYahooFinanceIncomeStatementItem[];
  incomeStatementHistory?: RawYahooFinanceIncomeStatementItem[];
}

// 6. Interfaces de Respuesta de la API
export interface QuoteSummaryResult {
  price?: PriceData;
  summaryDetail?: any;
  assetProfile?: AssetProfileData;
  defaultKeyStatistics?: KeyStatisticsData;
  financialData?: FinancialData;
  earningsTrend?: AnalystData;
  upgradeDowngradeHistory?: any;
  cashflowStatementHistory?: QuoteSummaryCashflowStatementHistory;
  balanceSheetHistory?: QuoteSummaryBalanceSheetHistory;
  incomeStatementHistory?: IncomeStatementHistory;
  historical?: HistoricalData[];
  financialHistory?: FinancialHistoryItem[];
}

// Interfaz para la estructura esperada del dato de un activo de la API
export interface ApiAssetItem {
  ticker: string;
  data: QuoteSummaryResult;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: ApiAssetItem[];
  assetData?: ApiAssetItem[];
}

// 7. Tipos de Utilidad
export type TimePeriod = "1W" | "1M" | "3M" | "1Y" | "5Y";
