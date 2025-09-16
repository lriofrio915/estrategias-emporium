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

interface IndicatorChartProps {
  indicator: ProcessedIndicator;
}

export const IndicatorChart: React.FC<IndicatorChartProps> = ({
  indicator,
}) => {
  if (!indicator.chartData || indicator.chartData.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 flex flex-col h-80">
        <h4 className="text-lg font-semibold text-white mb-2">
          {indicator.name}
        </h4>
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500">No hay datos para mostrar el gráfico.</p>
        </div>
      </div>
    );
  }

  const data = indicator.chartData.map((d) => ({
    date: d.date.toISOString().substring(0, 7), // Formato como YYYY-MM
    value: d.value,
  }));

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
              tickFormatter={(value) =>
                typeof value === "number" ? value.toLocaleString() : ""
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A202C",
                border: "1px solid #4A5568",
              }}
              labelStyle={{ color: "#E2E8F0" }}
              itemStyle={{ color: "#fff" }}
            />
            <Legend wrapperStyle={{ color: "#E2E8F0", fontSize: "12px" }} />
            <Line
              type="monotone"
              dataKey="value"
              name={indicator.id}
              stroke="#38B2AC"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
