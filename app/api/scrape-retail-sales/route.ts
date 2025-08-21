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
    // Para depuración: console.log("Texto completo de la página (primeros 500 caracteres):", pageText.substring(0, 500));

    // --- Extracción de valor actual ---
    // Definir patrones de expresiones regulares para el valor actual
    const actualValuePatterns = [
      // Patrón principal: "increased X%", "rose X%", "fell X%", "declined X%"
      /(?:increased|rose|fell|declined)\s+([\d.]+?)%/i,
    ];

    // Intentar extraer el valor actual usando los patrones definidos
    for (const pattern of actualValuePatterns) {
      const match = pageText.match(pattern);
      if (match && match[1]) {
        actualValue = parseFloat(match[1]);
        // Para depuración: console.log("Actual Match (Regex):", match[1], "Parsed:", actualValue);
        break; // Detenerse en el primer patrón que coincida
      }
    }

    // --- Extracción de valor de previsión ---

    // Prioridad 1 para la previsión: Manejar frases como "in line with market expectations"
    const marketExpectationsMatch = pageText.match(
      /(?:in line with|above|below) market expectations/i
    );
    if (marketExpectationsMatch && actualValue !== null) {
      // Si el texto indica que el valor actual está en línea con las expectativas (o por encima/por debajo),
      // y ya hemos encontrado el valor actual, asumimos que la previsión es ese mismo valor actual.
      forecastValue = actualValue;
      // Para depuración: console.log("Forecast Match (Market Expectations):", "Set to Actual Value:", forecastValue);
    }

    // Prioridad 2 para la previsión (solo si forecastValue aún no se ha encontrado):
    // Buscar un porcentaje explícito de previsión.
    if (forecastValue === null) {
      const explicitForecastPattern = /expectations of a\s+([\d.]+?)%\s+gain/i;
      const explicitForecastMatch = pageText.match(explicitForecastPattern);
      if (explicitForecastMatch && explicitForecastMatch[1]) {
        forecastValue = parseFloat(explicitForecastMatch[1]);
        // Para depuración: console.log("Forecast Match (Explicit Percentage):", explicitForecastMatch[1], "Parsed:", forecastValue);
      }
    }

    // --- Fallback para buscar en tablas si las expresiones regulares no encontraron los valores ---
    // Esta lógica solo se ejecuta si los valores aún son null después de los intentos con regex
    if (actualValue === null || forecastValue === null) {
      $(".table-responsive .table-hover tbody tr").each((i, el) => {
        const variableName = $(el).find("td a").first().text().trim();
        if (variableName.includes("Retail Sales")) {
          const values = $(el)
            .find("td")
            .map((j, td) => $(td).text().trim())
            .get();
          // Solo asignar si el valor actual aún no se ha encontrado por regex
          if (values[1] && actualValue === null) {
            actualValue = parseFloat(
              values[1].replace("%", "").replace(",", ".")
            );
            // Para depuración: console.log("Actual Match (Table Fallback):", values[1], "Parsed:", actualValue);
          }
          // Solo asignar si la previsión aún no se ha encontrado por regex
          if (values[2] && forecastValue === null) {
            forecastValue = parseFloat(
              values[2].replace("%", "").replace(",", ".")
            );
            // Para depuración: console.log("Forecast Match (Table Fallback):", values[2], "Parsed:", forecastValue);
          }
          // Si ambos valores se encuentran por tabla, podemos salir del bucle .each para optimizar
          if (actualValue !== null && forecastValue !== null) {
            return false; // Esto detiene la iteración de .each
          }
        }
      });
    }

    // --- Manejo de la respuesta ---

    // Si aún no se encuentran ambos valores, devolver un error
    if (actualValue === null || forecastValue === null) {
      console.warn(
        "No se pudieron encontrar ambos valores (actual y previsión) para las Ventas Minoristas."
      );
      return NextResponse.json<ScrapedData>( // Tipado explícito de la respuesta
        {
          error:
            "No se pudieron extraer los datos de Ventas Minoristas. El formato de la página puede haber cambiado o los valores no están presentes.",
          variable: "Ventas Minoristas", // Proporcionar todas las propiedades de ScrapedData
          actualValue: null,
          forecastValue: null,
        },
        { status: 404 }
      );
    }

    // Si se encuentran los valores, devolverlos en la respuesta
    return NextResponse.json<ScrapedData>({
      // Tipado explícito de la respuesta
      variable: "Ventas Minoristas",
      actualValue,
      forecastValue,
    });
  } catch (error: unknown) {
    // Captura y maneja cualquier error durante el proceso de scraping
    const errorMessage = error instanceof Error ? error.message : String(error); // Manejo seguro del tipo 'unknown'
    console.error(
      "Error al hacer scraping de Ventas Minoristas:",
      errorMessage
    );
    return NextResponse.json<ScrapedData>( // Tipado explícito de la respuesta para el error
      {
        error: `Fallo al obtener datos de Ventas Minoristas: ${errorMessage}. Verifique la URL o la conexión.`,
        variable: "Ventas Minoristas", // Proporcionar todas las propiedades de ScrapedData
        actualValue: null,
        forecastValue: null,
      },
      { status: 500 }
    );
  }
}
