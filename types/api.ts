// types/api.ts

// Interfaz para datos históricos (convertir string a Date después)
export interface HistoricalData {
  date: string; // Cambiado a string
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
}

// Interfaz para la estructura esperada del dato de un activo de la API
export interface ApiAssetItem {
  ticker: string;
  data: {
    price?: {
      maxAge?: number;
      regularMarketChangePercent?: number;
      regularMarketChange?: number;
      regularMarketTime?: string;
      priceHint?: number;
      regularMarketPrice?: number;
      regularMarketDayHigh?: number;
      regularMarketDayLow?: number;
      regularMarketVolume?: number;
      averageDailyVolume10Day?: number;
      averageDailyVolume3Month?: number;
      regularMarketPreviousClose?: number;
      regularMarketSource?: string;
      regularMarketOpen?: number;
      exchange?: string;
      exchangeName?: string;
      exchangeDataDelayedBy?: number;
      marketState?: string;
      quoteType?: string;
      symbol?: string;
      underlyingSymbol?: string | null;
      shortName?: string;
      longName?: string;
      currency?: string;
      quoteSourceName?: string;
      currencySymbol?: string;
      fromCurrency?: string | null;
      toCurrency?: string | null;
      lastMarket?: string | null;
      marketCap?: number;
    };
    assetProfile?: {
      address1?: string;
      city?: string;
      zip?: string;
      country?: string;
      phone?: string;
      fax?: string;
      website?: string;
      industry?: string;
      industryKey?: string;
      industryDisp?: string;
      sector?: string;
      sectorKey?: string;
      sectorDisp?: string;
      longBusinessSummary?: string;
      fullTimeEmployees?: number;
      companyOfficers?: Array<{
        maxAge?: number;
        name: string;
        age?: number;
        title: string;
        yearBorn?: number;
        fiscalYear?: number;
        totalPay?: number;
        exercisedValue?: number;
        unexercisedValue?: number;
      }>;
      auditRisk?: number;
      boardRisk?: number;
      compensationRisk?: number;
      shareHolderRightsRisk?: number;
      overallRisk?: number;
      governanceEpochDate?: string;
      compensationAsOfEpochDate?: string;
      irWebsite?: string;
      executiveTeam?: any[];
      maxAge?: number;
    };
    summaryDetail?: {
      maxAge?: number;
      priceHint?: number;
      previousClose?: number;
      open?: number;
      dayLow?: number;
      dayHigh?: number;
      regularMarketPreviousClose?: number;
      regularMarketOpen?: number;
      regularMarketDayLow?: number;
      regularMarketDayHigh?: number;
      dividendRate?: number;
      dividendYield?: number;
      exDividendDate?: string;
      payoutRatio?: number;
      fiveYearAvgDividendYield?: number;
      beta?: number;
      trailingPE?: number;
      forwardPE?: number;
      volume?: number;
      regularMarketVolume?: number;
      averageVolume?: number;
      averageVolume10days?: number;
      averageDailyVolume10Day?: number;
      bid?: number;
      ask?: number;
      bidSize?: number;
      askSize?: number;
      marketCap?: number;
      fiftyTwoWeekLow?: number;
      fiftyTwoWeekHigh?: number;
      priceToSalesTrailing12Months?: number;
      fiftyDayAverage?: number;
      twoHundredDayAverage?: number;
      trailingAnnualDividendRate?: number;
      trailingAnnualDividendYield?: number;
      currency?: string;
      fromCurrency?: string | null;
      toCurrency?: string | null;
      lastMarket?: string | null;
      coinMarketCapLink?: string | null;
      algorithm?: string | null;
      tradeable?: boolean;
    };
    defaultKeyStatistics?: {
      maxAge?: number;
      priceHint?: number;
      enterpriseValue?: number;
      forwardPE?: number;
      profitMargins?: number;
      sharesOutstanding?: number;
      heldPercentInsiders?: number;
      heldPercentInstitutions?: number;
      beta?: number;
      impliedSharesOutstanding?: number;
      category?: string | null;
      bookValue?: number;
      priceToBook?: number;
      fundFamily?: string | null;
      legalType?: string | null;
      lastFiscalYearEnd?: string;
      nextFiscalYearEnd?: string;
      mostRecentQuarter?: string;
      earningsQuarterlyGrowth?: number;
      netIncomeToCommon?: number;
      trailingEps?: number;
      forwardEps?: number;
      lastSplitFactor?: string;
      lastSplitDate?: number;
      enterpriseToRevenue?: number;
      enterpriseToEbitda?: number;
      "52WeekChange"?: number;
      SandP52WeekChange?: number;
      lastDividendValue?: number;
      lastDividendDate?: string;
      latestShareClass?: string | null;
      leadInvestor?: string | null;
    };
    financialData?: {
      maxAge?: number;
      currentPrice?: number;
      targetHighPrice?: number;
      targetLowPrice?: number;
      targetMeanPrice?: number;
      targetMedianPrice?: number;
      recommendationMean?: number;
      recommendationKey?: string;
      numberOfAnalystOpinions?: number;
      totalCash?: number;
      totalCashPerShare?: number;
      ebitda?: number;
      totalDebt?: number;
      quickRatio?: number;
      currentRatio?: number;
      totalRevenue?: number;
      debtToEquity?: number;
      revenuePerShare?: number;
      returnOnAssets?: number;
      returnOnEquity?: number;
      grossProfits?: number;
      freeCashflow?: number;
      operatingCashflow?: number;
      earningsGrowth?: number;
      revenueGrowth?: number;
      grossMargins?: number;
      ebitdaMargins?: number;
      operatingMargins?: number;
      profitMargins?: number;
      financialCurrency?: string;
    };
    historical?: HistoricalData[]; // Ahora coincide
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
