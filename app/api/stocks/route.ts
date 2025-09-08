import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import {
  FinancialHistoryItem,
  YahooFinanceRawValue,
  YahooFinanceDateValue,
  RawYahooFinanceBalanceSheetItem,
  RawYahooFinanceCashflowItem,
  QuoteSummaryResult,
  HistoricalData,
} from "@/types/api";

// He definido un tipo para los módulos para asegurar la compatibilidad con yahoo-finance2
type QuoteSummaryModule =
  | "price"
  | "summaryDetail"
  | "assetProfile"
  | "defaultKeyStatistics"
  | "financialData"
  | "cashflowStatementHistory"
  | "balanceSheetHistory"
  | "incomeStatementHistory";

// FUNCIÓN GETRAWVALUE - MANTENER ESTA IMPLEMENTACIÓN
function getRawValue(
  value: YahooFinanceRawValue | number | undefined
): number | null {
  if (typeof value === "number") {
    return value;
  }
  if (value && typeof value === "object" && "raw" in value) {
    return value.raw ?? null;
  }
  return null;
}

// FUNCIÓN GETYEARFROMDATE - MANTENER ESTA IMPLEMENTACIÓN
function getYearFromDate(
  date: YahooFinanceDateValue | Date | undefined
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

// FUNCIÓN PROCESSFINANCIALHISTORY
function processFinancialHistory(
  quoteSummary: QuoteSummaryResult
): FinancialHistoryItem[] {
  try {
    const financialHistory: FinancialHistoryItem[] = [];

    const cashflowStatements =
      (quoteSummary.cashflowStatementHistory
        ?.cashflowStatements as RawYahooFinanceCashflowItem[]) || [];

    const balanceStatements =
      (quoteSummary.balanceSheetHistory
        ?.balanceSheetStatements as RawYahooFinanceBalanceSheetItem[]) || [];

    const yearsData: Record<string, Partial<FinancialHistoryItem>> = {};

    cashflowStatements.forEach((statement: RawYahooFinanceCashflowItem) => {
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

    balanceStatements.forEach((balance: RawYahooFinanceBalanceSheetItem) => {
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
    // Obtiene el string completo de tickers
    const tickersString = searchParams.get("tickers");
    const fullData = searchParams.get("fullData") === "true";

    // Si no hay tickers, retorna un error
    if (!tickersString) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No se proporcionaron tickers para consultar. Por favor, especifica al menos un ticker en los parámetros de consulta.",
        },
        { status: 400 }
      );
    }

    // Divide el string en un array de tickers individuales
    const tickersArray = tickersString
      .split(",")
      .filter((t) => t.trim() !== "");

    if (tickersArray.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No se proporcionaron tickers válidos para consultar.",
        },
        { status: 400 }
      );
    }

    // Se construye un array de promesas, una para cada llamada individual
    const promises = tickersArray.map(async (ticker) => {
      console.log(`LOG: Attempting to fetch data for ticker: ${ticker}`);

      const baseModules: QuoteSummaryModule[] = ["price", "assetProfile"];
      const fullModules: QuoteSummaryModule[] = [
        "price",
        "assetProfile",
        "financialData",
        "summaryDetail",
        "defaultKeyStatistics",
        "cashflowStatementHistory",
        "balanceSheetHistory",
        "incomeStatementHistory",
      ];

      const modulesToFetch = fullData ? fullModules : baseModules;

      let financialHistory: FinancialHistoryItem[] = [];
      let historicalData: HistoricalData[] = [];

      try {
        // Se llama a la API de Yahoo Finance para cada ticker individualmente
        const quoteSummary = await yahooFinance.quoteSummary(ticker, {
          modules: modulesToFetch,
        });

        if (fullData) {
          financialHistory = processFinancialHistory(
            quoteSummary as QuoteSummaryResult
          );
          const today = new Date();
          const fiveYearsAgo = new Date();
          fiveYearsAgo.setFullYear(today.getFullYear() - 5);

          const rawHistoricalData = await yahooFinance.historical(ticker, {
            period1: fiveYearsAgo,
            period2: today,
            interval: "1d",
          });

          historicalData = rawHistoricalData.map((item) => ({
            ...item,
            date: item.date.toISOString().split("T")[0],
          }));
        }

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
            modules: ["price", "assetProfile"],
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
