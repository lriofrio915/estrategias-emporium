// app/api/stocks/route.ts
import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import {
  FinancialHistoryItem,
  YahooFinanceRawValue,
  YahooFinanceDateValue,
} from "@/types/api";

// Definiciones más específicas para los módulos que pueden ser retornados por quoteSummary
interface PriceData {
  [key: string]: unknown;
}
interface SummaryDetailData {
  [key: string]: unknown;
}
interface AssetProfileData {
  [key: string]: unknown;
}
interface DefaultKeyStatisticsData {
  [key: string]: unknown;
}
interface FinancialDataModule {
  [key: string]: unknown;
}

interface QuoteSummary {
  cashflowStatementHistory?: {
    cashflowStatements: any[];
  };
  balanceSheetHistory?: {
    balanceSheetStatements: any[];
  };
  incomeStatementHistory?: {
    incomeStatementHistory: any[];
  };
  price?: PriceData;
  summaryDetail?: SummaryDetailData;
  assetProfile?: AssetProfileData;
  defaultKeyStatistics?: DefaultKeyStatisticsData;
  financialData?: FinancialDataModule;
  [key: string]: unknown;
}

// Función helper para extraer el valor numérico (ahora regresa `null` si no hay valor)
function getRawValue(value: YahooFinanceRawValue | undefined): number | null {
  if (typeof value === "number") {
    return value;
  }
  if (value && typeof value === "object" && "raw" in value) {
    return value.raw || null;
  }
  return null;
}

// Función helper para extraer el año de endDate (ahora regresa `null` si no hay año)
function getYearFromDate(
  date: YahooFinanceDateValue | undefined
): string | null {
  if (date instanceof Date) {
    return date.getFullYear().toString();
  }
  if (date && typeof date === "object") {
    if (date.fmt) {
      return date.fmt.substring(0, 4);
    }
    if (date.raw) {
      const dateObj = new Date(date.raw * 1000);
      return dateObj.getFullYear().toString();
    }
  }
  return null;
}

// Nueva función para procesar el historial financiero, más robusta
function processFinancialHistory(
  quoteSummary: QuoteSummary
): FinancialHistoryItem[] {
  try {
    const financialHistory: FinancialHistoryItem[] = [];

    // Verificamos si las propiedades anidadas existen para evitar errores
    // y asignar arrays vacíos si no están presentes.
    const cashflowStatements =
      quoteSummary.cashflowStatementHistory?.cashflowStatements || [];
    const balanceStatements =
      quoteSummary.balanceSheetHistory?.balanceSheetStatements || [];

    const yearsData: Record<string, Partial<FinancialHistoryItem>> = {};

    console.log("LOG: Procesando historial financiero...");
    console.log(
      "LOG: Number of cashflow statements:",
      cashflowStatements.length
    );
    console.log(
      "LOG: Number of balance sheet statements:",
      balanceStatements.length
    );

    cashflowStatements.forEach((statement) => {
      const year = getYearFromDate(statement.endDate);
      if (year) {
        yearsData[year] = {
          ...yearsData[year],
          year,
          freeCashFlow: getRawValue(statement.freeCashflow),
          operatingCashFlow: getRawValue(statement.operatingCashflow),
          capitalExpenditures: getRawValue(statement.capitalExpenditures),
        };
      }
    });

    balanceStatements.forEach((balance) => {
      const year = getYearFromDate(balance.endDate);
      if (year) {
        yearsData[year] = {
          ...yearsData[year],
          year,
          totalDebt: getRawValue(balance.totalDebt),
          totalEquity: getRawValue(
            balance.totalStockholderEquity || balance.totalEquity
          ),
        };
      }
    });

    console.log("LOG: yearsData after processing:", yearsData);

    for (const year in yearsData) {
      const data = yearsData[year];
      const totalDebt = data.totalDebt ?? 0;
      const totalEquity = data.totalEquity ?? 0;
      const debtToEquity = totalEquity > 0 ? totalDebt / totalEquity : null;

      financialHistory.push({
        year: data.year!,
        freeCashFlow: data.freeCashFlow ?? null,
        totalDebt: data.totalDebt ?? null,
        totalEquity: data.totalEquity ?? null,
        debtToEquity:
          debtToEquity !== null ? parseFloat(debtToEquity.toFixed(2)) : null,
        operatingCashFlow: data.operatingCashFlow ?? null,
        capitalExpenditures: data.capitalExpenditures ?? null,
      });
    }

    console.log(
      "LOG: Final financialHistory before sorting:",
      financialHistory
    );

    return financialHistory.sort(
      (a, b) => parseInt(a.year!) - parseInt(b.year!)
    );
  } catch (error) {
    console.error("LOG: Error processing financial history:", error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tickers = searchParams.getAll("tickers");

    if (tickers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No se proporcionaron tickers para consultar. Por favor, especifica al menos un ticker en los parámetros de consulta (ej: ?tickers=AAPL&tickers=MSFT).",
        },
        { status: 400 }
      );
    }

    const promises = tickers.map(async (ticker) => {
      console.log(`LOG: Attempting to fetch data for ticker: ${ticker}`);
      try {
        const quoteSummary = await yahooFinance.quoteSummary(ticker, {
          modules: [
            "price",
            "summaryDetail",
            "assetProfile",
            "defaultKeyStatistics",
            "financialData",
            "cashflowStatementHistory",
            "balanceSheetHistory",
            "incomeStatementHistory",
          ],
        });

        const financialHistory = processFinancialHistory(
          quoteSummary as QuoteSummary
        );

        const today = new Date();
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(today.getFullYear() - 5);

        const historicalData = await yahooFinance.historical(ticker, {
          period1: fiveYearsAgo,
          period2: today,
          interval: "1d",
        });

        console.log(
          `LOG: Successful fetch for ${ticker}. Returning formatted data.`
        );

        return {
          ticker: ticker,
          data: {
            ...quoteSummary,
            historical: historicalData,
            financialHistory: financialHistory,
          },
        };
      } catch (error) {
        console.error(`LOG: Full error for ${ticker}:`, error);

        try {
          const quoteSummary = await yahooFinance.quoteSummary(ticker, {
            modules: [
              "price",
              "summaryDetail",
              "assetProfile",
              "defaultKeyStatistics",
              "financialData",
            ],
          });

          return {
            ticker: ticker,
            data: {
              ...quoteSummary,
              historical: [],
              financialHistory: [],
            },
          };
        } catch (innerError) {
          console.error(`LOG: Fallback error for ${ticker}:`, innerError);
          return {
            ticker: ticker,
            data: {
              historical: [],
              financialHistory: [],
            },
          };
        }
      }
    });

    const results = await Promise.all(promises);

    console.log(
      "LOG: API route is returning this JSON:",
      JSON.stringify(results, null, 2)
    );

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("LOG: General error in API route:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching data from Yahoo Finance.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
