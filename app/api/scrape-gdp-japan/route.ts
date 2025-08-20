// app/api/scrape-gdp-japan/route.ts (Para Next.js App Router)
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
  const url = "https://tradingeconomics.com/japan/gdp-growth"; // URL del PIB de Japón

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

    // --- Lógica de Extracción Mejorada ---

    // 1. Búsqueda exhaustiva del Valor Actual
    // Intentamos buscar "grew X%", "rose X%", "decreased X%", etc.
    const actualMatch = pageText.match(
      /(?:grew|rose|increased|decreased|fell by|shrank by)\s+([\d.-]+?)%/i
    );
    if (actualMatch && actualMatch[1]) {
      actualValue = parseFloat(actualMatch[1]);
    } else if (pageText.includes("was flat in")) {
      actualValue = 0; // Capturar el caso especial "was flat"
    }

    // 2. Búsqueda exhaustiva del Valor de Previsión (Forecast)
    // Se agregan nuevas palabras clave como "consensus of" y "stood at"
    const forecastMatch = pageText.match(
      /(?:flash estimate of a|estimate of a|consensus of|stood at|forecast of a|beating expectations of a)\s+([\d.-]+?)%/i
    );
    if (forecastMatch && forecastMatch[1]) {
      forecastValue = parseFloat(forecastMatch[1]);
      // Ajustar si la previsión indica una contracción
      if (forecastMatch[0].includes("contraction") && forecastValue > 0) {
        forecastValue *= -1;
      }
    }

    // Fallback: Si las expresiones regulares no encuentran los valores, se busca en la tabla
    // Esto es un método muy fiable si la estructura de la tabla se mantiene.
    $(".table-responsive .table-hover tbody tr").each((i, el) => {
      const variableName = $(el).find("td a").first().text().trim();
      if (variableName.includes("GDP Growth Rate")) {
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
        return false; // Salir del bucle .each una vez encontrado
      }
    });

    // Manejar errores si los valores no se encuentran
    if (actualValue === null || forecastValue === null) {
      console.warn(
        "No se pudieron encontrar ambos valores (actual y previsión) para el PIB de Japón. Actual:", actualValue, "Forecast:", forecastValue
      );
      return NextResponse.json<ScrapedData>(
        {
          error: "No se pudieron extraer los datos de Crecimiento del PIB de Japón.",
          variable: "Crecimiento del PIB",
          actualValue: null,
          forecastValue: null
        },
        { status: 404 }
      );
    }

    // Devolver la respuesta exitosa
    return NextResponse.json<ScrapedData>({
      variable: "Crecimiento del PIB",
      actualValue,
      forecastValue,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error al hacer scraping del PIB de Japón:", errorMessage);
    return NextResponse.json<ScrapedData>(
      {
        error: `Fallo al obtener datos de Crecimiento del PIB de Japón: ${errorMessage}`,
        variable: "Crecimiento del PIB",
        actualValue: null,
        forecastValue: null
      },
      { status: 500 }
    );
  }
}