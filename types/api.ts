// types/api.ts

// =====================================
// 1. Tipos Auxiliares (Primitivas)
// =====================================
// Tipo auxiliar para valores numéricos de Yahoo Finance (con 'raw' y 'fmt')
export type YahooFinanceRawValue = {
  raw: number;
  fmt?: string;
  longFmt?: string;
};

// Tipo auxiliar para valores de fecha de Yahoo Finance
// yahoo-finance2 a veces devuelve Date directamente, otras veces un objeto { raw: number, fmt: string }
// Para los módulos de estados financieros, suele ser este objeto.
export type YahooFinanceDateValue = { raw: number; fmt: string };



// =====================================
// 2. Interfaces para los Items RAW de Yahoo Finance
//    (tal como vienen directamente del paquete yahoo-finance2)
// =====================================
// Estas interfaces describen la estructura de los objetos individuales de las declaraciones
// tal como son devueltos por yahoo-finance2 antes de cualquier transformación.
// Se han movido aquí desde route.ts para una definición centralizada.

export interface RawYahooFinanceCashflowItem {
  maxAge: number;
  endDate: YahooFinanceDateValue; // Consistente con lo que yahoo-finance2 suele devolver aquí
  freeCashFlow?: YahooFinanceRawValue | number;
  operatingCashFlow?: YahooFinanceRawValue | number;
  capitalExpenditures?: YahooFinanceRawValue | number;
  netIncome?: YahooFinanceRawValue | number; 
  investments?: YahooFinanceRawValue | number;
  changeToInventory?: YahooFinanceRawValue | number;
  changeToLiabilities?: YahooFinanceRawValue | number;
  changeToOperatingActivities?: YahooFinanceRawValue | number;
  changeToAccountReceivables?: YahooFinanceRawValue | number;
  depreciation?: YahooFinanceRawValue | number;
  dividendPayout?: YahooFinanceRawValue | number;
  effectOfExchangeRate?: YahooFinanceRawValue | number;
  issuanceOfCapitalStock?: YahooFinanceRawValue | number;
  issuanceOfDebt?: YahooFinanceRawValue | number;
  netBorrowings?: YahooFinanceRawValue | number;
  otherCashflowsFromFinancingActivities?: YahooFinanceRawValue | number;
  otherCashflowsFromInvestingActivities?: YahooFinanceRawValue | number;
  repurchaseOfStock?: YahooFinanceRawValue | number;
  totalCashFromFinancingActivities?: YahooFinanceRawValue | number;
  totalCashFromOperatingActivities?: YahooFinanceRawValue | number;
  totalCashFromInvestingActivities?: YahooFinanceRawValue | number;
  changeInCash?: YahooFinanceRawValue | number;
}

export interface RawYahooFinanceBalanceSheetItem {
  maxAge: number;
  endDate: YahooFinanceDateValue; // Consistente con lo que yahoo-finance2 suele devolver aquí
  totalDebt?: YahooFinanceRawValue | number;
  totalStockholderEquity?: YahooFinanceRawValue | number;
  totalEquity?: YahooFinanceRawValue | number; // A veces viene como totalEquity
  // Puedes añadir otras propiedades si las utilizas del resultado raw de yahooFinance.
}

export interface RawYahooFinanceIncomeStatementItem {
  maxAge: number;
  endDate: YahooFinanceDateValue; // Consistente con lo que yahoo-finance2 suele devolver aquí
  totalRevenue?: YahooFinanceRawValue | number;
  netIncome?: YahooFinanceRawValue | number;
  grossProfit?: YahooFinanceRawValue | number;
  // Puedes añadir otras propiedades si las utilizas del resultado raw de yahooFinance.
}

export interface PriceData {
  longName?: string | null;
  shortName?: string | null;
  symbol?: string | null;
  currencySymbol?: string | null;
  currency?: string | null;
  financialCurrency?: string | null;
  exchange?: string | null;
  exchangeName?: string | null;
  fullExchangeName?: string | null;
  quoteType?: string | null;
  marketState?: string | null;
  fromCurrency?: string | null;

