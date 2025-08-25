// app/api/stocks/route.ts
import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

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
        // Obtener datos actuales con los módulos CORRECTOS
        const quoteSummary = await yahooFinance.quoteSummary(ticker, {
          modules: [
            "price",
            "summaryDetail",
            "assetProfile",
            "defaultKeyStatistics",
            "financialData",
            // Módulos CORREGIDOS para datos históricos
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
        const financialHistory = processFinancialHistory(quoteSummary);
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

        // Fallback: intentar obtener solo datos básicos
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

// Función CORREGIDA para procesar el historial financiero
function processFinancialHistory(quoteSummary: any): Array<{
  year: string;
  freeCashFlow: number;
  totalDebt: number;
  totalEquity: number;
  debtToEquity: number;
  operatingCashFlow?: number;
  capitalExpenditures?: number;
}> {
  try {
    const financialHistory = [];

    // VERIFICAR ESTRUCTURA DE DATOS
    console.log("Cashflow structure:", quoteSummary.cashflowStatementHistory);
    console.log("Balance sheet structure:", quoteSummary.balanceSheetHistory);

    // Obtener datos de cashflow - estructura CORRECTA
    const cashflowStatements =
      quoteSummary.cashflowStatementHistory?.cashflowStatements || [];
    const balanceSheets = quoteSummary.balanceSheetHistory?.balanceSheets || [];

    console.log(`Cashflow statements: ${cashflowStatements.length}`);
    console.log(`Balance sheets: ${balanceSheets.length}`);

    // Mapear años disponibles
    const yearsData: { [key: string]: any } = {};

    // Procesar cashflow statements
    cashflowStatements.forEach((statement: any) => {
      const date = statement.endDate;
      if (date && date.fmt) {
        const year = date.fmt.substring(0, 4);
        yearsData[year] = {
          ...yearsData[year],
          year: year,
          freeCashFlow:
            statement.freeCashFlow?.raw || statement.freeCashflow?.raw || 0,
          operatingCashFlow:
            statement.operatingCashFlow?.raw ||
            statement.operatingCashflow?.raw ||
            0,
          capitalExpenditures: statement.capitalExpenditures?.raw || 0,
        };
      }
    });

    // Procesar balance sheets
    balanceSheets.forEach((balance: any) => {
      const date = balance.endDate;
      if (date && date.fmt) {
        const year = date.fmt.substring(0, 4);
        yearsData[year] = {
          ...yearsData[year],
          year: year,
          totalDebt: balance.totalDebt?.raw || 0,
          totalEquity:
            balance.totalStockholderEquity?.raw ||
            balance.totalEquity?.raw ||
            0,
          totalAssets: balance.totalAssets?.raw || 0,
        };
      }
    });

    // Crear array con datos combinados
    for (const year in yearsData) {
      const data = yearsData[year];
      const debtToEquity =
        data.totalEquity > 0 ? (data.totalDebt / data.totalEquity) * 100 : 0;

      financialHistory.push({
        year: data.year,
        freeCashFlow: data.freeCashFlow || 0,
        totalDebt: data.totalDebt || 0,
        totalEquity: data.totalEquity || 0,
        debtToEquity: parseFloat(debtToEquity.toFixed(2)),
        operatingCashFlow: data.operatingCashFlow,
        capitalExpenditures: data.capitalExpenditures,
      });
    }

    // Ordenar por año (más reciente primero)
    return financialHistory
      .sort((a, b) => parseInt(b.year) - parseInt(a.year))
      .slice(0, 10);
  } catch (error) {
    console.error("Error processing financial history:", error);
    return [];
  }
}
