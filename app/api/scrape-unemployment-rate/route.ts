// app/api/scrape-unemployment-rate/route.ts
import axios from "axios"; // Para hacer solicitudes HTTP
import * as cheerio from "cheerio"; // Para parsear el HTML
import { NextResponse } from "next/server"; // Para manejar las respuestas en App Router

// Definición de tipos para la respuesta de la API
interface ScrapedData {
  variable: string;
  actualValue: number | null;
  forecastValue: number | null;
  error?: string;
}

export async function GET() {
  const url = "https://tradingeconomics.com/united-states/unemployment-rate"; // URL de Tasa de Desempleo

  try {
    // Realizar la solicitud HTTP para obtener el HTML de la página
    const { data } = await axios.get(url, {
      headers: {
        // Es buena práctica incluir un User-Agent para simular un navegador real
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    // Cargar el HTML en Cheerio para facilitar la manipulación del DOM
    const $ = cheerio.load(data);

    let actualValue: number | null = null;
    let forecastValue: number | null = null;

    // Lógica 1: Extracción directa de la clase .actual-value
    const actualValueElement = $(".actual-value").first().text().trim();
    if (actualValueElement) {
      actualValue = parseFloat(
        actualValueElement.replace("%", "").replace(",", ".")
      );
    }

    // Lógica 2: Fallback buscando en el texto de la página
    if (actualValue === null) {
      const pageText = $("body").text();
      const actualMatch = pageText.match(
        /unemployment rate (?:rose to|was|stood at|reached)\s+([\d.]+?)%/i
      );
      if (actualMatch && actualMatch[1]) {
        actualValue = parseFloat(actualMatch[1]);
      }
    }

    // Lógica 3: Buscar en la tabla como último recurso si las otras fallan
    if (actualValue === null) {
      $(".table-responsive .table-hover tbody tr").each((i, el) => {
        const variableName = $(el).find("td a").first().text().trim();
        if (variableName.includes("Unemployment Rate")) {
          const values = $(el)
            .find("td")
            .map((j, td) => $(td).text().trim())
            .get();
          if (values[1]) {
            actualValue = parseFloat(
              values[1].replace("%", "").replace(",", ".")
            );
          }
          if (values[2]) {
            forecastValue = parseFloat(
              values[2].replace("%", "").replace(",", ".")
            );
          }
          return false;
        }
      });
    }

    // Lógica para encontrar la previsión:
    const pageText = $("body").text();
    if (
      actualValue !== null &&
      pageText.includes("aligning with market expectations")
    ) {
      forecastValue = actualValue;
    } else {
      const forecastExplicitMatch = pageText.match(
        /(?:market expectations of|forecasts of)\s+a\s+([\d.]+?)%/i
      );
      if (forecastExplicitMatch && forecastExplicitMatch[1]) {
        forecastValue = parseFloat(forecastExplicitMatch[1]);
      }
    }

    if (actualValue === null || forecastValue === null) {
      console.warn(
        "No se pudieron encontrar ambos valores (actual y previsión) para la Tasa de Desempleo."
      );
      return NextResponse.json<ScrapedData>(
        {
          error: "No se pudieron extraer los datos de Tasa de Desempleo.",
          variable: "Tasa de Desempleo",
          actualValue: null,
          forecastValue: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ScrapedData>({
      variable: "Tasa de Desempleo",
      actualValue,
      forecastValue,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      "Error al hacer scraping de Tasa de Desempleo:",
      errorMessage
    );
    return NextResponse.json<ScrapedData>(
      {
        error: `Fallo al obtener datos de Tasa de Desempleo: ${errorMessage}`,
        variable: "Tasa de Desempleo",
        actualValue: null,
        forecastValue: null,
      },
      { status: 500 }
    );
  }
}
