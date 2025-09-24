// app/api/scrape-inflation/route.ts
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
  const url = "https://tradingeconomics.com/united-states/inflation-cpi"; // URL de Inflación (CPI)

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

    // Obtener todo el texto del cuerpo de la página para buscar los valores
    const pageText = $("body").text();
    const cleanText = pageText.replace(/\s+/g, " ").trim();

    // --- Extracción de valor actual ---
    // Se añaden patrones más específicos para capturar diferentes redacciones.
    const actualValuePatterns = [
      // Patrón para "accelerated to X%"
      /annual inflation rate accelerated to ([\d.]+?)%/i,
      // Patrón para "remained at X%" o "stood at X%"
      /annual inflation rate\s*(?:remained at|stood at)\s+([\d.]+?)%/i,
      // Patrón genérico para "The annual inflation rate... to X%"
      /The annual inflation rate.*?to\s+([\d.]+?)%/i,
    ];

    // Intentar extraer el valor actual usando los patrones definidos
    for (const pattern of actualValuePatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        actualValue = parseFloat(match[1]);
        break; // Detenerse en el primer patrón que coincida
      }
    }

    // --- Extracción de valor de previsión ---
    // Si el texto indica que el dato está "en línea con las expectativas", la previsión es igual al valor actual.
    if (
      actualValue !== null &&
      (cleanText.includes("in line with market expectations") ||
        cleanText.includes("matching expectations"))
    ) {
      forecastValue = actualValue;
    } else {
      // Si no, se busca un valor explícito de previsión.
      const explicitForecastPattern =
        /(?:below|above)?\s*forecasts of\s+([\d.]+?)%/i;
      const explicitForecastMatch = cleanText.match(explicitForecastPattern);
      if (explicitForecastMatch && explicitForecastMatch[1]) {
        forecastValue = parseFloat(explicitForecastMatch[1]);
      }
    }

    // --- Fallback: buscar en tablas si las expresiones regulares fallan ---
    if (actualValue === null || forecastValue === null) {
      $(".table-responsive .table-hover tbody tr").each((i, el) => {
        const variableName = $(el).find("td a").first().text().trim();
        if (
          variableName.includes("Inflation Rate") ||
          variableName.includes("CPI")
        ) {
          const values = $(el)
            .find("td")
            .map((j, td) => $(td).text().trim())
            .get();

          if (values[1] && actualValue === null) {
            actualValue = parseFloat(
              values[1].replace("%", "").replace(",", ".")
            );
          }
          if (values[2] && forecastValue === null) {
            forecastValue = parseFloat(
              values[2].replace("%", "").replace(",", ".")
            );
          }
          if (actualValue !== null && forecastValue !== null) {
            return false;
          }
        }
      });
    }

    // --- Manejo de la respuesta ---

    if (actualValue === null || forecastValue === null) {
      console.warn(
        "No se pudieron encontrar ambos valores (actual y previsión) para la Inflación."
      );
      return NextResponse.json<ScrapedData>(
        {
          error: "No se pudieron extraer los datos de Inflación.",
          variable: "Inflación",
          actualValue: null,
          forecastValue: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ScrapedData>({
      variable: "Inflación",
      actualValue,
      forecastValue,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error al hacer scraping de Inflación:", errorMessage);
    return NextResponse.json<ScrapedData>(
      {
        error: `Fallo al obtener datos de Inflación: ${errorMessage}.`,
        variable: "Inflación",
        actualValue: null,
        forecastValue: null,
      },
      { status: 500 }
    );
  }
}