  // Precios y valores de mercado
  regularMarketPrice?: YahooFinanceRawValue | number;
  regularMarketPreviousClose?: YahooFinanceRawValue | number;
  regularMarketOpen?: YahooFinanceRawValue | number;
  regularMarketDayHigh?: YahooFinanceRawValue | number;
  regularMarketDayLow?: YahooFinanceRawValue | number;
  regularMarketChange?: YahooFinanceRawValue | number;
  regularMarketChangePercent?: YahooFinanceRawValue | number;
  regularMarketVolume?: YahooFinanceRawValue | number;
  marketCap?: YahooFinanceRawValue | number;

  // Volúmenes
  averageDailyVolume10Day?: YahooFinanceRawValue | number;
  averageDailyVolume3Month?: YahooFinanceRawValue | number;

  // Métricas de valoración
  trailingPE?: YahooFinanceRawValue | number;
  forwardPE?: YahooFinanceRawValue | number;
  epsTrailingTwelveMonths?: YahooFinanceRawValue | number;
  epsForward?: YahooFinanceRawValue | number;

  // Rangos de 52 semanas
  fiftyTwoWeekLow?: YahooFinanceRawValue | number;
  fiftyTwoWeekHigh?: YahooFinanceRawValue | number;

  // Dividendos
  trailingAnnualDividendRate?: YahooFinanceRawValue | number;
  trailingAnnualDividendYield?: YahooFinanceRawValue | number;
  dividendDate?: YahooFinanceRawValue | number;

  // Earnings
  earningsTimestamp?: YahooFinanceRawValue | number;
  earningsTimestampStart?: YahooFinanceRawValue | number;
  earningsTimestampEnd?: YahooFinanceRawValue | number;

  // Propiedades de tiempo y fecha
  regularMarketTime?: number | YahooFinanceRawValue | null;
  postMarketTime?: number | YahooFinanceRawValue | null;
  preMarketTime?: number | YahooFinanceRawValue | null;

  // Otras propiedades relacionadas con tiempo
  exchangeTimezoneName?: string | null;
  exchangeTimezoneShortName?: string | null;
  gmtOffSetMilliseconds?: number | null;

  // Puedes añadir más propiedades del módulo price aquí
}

// Interfaz para el módulo de datos financieros (contiene EBITDA, etc.)
export interface FinancialData {
  // ** CAMBIOS CLAVE AQUÍ: Aceptar 'number' o 'YahooFinanceRawValue' **
  totalAssets?: YahooFinanceRawValue | number;
  currentPrice?: YahooFinanceRawValue | number; // Añadido desde el error
  targetMedianPrice?: YahooFinanceRawValue | number; // Añadido desde el error
  financialCurrency?: string | null; // Añadido desde el error, puede ser string o null
  // Asegurarse de que otras propiedades también pueden ser number si es el caso
  grossMargins?: YahooFinanceRawValue | number;
  operatingMargins?: YahooFinanceRawValue | number;
  profitMargins?: YahooFinanceRawValue | number;
  earningsGrowth?: YahooFinanceRawValue | number;
  revenueGrowth?: YahooFinanceRawValue | number;
  // Añade otras propiedades que uses de este módulo
  // Propiedades de liquidez y efectivo
  totalCash?: number | YahooFinanceRawValue | null;
  totalCashPerShare?: number | YahooFinanceRawValue | null;
  totalDebt?: number | YahooFinanceRawValue | null;

  // Ratios de liquidez
  currentRatio?: number | YahooFinanceRawValue | null;
  quickRatio?: number | YahooFinanceRawValue | null;
  debtToEquity?: number | YahooFinanceRawValue | null;

  // Flujos de efectivo
  operatingCashflow?: number | YahooFinanceRawValue | null;
  freeCashflow?: number | YahooFinanceRawValue | null;

