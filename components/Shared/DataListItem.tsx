// components/Shared/DataListItem/DataListItem.tsx
import {
  formatCurrency,
  formatPercentage,
  formatDate,
} from "../Shared/utils";

interface DataListItemProps {
  label: string;
  value: string | number | undefined | null;
  format?: "currency" | "percentage" | "number" | "date" | "text";
  currencySymbol?: string;
  highlight?: boolean;
}

export default function DataListItem({
  label,
  value,
  format = "text",
  currencySymbol = "€",
  highlight = true,
}: DataListItemProps) {
  if (value === null || value === undefined || value === "") return null;

  let formattedValue = value;

  switch (format) {
    case "currency":
      formattedValue =
        typeof value === "number" ? formatCurrency(value, currencySymbol) : "";
      break;
    case "percentage":
      formattedValue = typeof value === "number" ? formatPercentage(value) : "";
      break;
    case "number":
      formattedValue =
        typeof value === "number" ? value.toLocaleString() : value;
      break;
    case "date":
      formattedValue = typeof value === "number" ? formatDate(value) : "";
      break;
    case "text":
    default:
      formattedValue = String(value);
      break;
  }

  if (formattedValue === "") return null;

  return (
    <li className="mb-1">
      <span className="font-semibold">{label}:</span>{" "}
      {highlight ? (
        <span className="highlight-api">{formattedValue}</span>
      ) : (
        <span>{formattedValue}</span>
      )}
    </li>
  );
}
