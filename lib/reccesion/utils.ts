import { Indicator, FredObservation, ProcessedIndicator } from "./types";

export function processFredData(
  indicator: Indicator,
  observations: FredObservation[]
): ProcessedIndicator {
  // Filtrar valores "." que FRED a veces envía
  const validObservations = observations.filter((obs) => obs.value !== ".");

  if (validObservations.length < 13) {
    // Necesitamos al menos 13 meses de datos para calcular YoY y aceleración
    return {
      ...indicator,
      latest_value: NaN,
      latest_date: "Datos insuficientes",
      yoy: NaN,
      mom: NaN,
      accel: NaN,
      phase: "Error",
      values: [],
      error: "Datos insuficientes para el análisis.",
    };
  }

  const values = validObservations.map((obs) => ({
    date: obs.date,
    value: parseFloat(obs.value),
  }));

  const latest = values[0];
  const prev = values[1];
  const yearAgo = values[12];
  const yearAgoPrev = values[13]; // Para la aceleración

  const latest_value = latest.value;
  const latest_date = new Date(latest.date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Cambio Secuencial (MoM/QoQ)
  const mom = prev
    ? ((latest_value - prev.value) / Math.abs(prev.value)) * 100
    : NaN;

  // Cambio Interanual (YoY)
  const yoy = yearAgo
    ? ((latest_value - yearAgo.value) / Math.abs(yearAgo.value)) * 100
    : NaN;

  // Aceleración (cambio en el YoY)
  const prevYoy = yearAgoPrev
    ? ((prev.value - yearAgoPrev.value) / Math.abs(yearAgoPrev.value)) * 100
    : NaN;
  const accel = !isNaN(yoy) && !isNaN(prevYoy) ? yoy - prevYoy : NaN;

  // Determinar la fase del ciclo económico
  let phase: ProcessedIndicator["phase"] = "Error";
  if (!isNaN(yoy) && !isNaN(accel)) {
    if (yoy > 0 && accel > 0) phase = "Fase 1"; // Expansión Acelerada
    else if (yoy > 0 && accel < 0) phase = "Fase 2"; // Expansión Desacelerada
    else if (yoy < 0 && accel < 0) phase = "Fase 3"; // Contracción Acelerada
    else if (yoy < 0 && accel > 0) phase = "Fase 4"; // Contracción Desacelerada
    else phase = "Neutral";
  }

  return {
    ...indicator,
    latest_value,
    latest_date,
    yoy,
    mom,
    accel,
    phase,
    values: values.reverse(), // revertir para que los gráficos tengan el orden cronológico correcto
  };
}