  // Otras propiedades financieras comunes
  revenue?: number | YahooFinanceRawValue | null;
  grossProfits?: number | YahooFinanceRawValue | null;
  ebitda?: number | YahooFinanceRawValue | null;
  ebitdaMargins?: number | YahooFinanceRawValue | null;
  netIncome?: number | YahooFinanceRawValue | null;
  totalRevenue?: number | YahooFinanceRawValue | null;
  grossMargin?: number | YahooFinanceRawValue | null;
  operatingMargin?: number | YahooFinanceRawValue | null;
  profitMargin?: number | YahooFinanceRawValue | null;
  returnOnAssets?: number | YahooFinanceRawValue | null;
  returnOnEquity?: number | YahooFinanceRawValue | null;

  // Recomendaciones y objetivos
  recommendationKey?: string | null;
  recommendationMean?: number | YahooFinanceRawValue | null;
  targetHighPrice?: number | YahooFinanceRawValue | null;
  targetLowPrice?: number | YahooFinanceRawValue | null;
  targetMeanPrice?: number | YahooFinanceRawValue | null;
  numberOfAnalystOpinions?: number | YahooFinanceRawValue | null;
}

// Interfaz para el módulo de perfil de la empresa
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

  // Propiedades de riesgo de gobierno corporativo
  overallRisk?: number | null;
  auditRisk?: number | null;
  boardRisk?: number | null;
  compensationRisk?: number | null;
  shareHolderRightsRisk?: number | null;

  // Otras propiedades comunes de AssetProfile que podrías necesitar
  maxAge?: number;
  address2?: string | null;
  fax?: string | null;
  phone?: string | null;
  industryKey?: string | null;
  industryDisp?: string | null;
  sectorKey?: string | null;
  sectorDisp?: string | null;
  longName?: string | null;
  shortName?: string | null;
  symbol?: string | null;
  exchange?: string | null;
  exchangeTimezoneShortName?: string | null;
  exchangeTimezoneName?: string | null;
}

// Interfaz para el módulo de estadísticas clave
export interface KeyStatisticsData {
  marketCap?: YahooFinanceRawValue | number;
  profitMargins?: YahooFinanceRawValue | number;
  floatShares?: YahooFinanceRawValue | number;
  sharesOutstanding?: YahooFinanceRawValue | number;
  lastSplitFactor?: string | null;
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
  revenueQuarterlyGrowth?: YahooFinanceRawValue | number;
  // Propiedades de dividendos
  lastDividendValue?: number | YahooFinanceRawValue | null;
  lastDividendDate?: number | YahooFinanceRawValue | null;
  dividendRate?: number | YahooFinanceRawValue | null;
  dividendYield?: number | YahooFinanceRawValue | null;
  trailingAnnualDividendRate?: number | YahooFinanceRawValue | null;
  trailingAnnualDividendYield?: number | YahooFinanceRawValue | null;
  fiveYearAvgDividendYield?: number | YahooFinanceRawValue | null;
  payoutRatio?: number | YahooFinanceRawValue | null;

  // Otras propiedades comunes de key statistics
  enterpriseValue?: number | YahooFinanceRawValue | null;
  forwardPE?: number | YahooFinanceRawValue | null;
  trailingPE?: number | YahooFinanceRawValue | null;
  priceToSalesTrailing12Months?: number | YahooFinanceRawValue | null;
  priceToBook?: number | YahooFinanceRawValue | null;
  bookValue?: number | YahooFinanceRawValue | null;

  // Propiedades de volatilidad y riesgo
  beta?: number | YahooFinanceRawValue | null;
  "52WeekChange"?: number | YahooFinanceRawValue | null; // ← Añade esta línea
  sandP52WeekChange?: number | YahooFinanceRawValue | null; // ← También esta alternativa común

  // Otras propiedades de volatilidad
  volatility?: number | YahooFinanceRawValue | null;
  standardDeviation?: number | YahooFinanceRawValue | null;

  revenuePerShare?: number | YahooFinanceRawValue | null;
  trailingEps?: number | YahooFinanceRawValue | null;
  forwardEps?: number | YahooFinanceRawValue | null;
  earningsQuarterlyGrowth?: number | YahooFinanceRawValue | null;
}

