"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ProcessedIndicator } from "../../lib/reccesion/types";

const INDICATOR_COLORS = {
  Adelantado: "#38B2AC",
  Coincidente: "#63B3ED",
  Mercado: "#4299E1",
  "Contra-cíclico": "#F56565",
  "Pro-cíclico": "#38B2AC",
  Neutral: "#A0AEC0",
  Error: "#4A5568",
};

interface IndicatorChartProps {
  indicator: ProcessedIndicator;
}

const formatAxisValue = (value: number | string): string => {
  if (typeof value !== "number") return String(value);
  if (Math.abs(value) >= 1_000_000_000)
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
};

// --- CORRECCIÓN 1: Se define una interfaz específica para las props del Tooltip ---
interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
    // ... y otras propiedades que Recharts pueda inyectar
  }[];
  label?: string | number;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700/80 backdrop-blur-sm p-3 rounded-lg border border-gray-600 shadow-lg">
        <p className="label text-gray-200">{`Fecha: ${label}`}</p>
        <p className="intro text-teal-300 font-semibold">{`${
          payload[0].name
        }: ${formatAxisValue(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

export const IndicatorChart: React.FC<IndicatorChartProps> = ({
  indicator,
}) => {
  if (indicator.error || !indicator.values || indicator.values.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 flex flex-col h-80">
        <h4 className="text-lg font-semibold text-white mb-2">
          {indicator.name}
        </h4>
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 text-center">
            {indicator.error
              ? `Error: ${indicator.error}`
              : "No hay datos para mostrar el gráfico."}
          </p>
        </div>
      </div>
    );
  }

  const data = indicator.values.map((d) => ({
    date: d.date.substring(0, 7),
    value: d.value,
  }));

  const lineColor = INDICATOR_COLORS[indicator.kind] || INDICATOR_COLORS.Error;

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-80 flex flex-col">
      <h4 className="text-lg font-semibold text-white mb-4">
        {indicator.name}
      </h4>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis
              dataKey="date"
              stroke="#A0AEC0"
              fontSize={12}
              tick={{ fill: "#A0AEC0" }}
            />
            <YAxis
              stroke="#A0AEC0"
              fontSize={12}
              tick={{ fill: "#A0AEC0" }}
              tickFormatter={formatAxisValue}
            />
            {/* 2. El componente Tooltip sigue usando nuestro CustomTooltip seguro */}
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: "#E2E8F0", fontSize: "12px" }} />
            <Line
              type="monotone"
              dataKey="value"
              name={indicator.id}
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: lineColor,
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
