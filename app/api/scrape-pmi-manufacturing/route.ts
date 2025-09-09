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

    // ESTRATEGIA 1: Extracción directa de elementos específicos
    const actualValueElement = $(
      ".actual-value, .latest-value, .current-value, .value"
    )
      .first()
      .text()
      .trim();
    if (actualValueElement) {
      actualValue = safeParseFloat(actualValueElement);
    }

    // ESTRATEGIA 2: Búsqueda con expresiones regulares mejoradas
    const patterns = [
      // Patrones para valor actual
      /(?:PMI.*?(?:stood at|was|rose to|increased to|fell to|reached|came in at)\s+)([\d.]+)/gi,
      /(?:Manufacturing PMI.*?)([\d.]+)(?:\s+in\s+\w+\s+\d{4})/gi,
      /(?:The.*?PMI.*?)([\d.]+)(?:\s+from)/gi,

      // Patrones para valor estimado/preliminar
      /(?:preliminary estimate of|preliminary reading of|initial estimate of|flash estimate of)\s+([\d.]+)/gi,
      /(?:from\s+)([\d.]+)(?:\s+in the preliminary estimate)/gi,
      /(?:down from|up from|compared to)\s+([\d.]+)(?:\s+preliminary)/gi,

      // Patrones para valor anterior
      /(?:from\s+)([\d.]+)(?:\s+in\s+\w+)/gi,
      /(?:up from|down from|compared to)\s+([\d.]+)(?:\s+in)/gi,
    ];

    const matches: number[] = [];

    // Buscar coincidencias en el texto
    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(cleanText)) !== null) {
        if (match[1]) {
          const parsedValue = safeParseFloat(match[1]);
          if (parsedValue !== null) {
            matches.push(parsedValue);
          }
        }
      }
    });

    // Procesar las coincidencias encontradas
    if (matches.length >= 2) {
      // Ordenar y deducir qué valor es actual y cuál es estimado
      const sortedMatches = [...new Set(matches)].sort((a, b) => b - a);

      if (actualValue === null && sortedMatches.length > 0) {
        actualValue = sortedMatches[0];
      }

      if (forecastValue === null && sortedMatches.length > 1) {
        // Buscar específicamente el valor estimado en el contexto
        const estimateContext = cleanText.match(
          /(preliminary|estimate|flash).*?([\d.]+)/i
        );
        if (estimateContext && estimateContext[2]) {
          forecastValue = safeParseFloat(estimateContext[2]);
        } else {
          forecastValue = sortedMatches[1];
        }
      }
    }

    // ESTRATEGIA 3: Búsqueda específica en el contexto del texto proporcionado
    const specificPatterns = [
      /stood at ([\d.]+).*?down.*?preliminary estimate of ([\d.]+)/i,
      /stood at ([\d.]+).*?from.*?preliminary.*?([\d.]+)/i,
      /([\d.]+).*?down from.*?preliminary.*?([\d.]+)/i,
      /([\d.]+).*?preliminary.*?([\d.]+)/i,
    ];

    for (const pattern of specificPatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1] && match[2]) {
        actualValue = safeParseFloat(match[1]);
        forecastValue = safeParseFloat(match[2]);
        break;
      }
    }

    // ESTRATEGIA 4: Búsqueda en tablas (fallback robusto)
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

                  // Si no hay headers claros, usar posición relativa
                  if (actualValue === null && k === 1) actualValue = value;
                  if (forecastValue === null && k === 2) forecastValue = value;
                }
              });
            }
          });
        }
      );
    }

    // ESTRATEGIA 5: Búsqueda en elementos de noticias o contenido principal
    $(".news-content, .article-content, .main-content, .economic-data").each(
      (i, element) => {
        const content = $(element).text();
        const contentMatch = content.match(
          /PMI.*?([\d.]+).*?preliminary.*?([\d.]+)/i
        );
        if (contentMatch && contentMatch[1] && contentMatch[2]) {
          actualValue = safeParseFloat(contentMatch[1]);
          forecastValue = safeParseFloat(contentMatch[2]);
        }
      }
    );

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
