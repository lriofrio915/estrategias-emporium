// app/api/stocks/route.ts
import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import {
  FinancialHistoryItem,
  YahooFinanceRawValue,
  YahooFinanceDateValue,
  QuoteSummaryResult, // Importamos la interfaz QuoteSummaryResult
  RawYahooFinanceCashflowItem, // Importamos la interfaz para los items de cashflow raw
  RawYahooFinanceBalanceSheetItem, // Importamos la interfaz para los items de balance sheet raw
  // Ya no necesitamos importar PriceData, SummaryDetailData, etc., porque QuoteSummaryResult
  // ya las engloba y las interfaces específicas están en types/api.ts
} from "@/types/api";

// Las interfaces duplicadas y obsoletas (PriceData, SummaryDetailData, AssetProfileData,
// DefaultKeyStatisticsData, FinancialDataModule, QuoteSummary) han sido eliminadas
// ya que QuoteSummaryResult en types/api.ts provee la tipificación correcta y completa.

// Función helper para extraer el valor numérico (ahora regresa `null` si no hay valor)
function getRawValue(value: YahooFinanceRawValue | number | undefined): number | null {
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
      // Yahoo Finance a veces devuelve timestamps en segundos, Date espera milisegundos
      const dateObj = new Date(date.raw * 1000);
      return dateObj.getFullYear().toString();
    }
  }
  return null;
}

// Nueva función para procesar el historial financiero, más robusta
function processFinancialHistory(
  quoteSummary: QuoteSummaryResult // CAMBIO CLAVE: Usamos la interfaz QuoteSummaryResult
): FinancialHistoryItem[] {
  try {
    const financialHistory: FinancialHistoryItem[] = [];

    // Verificamos si las propiedades anidadas existen para evitar errores
    // y asignar arrays vacíos si no están presentes.
    // Tipificamos explícitamente los arrays con las interfaces RawYahooFinance*Item
    const cashflowStatements: RawYahooFinanceCashflowItem[] =
      quoteSummary.cashflowStatementHistory?.cashflowStatements || [];
    const balanceStatements: RawYahooFinanceBalanceSheetItem[] =
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
      // 'statement' ahora es de tipo RawYahooFinanceCashflowItem
      const year = getYearFromDate(statement.endDate);
      if (year) {
        yearsData[year] = {
          ...yearsData[year],
          year,
          freeCashFlow: getRawValue(statement.freeCashFlow),
          operatingCashFlow: getRawValue(statement.operatingCashFlow),
          capitalExpenditures: getRawValue(statement.capitalExpenditures),
        };
      }
    });

    balanceStatements.forEach((balance) => {
      // 'balance' ahora es de tipo RawYahooFinanceBalanceSheetItem
      const year = getYearFromDate(balance.endDate);
      if (year) {
        yearsData[year] = {
          ...yearsData[year],
          year,
          totalDebt: getRawValue(balance.totalDebt),
          totalEquity: getRawValue(
            // Asumiendo que 'totalEquity' también puede venir de balance.totalStockholderEquity
            balance.totalStockholderEquity || balance.totalEquity // Ya no se necesita 'as any'
          ),
        };
      }
    });

    console.log("LOG: yearsData after processing:", yearsData);

    for (const year in yearsData) {
      const data = yearsData[year];
      // Aseguramos que 'year' existe antes de usarlo
      if (!data.year) {
        continue;
      }
      const totalDebt = data.totalDebt ?? 0;
      const totalEquity = data.totalEquity ?? 0;
      const debtToEquity = totalEquity > 0 ? totalDebt / totalEquity : null;

      financialHistory.push({
        year: data.year, // Eliminamos '!' ya que hemos comprobado su existencia
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
      // Eliminamos '!' ya que hemos comprobado su existencia o es garantizado por el tipo FinancialHistoryItem
      (a, b) => parseInt(a.year) - parseInt(b.year)
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
            // Agregué incomeStatementHistory aquí, ya que estaba en la interfaz QuoteSummary original
            // y es buena práctica incluirlo si lo definiste en types/api.ts.
          ],
        }) as QuoteSummaryResult;

        const financialHistory = processFinancialHistory(quoteSummary);

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

        // Bloque de fallback en caso de que la primera llamada falle
        try {
          const quoteSummary = await yahooFinance.quoteSummary(ticker, {
            modules: [
              "price",
              "summaryDetail",
              "assetProfile",
              "defaultKeyStatistics",
              "financialData",
            ],
          }) as QuoteSummaryResult; 

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
              // Devolvemos objetos vacíos o nulos para asegurar consistencia
              price: {}, // Objeto PriceData vacío
              summaryDetail: {}, // Puedes tipificar esto más si es necesario
              assetProfile: {}, // Objeto AssetProfileData vacío
              defaultKeyStatistics: {}, // Objeto KeyStatisticsData vacío
              financialData: {}, // Objeto FinancialData vacío
              historical: [],
              financialHistory: [],
            } as QuoteSummaryResult, // Aseguramos que el tipo sea QuoteSummaryResult
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
