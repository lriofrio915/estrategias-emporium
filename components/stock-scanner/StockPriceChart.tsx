import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { HistoricalPrice } from "@/types/stock-scanner";

interface StockPriceChartProps {
  data: HistoricalPrice[];
}

const StockPriceChart: React.FC<StockPriceChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg h-96 flex flex-col justify-center items-center text-center">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          Precio Histórico de la Acción (Año en curso)
        </h3>
        <p className="text-slate-400">
          No se encontraron datos de precios históricos para mostrar.
        </p>
      </div>
    );
  }

  const formattedData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((item) => {
      const dateObj = new Date(item.date);
      return {
        // Full date for the tooltip
        fullDate: dateObj.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }),
        // Shorter date for the X-axis labels, suitable for YTD data
        axisDate: dateObj.toLocaleDateString("es-ES", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }),
        close: item.close,
      };
    });

  const priceFormatter = (value: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(value);

  // Calculate a dynamic interval to avoid overcrowding X-axis labels. Aim for about 12 labels.
  const tickInterval =
    formattedData.length > 12 ? Math.floor(formattedData.length / 12) : 0;

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg h-96">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">
        Precio Histórico de la Acción (Año en curso)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 5, right: 20, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis
            dataKey="axisDate"
            stroke="#94a3b8"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={tickInterval}
          />
          <YAxis
            stroke="#94a3b8"
            domain={["auto", "auto"]}
            tickFormatter={priceFormatter}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334152",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ color: "#cbd5e1" }}
            itemStyle={{ color: "#22d3ee" }}
            formatter={(value: number) => [priceFormatter(value), "Precio"]}
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0) {
                return payload[0].payload.fullDate;
              }
              return label;
            }}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={false}
            name="Precio"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockPriceChart;
