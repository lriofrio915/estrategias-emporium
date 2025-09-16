// /app/components/RecessionChart.tsx
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
  ReferenceArea,
} from "recharts";

// Datos de prueba que simulan la data histórica del LEI y una Tasa de Desempleo (invertida para visualización)
// En un proyecto real, esto vendría de una API.
// NOTA: Los valores del desempleo están inventados para fines de demostración.
const historicalData = [
  { year: 1968, lei: 1.5, unemploymentRate: 2.3, recession: false },
  { year: 1969, lei: 2.1, unemploymentRate: 2.0, recession: false },
  { year: 1970, lei: 2.8, unemploymentRate: 1.8, recession: true }, // Recesión
  { year: 1971, lei: 3.2, unemploymentRate: 1.9, recession: true },
  { year: 1972, lei: 3.5, unemploymentRate: 2.1, recession: false },
  { year: 1973, lei: 3.8, unemploymentRate: 2.3, recession: false },
  { year: 1974, lei: 2.9, unemploymentRate: 1.5, recession: true }, // Recesión
  { year: 1975, lei: 2.5, unemploymentRate: 1.2, recession: true },
  { year: 1976, lei: 3.0, unemploymentRate: 1.8, recession: false },
  { year: 1977, lei: 3.5, unemploymentRate: 2.1, recession: false },
  { year: 1979, lei: 2.8, unemploymentRate: 1.5, recession: false },
  { year: 1980, lei: 2.0, unemploymentRate: 1.0, recession: true }, // Recesión
  { year: 1981, lei: 1.5, unemploymentRate: 0.8, recession: true },
  { year: 1982, lei: 1.0, unemploymentRate: 0.5, recession: true },
  { year: 1983, lei: 2.5, unemploymentRate: 1.0, recession: false },
  { year: 1984, lei: 3.5, unemploymentRate: 1.5, recession: false },
  { year: 1989, lei: 4.8, unemploymentRate: 2.5, recession: false },
  { year: 1990, lei: 3.9, unemploymentRate: 1.8, recession: true }, // Recesión
  { year: 1991, lei: 3.5, unemploymentRate: 1.5, recession: true },
  { year: 1992, lei: 4.5, unemploymentRate: 2.0, recession: false },
  { year: 1995, lei: 5.5, unemploymentRate: 2.8, recession: false },
  { year: 1998, lei: 6.5, unemploymentRate: 3.2, recession: false },
  { year: 2000, lei: 6.8, unemploymentRate: 2.5, recession: true }, // Recesión
  { year: 2001, lei: 6.0, unemploymentRate: 1.8, recession: true },
  { year: 2002, lei: 6.2, unemploymentRate: 2.0, recession: false },
  { year: 2004, lei: 7.0, unemploymentRate: 2.5, recession: false },
  { year: 2007, lei: 7.5, unemploymentRate: 2.8, recession: false },
  { year: 2008, lei: 6.5, unemploymentRate: 1.5, recession: true }, // Recesión
  { year: 2009, lei: 5.5, unemploymentRate: 1.0, recession: true },
  { year: 2010, lei: 7.0, unemploymentRate: 2.0, recession: false },
  { year: 2012, lei: 8.0, unemploymentRate: 2.5, recession: false },
  { year: 2016, lei: 8.5, unemploymentRate: 3.0, recession: false },
  { year: 2019, lei: 9.0, unemploymentRate: 3.5, recession: false },
  { year: 2020, lei: 7.5, unemploymentRate: 1.0, recession: true }, // Recesión (COVID)
  { year: 2021, lei: 8.5, unemploymentRate: 3.0, recession: false },
  { year: 2022, lei: 8.8, unemploymentRate: 3.2, recession: false },
  { year: 2023, lei: 8.3, unemploymentRate: 2.8, recession: false },
  { year: 2024, lei: 8.0, unemploymentRate: 2.5, recession: false },
  { year: 2025, lei: 7.8, unemploymentRate: 2.3, recession: false },
];

const getRecessionAreas = (data: typeof historicalData) => {
  const areas = [];
  let startIndex: number | null = null;

  for (let i = 0; i < data.length; i++) {
    if (data[i].recession && startIndex === null) {
      startIndex = data[i].year;
    } else if (!data[i].recession && startIndex !== null) {
      // El fin del área es el año anterior al fin de la recesión
      areas.push({ start: startIndex, end: data[i - 1].year });
      startIndex = null;
    }
  }

  // Si la última entrada es una recesión, asegúrate de añadirla
  if (startIndex !== null) {
    areas.push({ start: startIndex, end: data[data.length - 1].year });
  }

  return areas;
};

const RecessionChart = () => {
  const recessionAreas = getRecessionAreas(historicalData);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md h-[450px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={historicalData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
          <XAxis
            dataKey="year"
            tick={{ fill: "#d1d5db" }}
            axisLine={{ stroke: "#4a5568" }}
            tickLine={{ stroke: "#4a5568" }}
            interval="preserveStartEnd" // Mantiene el inicio y fin de los ticks
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            tick={{ fill: "#d1d5db" }}
            axisLine={{ stroke: "#4a5568" }}
            tickLine={{ stroke: "#4a5568" }}
            label={{
              value: "LEI",
              angle: -90,
              position: "insideLeft",
              fill: "#d1d5db",
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#d1d5db" }}
            axisLine={{ stroke: "#4a5568" }}
            tickLine={{ stroke: "#4a5568" }}
            reversed={true} // Invierte el eje Y para la tasa de desempleo
            label={{
              value: "Tasa de Desempleo (Invertida)",
              angle: 90,
              position: "insideRight",
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
            yAxisId="left"
            type="monotone"
            dataKey="lei"
            name="Conference Board LEI"
            stroke="#20c997" // Turquesa
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="unemploymentRate"
            name="Tasa de Desempleo"
            stroke="#ff6b6b" // Rojo
            strokeWidth={2}
            dot={false}
          />

          {recessionAreas.map((area, index) => (
            <ReferenceArea
              key={index}
              yAxisId="left" // Importante: Asociar al eje Y principal
              x1={area.start}
              x2={area.end}
              fill="#d1d5db" // Un verde muy suave para las recesiones
              fillOpacity={0.15}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RecessionChart;
