// Describe un indicador definido en constants.ts
export interface Indicator {
  id: string;
  name: string;
  kind:
    | "Adelantado"
    | "Coincidente"
    | "Mercado"
    | "Contra-cíclico"
    | "Pro-cíclico"
    | "Neutral";
  freq_hint: "D" | "W" | "M" | "Q" | "A";
  fred_url: string;
}

// Describe una observación individual de la API de FRED
export interface FredObservation {
  realtime_start: string;
  realtime_end: string;
  date: string;
  value: string;
}

// Describe la respuesta completa de la API de FRED
export interface FredSeriesResponse {
  realtime_start: string;
  realtime_end: string;
  observation_start: string;
  observation_end: string;
  units: string;
  output_type: number;
  file_type: string;
  order_by: string;
  sort_order: string;
  count: number;
  offset: number;
  limit: number;
  observations: FredObservation[];
  error_message?: string;
}

// Describe la estructura de datos después de ser procesada por nuestras utilidades
export interface ProcessedIndicator extends Indicator {
  latest_value: number;
  latest_date: string;
  yoy: number; // Cambio interanual
  mom: number; // Cambio secuencial (mes a mes, trimestre a trimestre)
  accel: number; // Aceleración del cambio interanual
  phase: "Fase 1" | "Fase 2" | "Fase 3" | "Fase 4" | "Error" | "Neutral";
  values: { date: string; value: number }[];
  error?: string;
}
