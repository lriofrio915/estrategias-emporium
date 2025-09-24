// app/api/scrape-pmi-services/route.ts
import axios from "axios";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

interface ScrapedData {
  variable: string;
  actualValue: number | null;
  forecastValue: number | null;
  previousValue?: number | null;
  sourceText?: string;
  error?: string;
}

// Función auxiliar para parsear valores numéricos de forma segura
function safeParseFloat(value: string | null | undefined): number | null {
  if (!value) return null;

  const cleanedValue = value.replace(/[^\d.]/g, "");
  const parsed = parseFloat(cleanedValue);

  return isNaN(parsed) ? null : parsed;
}

export async function GET() {
  const url = "https://tradingeconomics.com/united-states/services-pmi";

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    let actualValue: number | null = null;
    let forecastValue: number | null = null;
    let previousValue: number | null = null;

    // Obtener todo el texto del cuerpo para búsquedas avanzadas
    const pageText = $("body").text();
    const cleanText = pageText.replace(/\s+/g, " ").trim();

    // --- NUEVA ESTRATEGIA PRIORITARIA PARA EL CONTEXTO ACTUALIZADO ---

    // 1. Buscar el valor actual, previo y de previsión usando un patrón combinado y robusto.
    const combinedPattern =
      /PMI fell to ([\d.]+).*?from ([\d.]+).*?market expectations of ([\d.]+)/i;
    const combinedMatch = cleanText.match(combinedPattern);

    if (combinedMatch) {
      actualValue = safeParseFloat(combinedMatch[1]); // ej: 53.9
      previousValue = safeParseFloat(combinedMatch[2]); // ej: 54.5
      forecastValue = safeParseFloat(combinedMatch[3]); // ej: 54
    }

    // --- ESTRATEGIAS DE FALLBACK (SI LA ESTRATEGIA PRIORITARIA NO ENCUENTRA NADA) ---

    // ESTRATEGIA 1 (Fallback): Extracción directa de elementos HTML
    if (actualValue === null) {
      const actualValueElement = $(
        ".actual-value, .latest-value, .current-value, .value"
      )
        .first()
        .text()
        .trim();
      if (actualValueElement) {
        actualValue = safeParseFloat(actualValueElement);
      }
    }

    // ESTRATEGIA 2 (Fallback): Búsqueda con expresiones regulares generales
    if (
      actualValue === null ||
      forecastValue === null ||
      previousValue === null
    ) {
      const patterns = [
        /(?:fell to|dropped to|declined to|decreased to|stood at|was|reached)\s+([\d.]+)/i,
        /(?:market expectations of|forecast of)\s+([\d.]+)/i,
        /from\s+([\d.]+)\s+in the previous month/i,
      ];

      const actualMatch = cleanText.match(patterns[0]);
      if (actualValue === null && actualMatch && actualMatch[1]) {
        actualValue = safeParseFloat(actualMatch[1]);
      }

      const forecastMatch = cleanText.match(patterns[1]);
      if (forecastValue === null && forecastMatch && forecastMatch[1]) {
        forecastValue = safeParseFloat(forecastMatch[1]);
      }

      const previousMatch = cleanText.match(patterns[2]);
      if (previousValue === null && previousMatch && previousMatch[1]) {
        previousValue = safeParseFloat(previousMatch[1]);
      }
    }

    // Lógica adicional para "aligned with" si no se encontró un forecast explícito
    if (
      forecastValue === null &&
      actualValue !== null &&
      (cleanText.includes("aligned with market expectations") ||
        cleanText.includes("in line with market expectations"))
    ) {
      forecastValue = actualValue;
    }

    // ESTRATEGIA 4 (Fallback): Búsqueda en tablas
    if (actualValue === null || forecastValue === null) {
      $(".table-responsive, .table, .data-table, .economic-calendar").each(
        (i, table) => {
          const rows = $(table).find("tr");

          rows.each((j, row) => {
            const rowText = $(row).text();
            if (rowText.includes("Services") || rowText.includes("PMI")) {
              const cells = $(row).find("td, th");

              cells.each((k, cell) => {
                const cellText = $(cell).text().trim();
                const numberMatch = cellText.match(/([\d.]+)/);

                if (numberMatch) {
                  const value = safeParseFloat(numberMatch[1]);
                  if (value === null) return;

                  const headerText = $(table)
                    .find("th")
                    .eq(k)
                    .text()
                    .toLowerCase();

                  if (
                    headerText.includes("actual") ||
                    headerText.includes("latest")
                  ) {
                    if (actualValue === null) actualValue = value;
                  } else if (
                    headerText.includes("forecast") ||
                    headerText.includes("estimate") ||
                    headerText.includes("expectation")
                  ) {
                    if (forecastValue === null) forecastValue = value;
                  } else if (headerText.includes("previous")) {
                    if (previousValue === null) previousValue = value;
                  }
                }
              });
            }
          });
        }
      );
    }

    // Validación y limpieza final de valores
    if (actualValue !== null && (actualValue < 0 || actualValue > 100)) {
      console.warn("Valor actual fuera de rango probable:", actualValue);
      actualValue = null;
    }

    if (forecastValue !== null && (forecastValue < 0 || forecastValue > 100)) {
      console.warn("Valor estimado fuera de rango probable:", forecastValue);
      forecastValue = null;
    }

    // Manejo de la respuesta
    if (actualValue === null) {
      return NextResponse.json<ScrapedData>(
        {
          error: "No se pudo extraer el valor actual del PMI de Servicios.",
          variable: "PMI de Servicios",
          actualValue: null,
          forecastValue: null,
          sourceText: cleanText.substring(0, 500) + "...",
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ScrapedData>({
      variable: "PMI de Servicios",
      actualValue,
      forecastValue,
      previousValue,
      sourceText: cleanText.substring(0, 300) + "...",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      "Error al hacer scraping del PMI de Servicios:",
      errorMessage
    );

    return NextResponse.json<ScrapedData>(
      {
        error: `Fallo al obtener datos del PMI de Servicios: ${errorMessage}`,
        variable: "PMI de Servicios",
        actualValue: null,
        forecastValue: null,
      },
      { status: 500 }
    );
  }
}
