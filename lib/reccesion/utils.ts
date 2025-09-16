// Contiene las funciones para procesar y calcular métricas a partir de los datos crudos.
import type { IndicatorData } from "./types";

/**
 * Calcula YoY, cambio secuencial y aceleración para una serie de datos.
 */
export function computeChanges(
  dfRaw: IndicatorData[],
  freq: "m" | "q"
): IndicatorData[] {
  const period = freq === "m" ? 12 : 4;
  const df = [...dfRaw].sort((a, b) => a.date.getTime() - b.date.getTime());

  for (let i = 0; i < df.length; i++) {
    // YoY Pct Change
    if (i >= period) {
      const prevYearValue = df[i - period].value;
      if (prevYearValue !== 0) {
        df[i].pct_chg_yoy =
          ((df[i].value - prevYearValue) / Math.abs(prevYearValue)) * 100;
      }
    }
    // Sequential Pct Change
    if (i >= 1) {
      const prevValue = df[i - 1].value;
      if (prevValue !== 0) {
        df[i].pct_chg_seq =
          ((df[i].value - prevValue) / Math.abs(prevValue)) * 100;
      }
    }
    // YoY Acceleration
    if (i >= period * 2) {
      const prevYoy = df[i - period].pct_chg_yoy;
      if (df[i].pct_chg_yoy !== undefined && prevYoy !== undefined) {
        df[i].yoy_accel = df[i].pct_chg_yoy! - prevYoy;
      }
    }
  }
  return df;
}

/**
 * Determina la fase del ciclo económico para un indicador.
 */
export function phaseColor(
  id: string,
  kind: string,
  yoy: number,
  accel: number
): string {
  if (isNaN(yoy) || isNaN(accel)) return "⚪️";

  const proCyclical = kind === "Pro-cíclico";
  const isHousing = ["HOUST", "PERMIT"].includes(id);

  if (proCyclical || isHousing) {
    if (yoy > 0 && accel > 0) return "🟢"; // Expansión Acelerada
    if (yoy > 0 && accel <= 0) return "🟡"; // Expansión Desacelerada
    if (yoy <= 0 && accel <= 0) return "🔴"; // Contracción
    if (yoy <= 0 && accel > 0) return "🟠"; // Recuperación
  } else {
    // Contra-cíclico
    if (yoy > 0 && accel > 0) return "🔴";
    if (yoy > 0 && accel <= 0) return "🟠";
    if (yoy <= 0 && accel <= 0) return "🟢";
    if (yoy <= 0 && accel > 0) return "🟡";
  }
  return "⚪️"; // Default
}
