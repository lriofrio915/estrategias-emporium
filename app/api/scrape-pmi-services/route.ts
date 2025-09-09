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

    // ESTRATEGIA 2: Búsqueda con expresiones regulares mejoradas para el nuevo contexto
    const patterns = [
      // Patrones para valor actual (54.5)
      /(?:fell to|dropped to|declined to|decreased to|stood at|was|reached)\s+([\d.]+)/gi,
      /(?:Services PMI.*?)([\d.]+)(?:\s+in\s+\w+\s+\d{4})/gi,
      /(?:The.*?Services PMI.*?)([\d.]+)(?:\s+from)/gi,

      // Patrones para valor estimado/previo (55.7 y 55.4)
      /(?:from|compared to|against|versus)\s+([\d.]+)(?:\s+in the previous month)/gi,
      /(?:flash estimate of|preliminary estimate of|initial estimate of)\s+([\d.]+)/gi,
      /(?:revised.*?from.*?)([\d.]+)/gi,
      /(?:market expectations of|market consensus of|forecast of)\s+([\d.]+)/gi,
      /(?:year-to-date-high of|previous month.*?)([\d.]+)/gi,

      // Patrones específicos para el nuevo contexto
      /(?:fell to\s+[\d.]+).*?from.*?([\d.]+)(?:\s+in the previous month)/gi,
      /(?:revised lower from\s+)([\d.]+)/gi,
      /(?:remaining.*?ahead of.*?expectations of\s+)([\d.]+)/gi,
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
      const uniqueMatches = [...new Set(matches)];

      // Buscar contexto específico para determinar los valores
      if (actualValue === null) {
        // El valor actual suele ser el que sigue a "fell to", "dropped to", etc.
        const actualMatch = cleanText.match(
          /(fell to|dropped to|declined to|decreased to)\s+([\d.]+)/i
        );
        if (actualMatch && actualMatch[2]) {
          actualValue = safeParseFloat(actualMatch[2]);
        } else {
          // Si no hay contexto claro, tomar el valor más bajo (generalmente el actual)
          actualValue = Math.min(...uniqueMatches);
        }
      }

      if (forecastValue === null) {
        // Buscar específicamente el valor estimado en el contexto
        const estimateContext = cleanText.match(
          /(flash estimate of|preliminary estimate of|market expectations of)\s+([\d.]+)/i
        );
        if (estimateContext && estimateContext[2]) {
          forecastValue = safeParseFloat(estimateContext[2]);
        } else {
          // Si hay múltiples valores, el forecast suele ser el más alto
          forecastValue = Math.max(...uniqueMatches);
        }
      }
    }

    // ESTRATEGIA 3: Búsqueda específica para el contexto exacto proporcionado
    const specificPatterns = [
      /fell to ([\d.]+).*?from.*?([\d.]+).*?in the previous month.*?revised.*?from.*?flash estimate of ([\d.]+)/i,
      /fell to ([\d.]+).*?from.*?([\d.]+).*?previous month.*?flash estimate of ([\d.]+)/i,
      /fell to ([\d.]+).*?from.*?([\d.]+).*?market expectations of ([\d.]+)/i,
      /([\d.]+).*?from.*?([\d.]+).*?flash estimate.*?([\d.]+)/i,
    ];

    for (const pattern of specificPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        // Para patrones con 3 capturas: actual, previous, estimate
        if (match[1] && match[2] && match[3]) {
          actualValue = safeParseFloat(match[1]);
          previousValue = safeParseFloat(match[2]);
          forecastValue = safeParseFloat(match[3]);
          break;
        }
        // Para patrones con 2 capturas
        else if (match[1] && match[2]) {
          actualValue = safeParseFloat(match[1]);
          forecastValue = safeParseFloat(match[2]);
          break;
        }
      }
    }

    // ESTRATEGIA 4: Búsqueda en tablas (fallback robusto)
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
                    actualValue = value;
                  } else if (
                    headerText.includes("forecast") ||
                    headerText.includes("estimate") ||
                    headerText.includes("expectation")
                  ) {
                    forecastValue = value;
                  } else if (headerText.includes("previous")) {
                    previousValue = value;
                  }

                  // Si no hay headers claros, usar posición relativa
                  if (actualValue === null && k === 1) actualValue = value;
                  if (forecastValue === null && k === 2) forecastValue = value;
                  if (previousValue === null && k === 3) previousValue = value;
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

        // Patrones específicos para Services PMI
        const contentPatterns = [
          /Services PMI.*?fell to ([\d.]+).*?from.*?([\d.]+).*?flash estimate of ([\d.]+)/i,
          /Services PMI.*?([\d.]+).*?previous.*?([\d.]+).*?estimate.*?([\d.]+)/i,
          /Services PMI.*?([\d.]+).*?market expectations.*?([\d.]+)/i,
        ];

        for (const pattern of contentPatterns) {
          const match = content.match(pattern);
          if (match) {
            if (match[1]) actualValue = safeParseFloat(match[1]);
            if (match[2]) previousValue = safeParseFloat(match[2]);
            if (match[3]) forecastValue = safeParseFloat(match[3]);
            break;
          }
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
