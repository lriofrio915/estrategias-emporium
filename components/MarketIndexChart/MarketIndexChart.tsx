// /app/components/MarketIndexChart.tsx
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

// Datos de prueba simulando el rendimiento de los índices bursátiles.
// Los valores están normalizados a una escala de 100 para facilitar la comparación.
const historicalMarketData = [
  { year: 2000, sp500: 100, nasdaq: 100, dowjones: 100 },
  { year: 2002, sp500: 80, nasdaq: 60, dowjones: 85 },
  { year: 2004, sp500: 110, nasdaq: 120, dowjones: 115 },
  { year: 2006, sp500: 130, nasdaq: 150, dowjones: 140 },
  { year: 2008, sp500: 105, nasdaq: 110, dowjones: 100 },
  { year: 2010, sp500: 150, nasdaq: 180, dowjones: 160 },
  { year: 2012, sp500: 170, nasdaq: 220, dowjones: 180 },
  { year: 2014, sp500: 200, nasdaq: 280, dowjones: 210 },
  { year: 2016, sp500: 220, nasdaq: 320, dowjones: 230 },
  { year: 2018, sp500: 250, nasdaq: 380, dowjones: 260 },
  { year: 2020, sp500: 280, nasdaq: 450, dowjones: 290 },
  { year: 2021, sp500: 350, nasdaq: 600, dowjones: 360 },
  { year: 2022, sp500: 320, nasdaq: 500, dowjones: 340 },
  { year: 2023, sp500: 340, nasdaq: 550, dowjones: 350 },
  { year: 2024, sp500: 360, nasdaq: 580, dowjones: 370 },
  { year: 2025, sp500: 370, nasdaq: 590, dowjones: 380 },
];

const MarketIndexChart = () => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md h-[450px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={historicalMarketData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
          <XAxis
            dataKey="year"
            tick={{ fill: "#d1d5db" }}
            axisLine={{ stroke: "#4a5568" }}
            tickLine={{ stroke: "#4a5568" }}
          />
          <YAxis
            tick={{ fill: "#d1d5db" }}
            axisLine={{ stroke: "#4a5568" }}
            tickLine={{ stroke: "#4a5568" }}
            label={{
              value: "Índice (Base 100)",
              angle: -90,
              position: "insideLeft",
              fill: "#d1d5db",
            }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#2d3748", border: "none" }}
            labelStyle={{ color: "#d1d5db" }}
            itemStyle={{ color: "#d1d5db" }}
          />
          <Legend wrapperStyle={{ color: "#d1d5db", paddingTop: "10px" }} />
          <Line
            type="monotone"
            dataKey="sp500"
            name="S&P 500"
            stroke="#63b3ed" // Azul
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="nasdaq"
            name="NASDAQ"
            stroke="#ff6b6b" // Rojo
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="dowjones"
            name="Dow Jones"
            stroke="#20c997" // Turquesa
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MarketIndexChart;
