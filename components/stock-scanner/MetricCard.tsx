import React from "react";

interface MetricCardProps {
  title: string;
  value: number;
  format: "currency" | "number" | "percentage" | "currency_full";
  icon: React.ReactNode;
}

const formatValue = (
  value: number,
  format: MetricCardProps["format"]
): string => {
  if (value === null || value === undefined) return "N/A";
  try {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "USD",
          notation: "compact",
          compactDisplay: "short",
        }).format(value);
      case "currency_full":
        return new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
      case "percentage":
        return `${new Intl.NumberFormat("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value)}%`;
      case "number":
        return new Intl.NumberFormat("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
      default:
        return value.toString();
    }
  } catch {
    return "N/A";
  }
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  format,
  icon,
}) => {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg flex items-center space-x-4 transition hover:bg-slate-700 hover:border-cyan-500">
      <div className="rounded-lg bg-slate-700 p-3 text-cyan-400">{icon}</div>
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-xl font-bold text-slate-100">
          {formatValue(value, format)}
        </p>
      </div>
    </div>
  );
};

export default MetricCard;
