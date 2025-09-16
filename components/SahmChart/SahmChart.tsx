// /app/components/SahmChart.tsx
"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// Datos de prueba simulando la Sahm Rule (inventados para fines de demostración).
// En un proyecto real, esto vendría de una API que calcule la regla.
const sahmData = [
  { year: 2000, value: 0.1, recession: false },
  { year: 2001, value: 0.2, recession: false },
  { year: 2002, value: 1.5, recession: true }, // Recesión (Sahm > 0.5)
  { year: 2003, value: 1.2, recession: true },
  { year: 2004, value: 0.8, recession: false },
  { year: 2005, value: 0.2, recession: false },
  { year: 2006, value: 0.1, recession: false },
  { year: 2007, value: 0.1, recession: false },
  { year: 2008, value: 0.5, recession: true }, // Recesión
  { year: 2009, value: 3.5, recession: true },
  { year: 2010, value: 2.5, recession: true },
  { year: 2011, value: 1.0, recession: false },
  { year: 2012, value: 0.5, recession: false },
  { year: 2013, value: 0.2, recession: false },
  { year: 2014, value: 0.1, recession: false },
  { year: 2015, value: 0.0, recession: false },
  { year: 2016, value: 0.1, recession: false },
  { year: 2017, value: 0.1, recession: false },
  { year: 2018, value: 0.0, recession: false },
  { year: 2019, value: 0.1, recession: false },
  { year: 2020, value: 9.0, recession: true }, // Recesión (COVID)
  { year: 2021, value: 0.5, recession: false },
  { year: 2022, value: 0.3, recession: false },
  { year: 2023, value: 0.2, recession: false },
  { year: 2024, value: 0.13, recession: false }, // Dato actual
  { year: 2025, value: 0.1, recession: false },
];

const SahmChart = () => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md h-[450px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={sahmData}
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
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#2d3748", border: "none" }}
            labelStyle={{ color: "#d1d5db" }}
          />
          <ReferenceLine
            y={0.5}
            stroke="#ff6b6b"
            strokeDasharray="5 5"
            label={{
              value: "Recession Threshold (0.5)",
              position: "top",
              fill: "#ff6b6b",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            name="Sahm Rule Indicator"
            stroke="#63b3ed" // Azul
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SahmChart;
