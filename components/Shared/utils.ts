import { GetRawValueReturnType, RawValueType } from "@/types/api";

// components/Shared/utils.ts
export const formatCurrency = (
  value: number,
  currencySymbol: string = "€"
): string => {
  return `${currencySymbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const getRawValue = (value: RawValueType): GetRawValueReturnType => {
  if (value === undefined || value === null) return value;
  if (typeof value === "number" || typeof value === "string") return value;
  if (typeof value === "object" && "raw" in value) return value.raw;
  return null;
};

export const parseFinanceDate = (dateInput: string | Date): Date => {
  if (dateInput instanceof Date) {
    return dateInput;
  }

  // Para strings en formato ISO (YYYY-MM-DD)
  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, month, day] = dateInput.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  // Para otros formatos de string
  const date = new Date(dateInput);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Fallback: fecha actual
  console.warn(`No se pudo parsear la fecha: ${dateInput}`);
  return new Date();
};

export const formatPercentage = (value: number): string => {
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString();
};