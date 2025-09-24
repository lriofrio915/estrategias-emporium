// app/api/scrape-pmi-manufacturing/route.ts
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

  // Limpiar el texto y convertir a número
  const cleanedValue = value.replace(/[^\d.]/g, "");
  const parsed = parseFloat(cleanedValue);

  return isNaN(parsed) ? null : parsed;
}

export async function GET() {
  const url = "https://tradingeconomics.com/united-states/manufacturing-pmi";

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

    // --- NUEVA ESTRATEGIA MEJORADA ---

    // 1. Buscar el valor actual con patrones más específicos
    const actualMatch = cleanText.match(/Manufacturing PMI eased to ([\d.]+)/i);
    if (actualMatch && actualMatch[1]) {
      actualValue = safeParseFloat(actualMatch[1]);
    }

    // 2. Buscar el valor previo basado en el contexto
    const previousMatch = cleanText.match(/from.*? ([\d.]+)/i);
    if (previousMatch && previousMatch[1]) {
      previousValue = safeParseFloat(previousMatch[1]);
    }

    // 3. Determinar el valor de previsión
    if (cleanText.includes("in line with market forecasts")) {
      forecastValue = actualValue; // Si está en línea, la previsión es igual al valor actual
    } else {
      const forecastMatch = cleanText.match(/market forecasts of ([\d.]+)/i);
      if (forecastMatch && forecastMatch[1]) {
        forecastValue = safeParseFloat(forecastMatch[1]);
      }
    }

    // --- ESTRATEGIAS DE FALLBACK (SI LAS NUEVAS FALLAN) ---

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

    // ESTRATEGIA 4 (Fallback): Búsqueda en tablas
    if (actualValue === null || forecastValue === null) {
      $(".table-responsive, .table, .data-table, .economic-calendar").each(
        (i, table) => {
          const rows = $(table).find("tr");
          rows.each((j, row) => {
            const rowText = $(row).text();
            if (rowText.includes("Manufacturing") || rowText.includes("PMI")) {
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
                    actualValue = value;
                  } else if (
                    headerText.includes("forecast") ||
                    headerText.includes("estimate") ||
                    headerText.includes("preliminary")
                  ) {
                    forecastValue = value;
                  } else if (headerText.includes("previous")) {
                    previousValue = value;
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
          error: "No se pudo extraer el valor actual del PMI Manufacturero.",
          variable: "PMI Manufacturero",
          actualValue: null,
          forecastValue: null,
          sourceText: cleanText.substring(0, 500) + "...",
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ScrapedData>({
      variable: "PMI Manufacturero",
      actualValue,
      forecastValue,
      previousValue,
      sourceText: cleanText.substring(0, 300) + "...",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      "Error al hacer scraping del PMI Manufacturero:",
      errorMessage
    );

    return NextResponse.json<ScrapedData>(
      {
        error: `Fallo al obtener datos del PMI Manufacturero: ${errorMessage}`,
        variable: "PMI Manufacturero",
        actualValue: null,
        forecastValue: null,
      },
      { status: 500 }
    );
  }
}
