"use server";

import { computeChanges, phaseColor } from "../../lib/reccesion/utils";
import { SERIES } from "../../lib/reccesion/constants";
import type {
  IndicatorData,
  Indicator,
  ProcessedIndicator,
  FredApiResponse,
  FredObservation,
} from "../../lib/reccesion/types";

async function fetchFredSeries(seriesId: string): Promise<IndicatorData[]> {
  const apiKey = process.env.FRED_API_KEY; // Ya no necesita NEXT_PUBLIC_
  if (!apiKey) {
    throw new Error(
      "La clave de API de FRED no está configurada en el servidor."
    );
  }
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json`;

  try {
    const response = await fetch(url, { cache: "no-store" }); // Evitar cache para datos frescos
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({
          error_message: `Respuesta no válida del servidor para ${seriesId}`,
        }));
      throw new Error(
        errorData.error_message || `Error al obtener datos para ${seriesId}`
      );
    }
    const data: FredApiResponse = await response.json();
    return data.observations
      .map((obs: FredObservation) => ({
        date: new Date(obs.date),
        value: parseFloat(obs.value),
      }))
      .filter((obs) => !isNaN(obs.value));
  } catch (error) {
    console.error(`Fallo al obtener la serie ${seriesId}:`, error);
    throw error; // Re-lanzar el error para que sea capturado por el llamador
  }
}

export async function fetchAllFredSeries(): Promise<{
  data?: ProcessedIndicator[];
  error?: string;
}> {
  try {
    const dataPromises = SERIES.map(async (s: Indicator) => {
      const dfRaw = await fetchFredSeries(s.id);
      const df = computeChanges(dfRaw, s.freq_hint);

      const last = df.length > 0 ? df[df.length - 1] : null;
      const yoy = last?.pct_chg_yoy ?? NaN;
      const mom = last?.pct_chg_seq ?? NaN;
      const accel = last?.yoy_accel ?? NaN;
      const color = phaseColor(s.id, s.kind, yoy, accel);

      return {
        ...s,
        latest_date: last?.date.toISOString().split("T")[0] ?? "—",
        latest_value: last?.value ?? NaN,
        yoy,
        mom,
        accel,
        phase: color,
        chartData: df.slice(-120),
      };
    });

    const results = await Promise.all(dataPromises);
    return { data: results };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Ocurrió un error desconocido al obtener los datos de FRED.",
    };
  }
}
