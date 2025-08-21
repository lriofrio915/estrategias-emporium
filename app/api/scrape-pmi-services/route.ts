// app/api/scrape-pmi-services/route.ts
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
  const url = "https://tradingeconomics.com/united-states/services-pmi"; // URL del PMI de Servicios

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

    // --- Extracción de valores usando expresiones regulares ---

    // Definir patrones de expresiones regulares para el valor actual
    // Se prueban en orden de prioridad, del más nuevo/específico al más general
    const actualValuePatterns = [
      // Nuevo patrón: "inched lower to X", "rose to X", "increased to X"
      /(?:inched lower to|rose to|increased to)\s+([\d.]+)/i,
      // Patrón existente: "flash estimate of X"
      /flash estimate of\s+([\d.]+)/i,
    ];

    // Definir patrones de expresiones regulares para el valor de previsión (forecast)
    // Se prueban en orden de prioridad, del más nuevo/específico al más general
    const forecastValuePatterns = [
      // Nuevo patrón: "market consensus of Y"
      /market consensus of\s+([\d.]+)/i,
      // Patrón existente: "initial market consensus of Y"
      /initial market consensus of\s+([\d.]+)/i,
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

    // Intentar extraer el valor de previsión usando los patrones definidos
    for (const pattern of forecastValuePatterns) {
      const match = pageText.match(pattern);
      if (match && match[1]) {
        forecastValue = parseFloat(match[1]);
        // Para depuración: console.log("Forecast Match (Regex):", match[1], "Parsed:", forecastValue);
        break; // Detenerse en el primer patrón que coincida
      }
    }

    // --- Fallback para buscar en tablas si las expresiones regulares no encontraron los valores ---
    // Esta lógica solo se ejecuta si los valores aún son null después de los intentos con regex
    if (actualValue === null || forecastValue === null) {
      $(".table-responsive .table-hover tbody tr").each((i, el) => {
        const variableName = $(el).find("td a").first().text().trim();
        if (variableName.includes("Services PMI")) {
          const values = $(el)
            .find("td")
            .map((j, td) => $(td).text().trim())
            .get();
          // Solo asignar si el valor aún no se ha encontrado por regex
          if (values[1] && actualValue === null) {
            actualValue = parseFloat(values[1].replace(",", "."));
            // Para depuración: console.log("Actual Match (Table Fallback):", values[1], "Parsed:", actualValue);
          }
          if (values[2] && forecastValue === null) {
            forecastValue = parseFloat(values[2].replace(",", "."));
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
        "No se pudieron encontrar ambos valores (actual y previsión) para el PMI de Servicios."
      );
      return NextResponse.json<ScrapedData>( // Tipado explícito de la respuesta
        {
          error:
            "No se pudieron extraer los datos del PMI de Servicios. El formato de la página puede haber cambiado o los valores no están presentes.",
          variable: "PMI de Servicios", // Proporcionar todas las propiedades de ScrapedData
          actualValue: null,
          forecastValue: null,
        },
        { status: 404 }
      );
    }

    // Si se encuentran los valores, devolverlos en la respuesta
    return NextResponse.json<ScrapedData>({
      // Tipado explícito de la respuesta
      variable: "PMI de Servicios",
      actualValue,
      forecastValue,
    });
  } catch (error: unknown) {
    // Captura y maneja cualquier error durante el proceso de scraping
    const errorMessage = error instanceof Error ? error.message : String(error); // Manejo seguro del tipo 'unknown'
    console.error(
      "Error al hacer scraping del PMI de Servicios:",
      errorMessage
    );
    return NextResponse.json<ScrapedData>( // Tipado explícito de la respuesta para el error
      {
        error: `Fallo al obtener datos del PMI de Servicios: ${errorMessage}. Verifique la URL o la conexión.`,
        variable: "PMI de Servicios", // Proporcionar todas las propiedades de ScrapedData
        actualValue: null,
        forecastValue: null,
      },
      { status: 500 }
    );
  }
}
