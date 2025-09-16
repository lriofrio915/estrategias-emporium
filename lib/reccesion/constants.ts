// Define los indicadores económicos que se mostrarán en el dashboard.
import type { Indicator } from "./types";

export const SERIES: Indicator[] = [
  {
    id: "PAYEMS",
    name: "Nóminas No Agrícolas",
    kind: "Pro-cíclico",
    freq_hint: "m",
    fred_url: "https://fred.stlouisfed.org/series/PAYEMS",
  },
  {
    id: "ICSA",
    name: "Peticiones de Desempleo",
    kind: "Contra-cíclico",
    freq_hint: "m",
    fred_url: "https://fred.stlouisfed.org/series/ICSA",
  },
  {
    id: "INDPRO",
    name: "Producción Industrial",
    kind: "Pro-cíclico",
    freq_hint: "m",
    fred_url: "https://fred.stlouisfed.org/series/INDPRO",
  },
  {
    id: "T5YIFR",
    name: "Tasa Inflación 5 Años",
    kind: "Neutral",
    freq_hint: "m",
    fred_url: "https://fred.stlouisfed.org/series/T5YIFR",
  },
  {
    id: "UNRATE",
    name: "Tasa de Desempleo",
    kind: "Contra-cíclico",
    freq_hint: "m",
    fred_url: "https://fred.stlouisfed.org/series/UNRATE",
  },
];
