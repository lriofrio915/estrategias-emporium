// types/api.ts

// Interfaz para datos históricos de precios
export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
}

// Nueva interfaz para los datos históricos financieros
export interface FinancialHistoryItem {
  year: string;
  freeCashFlow: number;
  totalDebt: number;
  totalEquity: number;
  debtToEquity: number;
  operatingCashFlow?: number;
  capitalExpenditures?: number;
}

// Tipo auxiliar para valores numéricos de Yahoo Finance (con 'raw' y 'fmt')
// Es importante que estos tipos no incluyan `undefined` aquí,
// ya que la opcionalidad la maneja el encadenamiento (?) en las interfaces de CashflowStatement y BalanceSheet.
export type YahooFinanceRawValue = { raw: number; fmt: string };
// Tipo auxiliar para valores de fecha de Yahoo Finance
export type YahooFinanceDateValue = { raw: number; fmt: string } | Date;

// Interfaces para datos financieros históricos crudos de Yahoo Finance
export interface CashflowStatement {
  maxAge?: number;
  endDate?: YahooFinanceDateValue; // Aquí se aplica la opcionalidad

  freeCashflow?: YahooFinanceRawValue;
  operatingCashflow?: YahooFinanceRawValue;
  capitalExpenditures?: YahooFinanceRawValue;
  investments?: YahooFinanceRawValue;
  netBorrowings?: YahooFinanceRawValue;
  otherCashflowFromFinancing?: YahooFinanceRawValue;
  otherCashflowFromInvesting?: YahooFinanceRawValue;
  changeToNetincome?: YahooFinanceRawValue;
  changeToAccountReceivables?: YahooFinanceRawValue;
  changeToLiabilities?: YahooFinanceRawValue;
  netIncome?: YahooFinanceRawValue;
  depreciation?: YahooFinanceRawValue;
  changeInWorkingCapital?: YahooFinanceRawValue;
  dividendsPaid?: YahooFinanceRawValue;
  effectOfForexChangesOnCash?: YahooFinanceRawValue;
  totalCashFromOperatingActivities?: YahooFinanceRawValue;
  totalCashFromInvestingActivities?: YahooFinanceRawValue;
  totalCashFromFinancingActivities?: YahooFinanceRawValue;
}

export interface BalanceSheet {
  maxAge?: number;
  endDate?: YahooFinanceDateValue; // Aquí se aplica la opcionalidad

  totalDebt?: YahooFinanceRawValue;
  totalStockholderEquity?: YahooFinanceRawValue;
  totalAssets?: YahooFinanceRawValue;
  currentAssets?: YahooFinanceRawValue;
  currentLiabilities?: YahooFinanceRawValue;
  longTermDebt?: YahooFinanceRawValue;
  cash?: YahooFinanceRawValue;
  netPPE?: YahooFinanceRawValue;
  retainedEarnings?: YahooFinanceRawValue;
  totalEquity?: YahooFinanceRawValue;
}

export interface IncomeStatement {
  maxAge?: number;
  endDate?: YahooFinanceDateValue; // Aquí se aplica la opcionalidad
  totalRevenue?: YahooFinanceRawValue;
  netIncome?: YahooFinanceRawValue;
  grossProfit?: YahooFinanceRawValue;
  operatingIncome?: YahooFinanceRawValue;
  ebitda?: YahooFinanceRawValue;
  dilutedEps?: YahooFinanceRawValue;
  basicEps?: YahooFinanceRawValue;
  costOfRevenue?: YahooFinanceRawValue;
  sellingGeneralAdministrative?: YahooFinanceRawValue;
}

// Interfaces de historial para estructurar los datos completos de yahooFinance.quoteSummary
export interface CashflowStatementHistory {
  maxAge: number;
  cashflowStatements: CashflowStatement[];
}

export interface BalanceSheetHistory {
  maxAge: number;
  balanceSheetStatements: BalanceSheet[];
}

export interface IncomeStatementHistory {
  maxAge: number;
  incomeStatements: IncomeStatement[];
}

// Interfaz para la estructura esperada del dato de un activo de la API
export interface ApiAssetItem {
  ticker: string;
  data: {
    financialHistory: FinancialHistoryItem[];
    price?: any;
    assetProfile?: any;
    summaryDetail?: any;
    defaultKeyStatistics?: any;
    financialData?: any;
    historical?: HistoricalData[];

    cashflowStatementHistory?: CashflowStatementHistory;
    balanceSheetHistory?: BalanceSheetHistory;
    incomeStatementHistory?: IncomeStatementHistory;
  };
}

// Interfaz para la respuesta completa de la API
export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: ApiAssetItem[];
}

// Tipo para períodos de tiempo disponibles
export type TimePeriod = "1W" | "1M" | "3M" | "1Y" | "5Y";
