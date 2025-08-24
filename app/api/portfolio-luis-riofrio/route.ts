import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(request: Request) {
  try {
    // Obtenemos los parámetros de consulta de la URL del objeto 'request'.
    // Esto resuelve la advertencia de 'request' no utilizado.
    const { searchParams } = new URL(request.url);
    // Extraemos todos los valores asociados con la clave 'tickers'.
    const tickers = searchParams.getAll('tickers');

    // Si no se proporcionaron tickers, devolvemos un error.
    if (tickers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No se proporcionaron tickers para consultar. Por favor, especifica al menos un ticker en los parámetros de consulta (ej: ?tickers=AAPL&tickers=MSFT).",
        },
        { status: 400 }
      );
    }

    // Para cada ticker recibido, obtenemos la información completa.
    // Incluimos solo los módulos necesarios para optimizar la llamada.
    const promises = tickers.map((ticker) =>
      yahooFinance.quoteSummary(ticker, {
        modules: [
          "price",          // Para precio actual y cambio diario
          "summaryDetail",  // Puede contener información adicional útil
          "assetProfile",   // Para sector e industria
        ],
      })
    );

    // Esperamos a que todas las promesas se resuelvan.
    const results = await Promise.all(promises);

    // Formateamos la respuesta para que sea más fácil de consumir.
    const data = results.map((result, index) => {
      const ticker = tickers[index];
      // Devolvemos el ticker y todos los datos recibidos, para que el frontend pueda extraer lo que necesite.
      return {
        ticker: ticker,
        data: result,
      };
    });

    // Retornamos la respuesta como un JSON.
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
