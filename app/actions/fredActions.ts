"use server";

import { SERIES } from "@/lib/reccesion/constants";
import { FredSeriesResponse, ProcessedIndicator } from "@/lib/reccesion/types";
import { processFredData } from "@/lib/reccesion/utils";

// Variable de entorno para la clave de la API de FRED
const API_KEY = process.env.FRED_API_KEY;
const API_URL = "https://api.stlouisfed.org/fred/series/observations";

/**
 * Obtiene los datos de una serie específica desde la API de FRED.
 * Se ajusta el tipo de retorno para manejar errores de forma explícita.
 */
async function getFredSeriesData(
  seriesId: string
): Promise<Partial<FredSeriesResponse>> {
  // <-- CORRECCIÓN 1: Se usa Partial para el tipo de retorno
  if (!API_KEY) {
    throw new Error("La variable de entorno FRED_API_KEY no está configurada.");
  }

  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 15);
  const observation_start = tenYearsAgo.toISOString().split("T")[0];

  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: API_KEY,
    file_type: "json",
    observation_start: observation_start,
    sort_order: "desc",
  });

  const url = `${API_URL}?${params.toString()}`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error de FRED para ${seriesId}: ${
          errorData.error_message || response.statusText
        }`
      );
    }
    return await response.json();
  } catch (error) {
    console.error(`Fallo al obtener datos para la serie ${seriesId}:`, error);
    const message =
      error instanceof Error
        ? error.message
        : `Fallo al obtener la serie ${seriesId}`;
    return { error_message: message };
  }
}

/**
 * Server Action principal que obtiene y procesa los datos para todos los indicadores.
 */
export async function fetchAllFredSeries(): Promise<{
  data?: ProcessedIndicator[];
  error?: string;
}> {
  const allSeriesPromises = SERIES.map((indicator) =>
    getFredSeriesData(indicator.id)
  );

  try {
    const results = await Promise.allSettled(allSeriesPromises);

    const processedData: ProcessedIndicator[] = results.map((result, index) => {
      // <-- CORRECCIÓN 2: Tipado explícito para processedData
      const indicator = SERIES[index];

      if (result.status === "fulfilled" && result.value.observations) {
        return processFredData(indicator, result.value.observations);
      } else {
        // La llamada falló, devolvió un error, o no tiene observaciones
        console.warn(
          `No se pudieron procesar los datos para ${indicator.name}.`
        );

        // <-- CORRECCIÓN 3: Manejo seguro de 'fulfilled' vs 'rejected'
        const errorReason =
          result.status === "rejected"
            ? result.reason?.toString()
            : result.value.error_message || "Datos no disponibles";

        return {
          ...indicator,
          latest_value: NaN,
          latest_date: "Error",
          yoy: NaN,
          mom: NaN,
          accel: NaN,
          phase: "Error", // Se mantiene como el literal string
          values: [],
          error: errorReason,
        };
      }
    });

    return { data: processedData };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error desconocido al procesar las series de FRED.";
    console.error(message);
    return { error: message };
  }
}
