// app/api/scrape-gdp/route.ts (Para Next.js App Router)
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
  const url = "https://tradingeconomics.com/united-states/gdp-growth"; // URL del PIB

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
    const pageText = $("body").text();
    if (actualValue === null) {
      // Expresión regular actualizada para el valor actual
      const actualMatch = pageText.match(
        /(?:expanded an annualized|grew an annualized|rose|increased|revised(?: slightly)? higher to|grew at an annualized rate of)\s+([\d.]+?)%/i
      );
      if (actualMatch && actualMatch[1]) {
        actualValue = parseFloat(actualMatch[1]);
      }
    }

    // Lógica para encontrar la previsión (estimación):
    // Nueva lógica para capturar "second estimate"
    const secondEstimateMatch = pageText.match(
      /(?:than|of)\s+([\d.]+?)%\s+in the second estimate/i
    );
    if (secondEstimateMatch && secondEstimateMatch[1]) {
      forecastValue = parseFloat(secondEstimateMatch[1]);
    } else {
      // Lógica existente como fallback
      const firstEstimateMatch = pageText.match(
        /first estimate of\s+([\d.]+?)%/i
      );
      if (firstEstimateMatch && firstEstimateMatch[1]) {
        forecastValue = parseFloat(firstEstimateMatch[1]);
      } else if (
        actualValue !== null &&
        pageText.includes("aligning with market expectations")
      ) {
        forecastValue = actualValue;
      } else {
        const forecastExplicitMatch = pageText.match(
          /(?:expectations of a|forecast of a|beating expectations of a)\s+([\d.]+?)%/i
        );
        if (forecastExplicitMatch && forecastExplicitMatch[1]) {
          forecastValue = parseFloat(forecastExplicitMatch[1]);
        }
      }
    }

    // Lógica 3: Buscar en la tabla como último recurso si las otras fallan
    if (actualValue === null || forecastValue === null) {
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
          return false; // Detener el bucle si se encuentran los valores
        }
      });
    }

    if (actualValue === null || forecastValue === null) {
      console.warn(
        "No se pudieron encontrar ambos valores (actual y previsión) para el PIB."
      );
      return NextResponse.json<ScrapedData>(
        {
          error: "No se pudieron extraer los datos de Crecimiento del PIB.",
          variable: "Crecimiento del PIB",
          actualValue: null,
          forecastValue: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ScrapedData>({
      variable: "Crecimiento del PIB",
      actualValue,
      forecastValue,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error al hacer scraping del PIB:", errorMessage);
    return NextResponse.json<ScrapedData>(
      {
        error: `Fallo al obtener datos de Crecimiento del PIB: ${errorMessage}`,
        variable: "Crecimiento del PIB",
        actualValue: null,
        forecastValue: null,
      },
      { status: 500 }
    );
  }
}
