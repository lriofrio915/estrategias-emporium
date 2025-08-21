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
    // Para depuración: console.log("Texto completo de la página (primeros 500 caracteres):", pageText.substring(0, 500));

    // --- Extracción de valor actual ---
    // Definir patrones de expresiones regulares para el valor actual de la inflación anual.
    const actualValuePatterns = [
      // Nuevo patrón para "remained at X%" o "stood at X%"
      /annual inflation rate\s*(?:remained at|stood at)\s+([\d.]+?)%/i,
      // Patrón existente para "The annual inflation rate... to X%"
      /The annual inflation rate.*?to\s+([\d.]+?)%/i,
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

    // Prioridad 1 para la previsión: Buscar un porcentaje explícito en "forecasts of X%"
    const explicitForecastPattern =
      /(?:below|above)?\s*forecasts of\s+([\d.]+?)%/i;
    const explicitForecastMatch = pageText.match(explicitForecastPattern);
    if (explicitForecastMatch && explicitForecastMatch[1]) {
      forecastValue = parseFloat(explicitForecastMatch[1]);
      // Para depuración: console.log("Forecast Match (Explicit Percentage):", explicitForecastMatch[1], "Parsed:", forecastValue);
    }

    // Prioridad 2 para la previsión (solo si forecastValue aún no se ha encontrado):
    // Manejar frases como "in line with expectations" o "matching expectations"
    if (forecastValue === null && actualValue !== null) {
      if (
        pageText.includes("in line with expectations") ||
        pageText.includes("matching expectations")
      ) {
        forecastValue = actualValue;
        // Para depuración: console.log("Forecast Match (In line/Matching):", "Set to Actual Value:", forecastValue);
      }
    }

    // --- Fallback para buscar en tablas si las expresiones regulares no encontraron los valores ---
    // Esta lógica solo se ejecuta si los valores aún son null después de los intentos con regex
    if (actualValue === null || forecastValue === null) {
      $(".table-responsive .table-hover tbody tr").each((i, el) => {
        const variableName = $(el).find("td a").first().text().trim();
        // Buscar por "Inflation Rate" o "CPI" para asegurar que es la fila correcta
        if (
          variableName.includes("Inflation Rate") ||
          variableName.includes("CPI")
        ) {
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
        "No se pudieron encontrar ambos valores (actual y previsión) para la Inflación."
      );
      return NextResponse.json<ScrapedData>( // Tipado explícito de la respuesta
        {
          error:
            "No se pudieron extraer los datos de Inflación. El formato de la página puede haber cambiado o los valores no están presentes.",
          variable: "Inflación", // Proporcionar todas las propiedades de ScrapedData
          actualValue: null,
          forecastValue: null,
        },
        { status: 404 }
      );
    }

    // Si se encuentran los valores, devolverlos en la respuesta
    return NextResponse.json<ScrapedData>({
      // Tipado explícito de la respuesta
      variable: "Inflación",
      actualValue,
      forecastValue,
    });
  } catch (error: unknown) {
    // Captura y maneja cualquier error durante el proceso de scraping
    const errorMessage = error instanceof Error ? error.message : String(error); // Manejo seguro del tipo 'unknown'
    console.error("Error al hacer scraping de Inflación:", errorMessage);
    return NextResponse.json<ScrapedData>( // Tipado explícito de la respuesta para el error
      {
        error: `Fallo al obtener datos de Inflación: ${errorMessage}. Verifique la URL o la conexión.`,
        variable: "Inflación", // Proporcionar todas las propiedades de ScrapedData
        actualValue: null,
        forecastValue: null,
      },
      { status: 500 }
    );
  }
}
