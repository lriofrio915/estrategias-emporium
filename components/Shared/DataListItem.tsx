// components/Shared/DataListItem/DataListItem.tsx
import { YahooFinanceRawValue } from "@/types/api";

interface DataListItemProps {
  label: string;
  value: string | number | YahooFinanceRawValue | undefined | null;
  format?: "currency" | "percentage" | "number" | "date" | "text";
  currencySymbol?: string;
  highlight?: boolean;
}

export default function DataListItem({
  label,
  value,
  format = "text",
  currencySymbol = "€",
}: DataListItemProps) {
  const getDisplayValue = (): string => {
    if (value === null || value === undefined) return "-";

    // Si es YahooFinanceRawValue, extraer el valor raw o usar fmt
    if (typeof value === "object" && value !== null && "raw" in value) {
      const yahooValue = value as YahooFinanceRawValue;

      switch (format) {
        case "currency":
          return (
            yahooValue.fmt ||
            `${currencySymbol}${yahooValue.raw?.toFixed(2) || "0.00"}`
          );
        case "percentage":
          return yahooValue.fmt || `${yahooValue.raw?.toFixed(2) || "0.00"}%`;
        case "number":
          return yahooValue.fmt || yahooValue.raw?.toString() || "0";
        default:
          return yahooValue.fmt || yahooValue.raw?.toString() || "-";
      }
    }

    // Si es string o number normal
    switch (format) {
      case "currency":
        return typeof value === "number"
          ? `${currencySymbol}${value.toFixed(2)}`
          : value || "-";
      case "percentage":
        return typeof value === "number"
          ? `${value.toFixed(2)}%`
          : value || "-";
      case "number":
        return typeof value === "number" ? value.toString() : value || "-";
      default:
        return value?.toString() || "-";
    }
  };

  return (
    <li className="flex justify-between items-center py-1">
      <span className="font-semibold">{label}:</span>
      <span className="text-blue-600 dark:text-blue-400 font-medium">
        {getDisplayValue()}
      </span>
    </li>
  );
}