// Interfaz para el módulo de dividendos
export interface DividendData {
  trailingAnnualDividendRate?: YahooFinanceRawValue;
  trailingAnnualDividendYield?: YahooFinanceRawValue;
}

// Interfaz para los datos de analistas
export interface AnalystData {
  targetHighPrice?: YahooFinanceRawValue;
  targetLowPrice?: YahooFinanceRawValue;
  numberOfAnalystOpinions?: number;
  recommendationMean?: YahooFinanceRawValue;
  recommendationKey?: string | null;
}

// =====================================
// 4. Interfaces de Historial Financiero (para los datos procesados)
// =====================================
// Interfaz para los datos históricos de precios
export interface HistoricalData {
  date: string; // Ya está como string en el frontend
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
}

// Interfaz para los datos históricos financieros (como se usa en el frontend, después de procesar)
export interface FinancialHistoryItem {
  year: string;
  freeCashFlow: number | null;
  totalDebt: number | null;
  totalEquity: number | null;
  debtToEquity: number | null;
  operatingCashFlow: number | null;
  capitalExpenditures: number | null;
}

export interface BalanceSheet {
  maxAge?: number;
  endDate?: YahooFinanceDateValue;
  totalDebt?: YahooFinanceRawValue;
  totalStockholderEquity?: YahooFinanceRawValue;
  // Se pueden añadir más propiedades de tipo YahooFinanceRawValue o similar si se necesiten
}

export interface IncomeStatement {
  maxAge?: number;
  endDate?: YahooFinanceDateValue;
  totalRevenue?: YahooFinanceRawValue;
  netIncome?: YahooFinanceRawValue;
  grossProfit?: YahooFinanceRawValue;
  // Se pueden añadir más propiedades de tipo YahooFinanceRawValue o similar si se necesiten
}

// =====================================
// 5. Interfaces para los Contenedores de Historial de Yahoo Finance
//    (tal como vienen directamente del paquete yahoo-finance2)
// =====================================
// Estas interfaces describen los objetos contenedores que devuelve yahoo-finance2
// para el historial de estados financieros.
// Se usan las interfaces `RawYahooFinance...Item` para los elementos del array.

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
}

// =====================================
// 6. Interfaces de Respuesta de la API
// =====================================
// Interfaz para el objeto que contiene todos los datos resumidos
// Ahora utiliza los tipos de historial de Yahoo Finance.
export interface QuoteSummaryResult {
  price?: PriceData;
  summaryDetail?: any; // Mantener 'any' si la estructura es muy compleja o variable
  assetProfile?: AssetProfileData;
  defaultKeyStatistics?: KeyStatisticsData;
  financialData?: FinancialData; // Ahora usa la FinancialData corregida
  earningsTrend?: AnalystData;
  upgradeDowngradeHistory?: any; // Mantener 'any' si la estructura es compleja
  // Otros módulos que `yahoo-finance2` pueda devolver para `quoteSummary`
  // Si usas otros módulos en `modulesToFetch` y el error persiste, agrégalos aquí.

  // Propiedades de historial de yahoo-finance2
  cashflowStatementHistory?: QuoteSummaryCashflowStatementHistory;
  balanceSheetHistory?: QuoteSummaryBalanceSheetHistory;
  incomeStatementHistory?: IncomeStatementHistory;

  // Propiedades añadidas por tu backend
  historical?: HistoricalData[];
  financialHistory?: FinancialHistoryItem[];
}

// Interfaz para la estructura esperada del dato de un activo de la API
export interface ApiAssetItem {
  ticker: string;
  data: QuoteSummaryResult;
}

// Interfaz para la respuesta completa de la API
export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: ApiAssetItem[];
  assetData?: ApiAssetItem[];
}

// =====================================
// 7. Tipos de Utilidad
// =====================================
// Tipo para períodos de tiempo disponibles
export type TimePeriod = "1W" | "1M" | "3M" | "1Y" | "5Y";

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
