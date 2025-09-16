// Define las interfaces para los datos del dashboard.

// Estructura de un punto de datos individual de la API de FRED
export interface FredObservation {
  date: string;
  value: string;
}

// Estructura de la respuesta completa de la API de FRED
export interface FredApiResponse {
  observations: FredObservation[];
}

// Estructura de un punto de datos procesado para usar en gráficos
export interface IndicatorData {
  date: Date;
  value: number;
  pct_chg_yoy?: number; // Cambio Año sobre Año
  pct_chg_seq?: number; // Cambio Secuencial (ej. Mes sobre Mes)
  yoy_accel?: number; // Aceleración del cambio YoY
}

// Configuración base para cada indicador económico
export interface Indicator {
  id: string; // FRED Series ID
  name: string;
  kind: "Pro-cíclico" | "Contra-cíclico" | "Neutral";
  freq_hint: "m" | "q"; // 'm' para mensual, 'q' para trimestral
  fred_url: string;
}

// El objeto final que combina la configuración con los datos procesados
export interface ProcessedIndicator extends Indicator {
  latest_date: string;
  latest_value: number;
  yoy: number;
  mom: number;
  accel: number;
  phase: string; // Emoji de fase (🟢, 🟡, 🟠, 🔴)
  chartData: IndicatorData[];
}
