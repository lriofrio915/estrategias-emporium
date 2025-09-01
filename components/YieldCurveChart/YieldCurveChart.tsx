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

// Datos de ejemplo para la curva de rendimiento de bonos
const bondData = [
  {
    name: "1M",
    USA: 4.1,
    UK: 1.8,
    Germany: 3.4,
    France: 2.7,
    Italy: 4.2,
    Canada: 4.3,
    Japan: 0.1,
    China: 1.9,
  },
  {
    name: "2M",
    USA: 4.0,
    UK: 1.9,
    Germany: 3.5,
    France: 2.8,
    Italy: 4.1,
    Canada: 4.0,
    Japan: 0.2,
    China: 2.0,
  },
  {
    name: "3M",
    USA: 3.9,
    UK: 2.0,
    Germany: 3.6,
    France: 2.9,
    Italy: 4.0,
    Canada: 3.8,
    Japan: 0.3,
    China: 2.2,
  },
  {
    name: "6M",
    USA: 3.8,
    UK: 2.2,
    Germany: 3.7,
    France: 3.0,
    Italy: 3.9,
    Canada: 3.6,
    Japan: 0.5,
    China: 2.4,
  },
  {
    name: "1Y",
    USA: 3.6,
    UK: 2.5,
    Germany: 3.6,
    France: 3.1,
    Italy: 3.8,
    Canada: 3.5,
    Japan: 0.6,
    China: 2.6,
  },
  {
    name: "2Y",
    USA: 3.7,
    UK: 2.7,
    Germany: 3.5,
    France: 3.2,
    Italy: 3.9,
    Canada: 3.6,
    Japan: 0.7,
    China: 2.8,
  },
  {
    name: "3Y",
    USA: 3.8,
    UK: 2.9,
    Germany: 3.4,
    France: 3.3,
    Italy: 4.0,
    Canada: 3.7,
    Japan: 0.9,
    China: 3.0,
  },
  {
    name: "5Y",
    USA: 4.0,
    UK: 3.0,
    Germany: 3.3,
    France: 3.4,
    Italy: 4.2,
    Canada: 3.9,
    Japan: 1.1,
    China: 3.2,
  },
  {
    name: "7Y",
    USA: 4.2,
    UK: 3.2,
    Germany: 3.2,
    France: 3.5,
    Italy: 4.5,
    Canada: 4.1,
    Japan: 1.3,
    China: 3.3,
  },
  {
    name: "10Y",
    USA: 4.5,
    UK: 3.5,
    Germany: 3.1,
    France: 3.6,
    Italy: 4.7,
    Canada: 4.3,
    Japan: 1.5,
    China: 3.4,
  },
  {
    name: "12Y",
    USA: 4.7,
    UK: 3.7,
    Germany: 3.2,
    France: 3.7,
    Italy: 4.8,
    Canada: 4.5,
    Japan: 1.7,
    China: 3.5,
  },
  {
    name: "15Y",
    USA: 5.0,
    UK: 3.9,
    Germany: 3.3,
    France: 3.8,
    Italy: 5.1,
    Canada: 4.7,
    Japan: 2.0,
    China: 3.6,
  },
  {
    name: "20Y",
    USA: 5.4,
    UK: 4.2,
    Germany: 3.4,
    France: 3.9,
    Italy: 5.5,
    Canada: 5.0,
    Japan: 2.2,
    China: 3.7,
  },
  {
    name: "25Y",
    USA: 5.6,
    UK: 4.4,
    Germany: 3.5,
    France: 4.0,
    Italy: 5.7,
    Canada: 5.2,
    Japan: 2.5,
    China: 3.8,
  },
  {
    name: "30Y",
    USA: 5.7,
    UK: 4.6,
    Germany: 3.6,
    France: 4.1,
    Italy: 5.9,
    Canada: 5.4,
    Japan: 2.7,
    China: 3.9,
  },
];

const colors = {
  USA: "#007bff",
  UK: "#ff6600",
  Germany: "#800080",
  France: "#ff3366",
  Italy: "#66c24f",
  Canada: "#20c997",
  Japan: "#ffdb58",
  China: "#e74c3c",
};

export default function YieldCurveChart() {
  return (
    <div className="rounded-2xl shadow-lg bg-gray-800 text-white p-4 sm:p-6 lg:p-8 mt-8">
      <h3 className="text-xl sm:text-2xl font-bold mb-4">
        Curva de Rendimiento de Bonos
      </h3>
      <p className="text-sm text-gray-400 mb-6">
        Esta gráfica muestra la curva de rendimiento de los bonos
        gubernamentales para diferentes países.
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={bondData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
          <XAxis dataKey="name" stroke="#cbd5e0" />
          <YAxis stroke="#cbd5e0" unit="%" />
          <Tooltip
            contentStyle={{ backgroundColor: "#2d3748", border: "none" }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#fff" }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="USA"
            stroke={colors.USA}
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="UK"
            stroke={colors.UK}
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="Germany"
            stroke={colors.Germany}
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="France"
            stroke={colors.France}
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="Italy"
            stroke={colors.Italy}
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="Canada"
            stroke={colors.Canada}
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="Japan"
            stroke={colors.Japan}
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="China"
            stroke={colors.China}
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
