import type { Indicator } from "./types";

export const SERIES: Indicator[] = [
  {
    id: "USSLIND",
    name: "LEI (Leading Index, USSLIND)",
    kind: "Adelantado",
    freq_hint: "M",
    fred_url: "https://fred.stlouisfed.org/series/USSLIND",
  },
  {
    id: "USALOLITOAASTSAM",
    name: "OECD CLI (Amplitude Adj.)",
    kind: "Adelantado",
    freq_hint: "M",
    fred_url: "https://fred.stlouisfed.org/series/USALOLITOAASTSAM",
  },
  {
    id: "SP500",
    name: "S&P 500 (Price)",
    kind: "Mercado",
    freq_hint: "D",
    fred_url: "https://fred.stlouisfed.org/series/SP500",
  },
  {
    id: "CP",
    name: "Corporate Profits (after tax)",
    kind: "Coincidente",
    freq_hint: "Q",
    fred_url: "https://fred.stlouisfed.org/series/CP",
  },
  {
    id: "INDPRO",
    name: "Industrial Production (INDPRO)",
    kind: "Coincidente",
    freq_hint: "M",
    fred_url: "https://fred.stlouisfed.org/series/INDPRO",
  },
];
