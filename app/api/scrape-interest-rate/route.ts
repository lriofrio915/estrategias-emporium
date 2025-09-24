// app/api/scrape-interest-rate/route.ts
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
  const url = "https://tradingeconomics.com/united-states/interest-rate"; // URL de Tasa de Interés

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

    // --- ESTRATEGIA MEJORADA ---
    // Patrones para el valor actual, priorizando los más específicos
    const actualValuePatterns = [
      // Nuevo patrón para "cut rates... bringing it to X%-Y% range"
      /bringing it to the [\d.]+?%–([\d.]+?)% range/i,
      // Patrón anterior para "held rates steady at X%–Y%"
      /held rates steady at\s+[\d.]+?%–([\d.]+?)%/i,
    ];

    for (const pattern of actualValuePatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        actualValue = parseFloat(match[1]);
        break; // Salir del bucle una vez que se encuentra una coincidencia
      }
    }

    // Lógica para encontrar la previsión
    if (
      actualValue !== null &&
      (cleanText.includes("in line with expectations") ||
        cleanText.includes("as expected"))
    ) {
      forecastValue = actualValue;
    } else {
      // Fallback si la previsión no está "en línea" y se menciona explícitamente
      const forecastExplicitMatch = cleanText.match(
        /(?:market expectations of|forecasts of)\s+([\d.]+?)%/i
      );
      if (forecastExplicitMatch && forecastExplicitMatch[1]) {
        forecastValue = parseFloat(forecastExplicitMatch[1]);
      }
    }

    // Fallback: buscar en tablas si las expresiones regulares no encuentran los valores
    if (actualValue === null || forecastValue === null) {
      $(".table-responsive .table-hover tbody tr").each((i, el) => {
        const variableName = $(el).find("td a").first().text().trim();
        if (variableName.includes("Interest Rate")) {
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
          return false; // Detener el bucle si ya encontramos los datos
        }
      });
    }

    if (actualValue === null || forecastValue === null) {
      console.warn(
        "No se pudieron encontrar ambos valores (actual y previsión) para la Tasa de Interés."
      );
      return NextResponse.json<ScrapedData>(
        {
          error: "No se pudieron extraer los datos de Tasa de Interés.",
          variable: "Tasa de Interés",
          actualValue: null,
          forecastValue: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ScrapedData>({
      variable: "Tasa de Interés",
      actualValue,
      forecastValue,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error al hacer scraping de Tasa de Interés:", errorMessage);
    return NextResponse.json<ScrapedData>(
      {
        error: `Fallo al obtener datos de Tasa de Interés: ${errorMessage}`,
        variable: "Tasa de Interés",
        actualValue: null,
        forecastValue: null,
      },
      { status: 500 }
    );
  }
}
