// app/api/scrape-retail-sales/route.ts
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
  const url = "https://tradingeconomics.com/united-states/retail-sales"; // URL de Ventas Minoristas

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

    // --- NUEVA ESTRATEGIA PRIORITARIA ---
    // Patrón específico para el nuevo contexto: "increased X%... beating market expectations of a smaller Y% gain"
    const specificPattern =
      /(?:increased|rose|fell|declined)\s+([\d.]+?)%.*?(?:beating|missing|in line with) market expectations of a.*?([\d.]+?)%/i;
    const specificMatch = cleanText.match(specificPattern);

    if (specificMatch && specificMatch[1] && specificMatch[2]) {
      actualValue = parseFloat(specificMatch[1]);
      forecastValue = parseFloat(specificMatch[2]);
    }

    // --- ESTRATEGIAS DE FALLBACK (SI LA NUEVA FALLA) ---

    // Fallback 1: Buscar valor actual con patrones más generales si aún no se ha encontrado
    if (actualValue === null) {
      const actualValuePatterns = [
        /(?:increased|rose|fell|declined)\s+([\d.]+?)%/i,
      ];
      for (const pattern of actualValuePatterns) {
        const match = pageText.match(pattern);
        if (match && match[1]) {
          actualValue = parseFloat(match[1]);
          break;
        }
      }
    }

    // Fallback 2: Buscar previsión si aún no se ha encontrado
    if (forecastValue === null) {
      if (
        pageText.includes("in line with market expectations") &&
        actualValue !== null
      ) {
        forecastValue = actualValue;
      } else {
        const explicitForecastPattern =
          /expectations of a\s+([\d.]+?)%\s+gain/i;
        const explicitForecastMatch = pageText.match(explicitForecastPattern);
        if (explicitForecastMatch && explicitForecastMatch[1]) {
          forecastValue = parseFloat(explicitForecastMatch[1]);
        }
      }
    }

    // Fallback 3: Buscar en tablas si las expresiones regulares no encontraron los valores
    if (actualValue === null || forecastValue === null) {
      $(".table-responsive .table-hover tbody tr").each((i, el) => {
        const variableName = $(el).find("td a").first().text().trim();
        if (variableName.includes("Retail Sales")) {
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
        "No se pudieron encontrar ambos valores (actual y previsión) para las Ventas Minoristas."
      );
      return NextResponse.json<ScrapedData>(
        {
          error: "No se pudieron extraer los datos de Ventas Minoristas.",
          variable: "Ventas Minoristas",
          actualValue: null,
          forecastValue: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ScrapedData>({
      variable: "Ventas Minoristas",
      actualValue,
      forecastValue,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      "Error al hacer scraping de Ventas Minoristas:",
      errorMessage
    );
    return NextResponse.json<ScrapedData>(
      {
        error: `Fallo al obtener datos de Ventas Minoristas: ${errorMessage}.`,
        variable: "Ventas Minoristas",
        actualValue: null,
        forecastValue: null,
      },
      { status: 500 }
    );
  }
}
