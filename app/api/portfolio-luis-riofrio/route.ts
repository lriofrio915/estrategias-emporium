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

    // Para cada ticker, obtenemos tanto el quoteSummary como los datos históricos
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
          ],
        });

        // Obtener datos históricos - 5 años de datos para tener suficiente historial
        const today = new Date();
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(today.getFullYear() - 5);

        const historicalData = await yahooFinance.historical(ticker, {
          period1: fiveYearsAgo, // ← 5 años atrás
          period2: today,
          interval: "1d", // Datos diarios
        });

        return {
          ticker: ticker,
          data: {
            ...quoteSummary,
            historical: historicalData,
          },
        };
      } catch (error) {
        console.error(`Error fetching data for ${ticker}:`, error);
        // Si hay error con datos históricos, devolver solo quoteSummary
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
              historical: [], // Devolver array vacío si hay error
            },
          };
        } catch (innerError) {
          console.error(
            `Error fetching quote summary for ${ticker}:`,
            innerError
          );
          return {
            ticker: ticker,
            data: {
              historical: [],
            },
          };
        }
      }
    });

    const results = await Promise.all(promises);

    // Formateamos la respuesta
    const data = results.map((result) => {
      return {
        ticker: result.ticker,
        data: result.data,
      };
    });

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
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
