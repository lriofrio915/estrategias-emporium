// app/api/stocks/route.ts
import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import {
  FinancialHistoryItem,
  CashflowStatementHistory,
  BalanceSheetHistory,
  IncomeStatementHistory,
  // Importamos los tipos auxiliares también para que las funciones helper puedan usarlos
  YahooFinanceRawValue,
  YahooFinanceDateValue,
} from "@/types/api";

// Definicines más específicas para los módulos que pueden ser retornados por quoteSummary
// Estos son los tipos que reemplazarán a `any` en QuoteSummary.
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
} // Renombrado para evitar conflicto con el importado

// Interfaz QuoteSummary: la mantenemos aquí ya que es específica de esta ruta
interface QuoteSummary {
  cashflowStatementHistory?: CashflowStatementHistory;
  balanceSheetHistory?: BalanceSheetHistory;
  incomeStatementHistory?: IncomeStatementHistory;

  // Reemplazamos 'any' con interfaces más específicas (o Record<string, unknown> si son muy variables)
  price?: PriceData;
  summaryDetail?: SummaryDetailData;
  assetProfile?: AssetProfileData;
  defaultKeyStatistics?: DefaultKeyStatisticsData;
  financialData?: FinancialDataModule;

  // Permitir otras propiedades que Yahoo Finance pueda devolver
  // Este índice de firma es útil si hay propiedades que no se tipan explícitamente
  // pero que sabes que pueden existir. Para evitar el error de 'any', usamos 'unknown'.
  [key: string]: unknown;
}

// Tipo auxiliar para el parámetro de getRawValue, ahora incluyendo 'undefined'
type GetRawValueParam = YahooFinanceRawValue | undefined;

// Función helper para extraer el valor numérico
function getRawValue(value: GetRawValueParam): number {
  if (typeof value === "number") {
    return value;
  }
  // Si el valor es undefined, regresamos 0.
  if (value === undefined) {
    return 0;
  }
  // El resto del código asume que value es un objeto con 'raw'
  if (value && typeof value === "object" && "raw" in value) {
    return value.raw || 0;
  }
  return 0; // Valor de retorno por defecto para cualquier otro caso
}

// Tipo auxiliar para el parámetro de getYearFromDate, ahora incluyendo 'undefined'
type GetYearFromDateParam = YahooFinanceDateValue | undefined;

// Función helper para extraer el año de endDate
function getYearFromDate(date: GetYearFromDateParam): string | null {
  if (date instanceof Date) {
    return date.getFullYear().toString();
  }
  // Si la fecha es undefined, regresamos null.
  if (date === undefined) {
    return null;
  }
  // El resto del código asume que date es un objeto con 'raw' o 'fmt'
  if (date && typeof date === "object") {
    if (date.fmt) {
      return date.fmt.substring(0, 4);
    }
    if (date.raw) {
      // Si es un timestamp, convertirlo a año
      const dateObj = new Date(date.raw * 1000);
      return dateObj.getFullYear().toString();
    }
  }
  return null;
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
      try {
        // Obtener datos actuales
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

        console.log(
          `Datos obtenidos para ${ticker}:`,
          Object.keys(quoteSummary)
        );

        // Procesar datos históricos financieros
        const financialHistory = processFinancialHistory(
          quoteSummary as QuoteSummary
        );
        console.log(`Financial history para ${ticker}:`, financialHistory);

        // Obtener datos históricos de precios
        const today = new Date();
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(today.getFullYear() - 5);

        const historicalData = await yahooFinance.historical(ticker, {
          period1: fiveYearsAgo,
          period2: today,
          interval: "1d",
        });

        return {
          ticker: ticker,
          data: {
            ...quoteSummary,
            historical: historicalData,
            financialHistory: financialHistory,
          },
        };
      } catch (error) {
        console.error(`Error completo fetching data for ${ticker}:`, error);

        // Fallback
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
          console.error(`Error fallback for ${ticker}:`, innerError);
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
    console.error("Error general fetching stock data:", error);
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

// Función para procesar el historial financiero
function processFinancialHistory(
  quoteSummary: QuoteSummary
): FinancialHistoryItem[] {
  try {
    const financialHistory: FinancialHistoryItem[] = [];

    const cashflowStatements =
      quoteSummary.cashflowStatementHistory?.cashflowStatements || [];
    const balanceStatements =
      quoteSummary.balanceSheetHistory?.balanceSheetStatements || [];

    const yearsData: Record<string, Partial<FinancialHistoryItem>> = {};

    cashflowStatements.forEach((statement) => {
      const year = getYearFromDate(statement.endDate);
      if (year) {
        yearsData[year] = {
          ...yearsData[year],
          year,
          // Accedemos a las propiedades con 'f' minúscula que devuelve yahoo-finance2
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
          // Usamos totalStockholderEquity primero, luego totalEquity si está disponible
          totalEquity: getRawValue(
            balance.totalStockholderEquity || balance.totalEquity
          ),
        };
      }
    });

    for (const year in yearsData) {
      const data = yearsData[year];
      const debtToEquity =
        data.totalEquity && data.totalEquity > 0
          ? (data.totalDebt! / data.totalEquity) * 100
          : 0;

      financialHistory.push({
        year: data.year!,
        freeCashFlow: data.freeCashFlow || 0,
        totalDebt: data.totalDebt || 0,
        totalEquity: data.totalEquity || 0,
        debtToEquity: parseFloat(debtToEquity.toFixed(2)),
        operatingCashFlow: data.operatingCashFlow,
        capitalExpenditures: data.capitalExpenditures,
      });
    }

    return financialHistory
      .sort((a, b) => parseInt(b.year) - parseInt(a.year))
      .slice(0, 10);
  } catch (error) {
    console.error("Error processing financial history:", error);
    return [];
  }
}
