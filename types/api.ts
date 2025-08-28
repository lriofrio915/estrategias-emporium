// types/api.ts

// =====================================
// 1. Tipos Auxiliares (Primitivas)
// =====================================
// Tipo auxiliar para valores numéricos de Yahoo Finance (con 'raw' y 'fmt')
export type YahooFinanceRawValue = {
  raw: number;
  fmt: string;
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
  netIncome?: YahooFinanceRawValue | number; // Agregado por si viene en el cashflow raw
  // Puedes añadir otras propiedades si las utilizas del resultado raw de yahooFinance.
}

export interface RawYahooFinanceBalanceSheetItem {
  maxAge: number;
  endDate: YahooFinanceDateValue; // Consistente con lo que yahoo-finance2 suele devolver aquí
  totalDebt?: YahooFinanceRawValue | number;
  totalStockholderEquity?: YahooFinanceRawValue | number;
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

// =====================================
// 3. Interfaces de Módulos de la API
// =====================================
// Interfaz para el módulo de precios
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
  // Puedes añadir más propiedades del módulo price aquí
}

// Interfaz para el módulo de datos financieros (contiene EBITDA, etc.)
export interface FinancialData {
  // ** CAMBIOS CLAVE AQUÍ: Aceptar 'number' o 'YahooFinanceRawValue' **
  ebitda?: YahooFinanceRawValue | number;
  totalRevenue?: YahooFinanceRawValue | number;
  totalAssets?: YahooFinanceRawValue | number;
  currentPrice?: YahooFinanceRawValue | number; // Añadido desde el error
  targetHighPrice?: YahooFinanceRawValue | number; // Añadido desde el error
  targetLowPrice?: YahooFinanceRawValue | number; // Añadido desde el error
  targetMeanPrice?: YahooFinanceRawValue | number; // Añadido desde el error
  targetMedianPrice?: YahooFinanceRawValue | number; // Añadido desde el error
  financialCurrency?: string | null; // Añadido desde el error, puede ser string o null
  // Asegurarse de que otras propiedades también pueden ser number si es el caso
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
  // Añade otras propiedades que uses de este módulo
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
  companyOfficers?: any[]; // Mantener 'any[]' si la estructura es compleja y no la usas directamente
}

// Interfaz para el módulo de estadísticas clave
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

// Interfaces de las declaraciones de estados financieros - AHORA REPRESENTAN LOS DATOS PROCESADOS
// Estas son las interfaces para los objetos que creas DESPUÉS de transformar
// los datos raw a YahooFinanceRawValue en tu ruta.
export interface CashflowStatement {
  maxAge?: number;
  endDate?: YahooFinanceDateValue;
  freeCashFlow?: YahooFinanceRawValue;
  operatingCashFlow?: YahooFinanceRawValue;
  capitalExpenditures?: YahooFinanceRawValue;
  netIncome?: YahooFinanceRawValue;
  // Se pueden añadir más propiedades de tipo YahooFinanceRawValue o similar si se necesitan
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
