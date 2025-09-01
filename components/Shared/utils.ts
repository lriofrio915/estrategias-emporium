// components/Shared/utils.ts

import { YahooFinanceRawValue } from "@/types/api";

export const formatCurrency = (
  value: number | YahooFinanceRawValue | null | undefined,
  currencySymbol: string = "€"
) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && value !== null) {
    if (value.raw !== undefined) {
      return `${currencySymbol}${value.raw.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    // Si no hay raw, intenta usar fmt (si existe)
    if (value.fmt) {
      return `${currencySymbol}${value.fmt}`;
    }
    return "";
  }

  return `${currencySymbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatPercentage = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "";
  return `${(value * 100).toFixed(2)}%`;
};

export const formatDate = (timestamp: number | null | undefined) => {
  if (timestamp === null || timestamp === undefined) return "";
  const dateValue = timestamp < 1000000000000 ? timestamp * 1000 : timestamp;
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString();
};

export const getChangeColorClass = (change: number | null | undefined) => {
  if (change === null || change === undefined) return "text-gray-600";
  return change > 0
    ? "text-green-600"
    : change < 0
    ? "text-red-600"
    : "text-gray-600";
};

// La corrección está en el tipo 'dateValue'
export const parseFinanceDate = (dateValue: unknown): Date => {
  if (dateValue instanceof Date) {
    return dateValue;
  }

  if (typeof dateValue === "number") {
    return new Date(dateValue < 1000000000000 ? dateValue * 1000 : dateValue);
  }

  if (typeof dateValue === "string") {
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  console.warn("No se pudo parsear la fecha:", dateValue);
  return new Date();
};
