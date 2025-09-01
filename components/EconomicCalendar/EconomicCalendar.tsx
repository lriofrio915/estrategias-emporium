"use client";

import React, { useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface EconomicEvent {
  date: string;
  time: string;
  title: string;
  source: string;
  importance: "High" | "Medium" | "Low";
  forecast: string;
  previous: string;
}

// Datos de ejemplo para el calendario económico de EE.UU.
const events: EconomicEvent[] = [
  {
    date: "2023-10-26",
    time: "08:30 AM EST",
    title: "Producto Interno Bruto (PIB)",
    source: "Oficina de Análisis Económico",
    importance: "High",
    forecast: "2.5%",
    previous: "2.1%",
  },
  {
    date: "2023-10-27",
    time: "08:30 AM EST",
    title: "Gasto en Consumo Personal (PCE)",
    source: "Oficina de Análisis Económico",
    importance: "High",
    forecast: "0.4%",
    previous: "0.4%",
  },
  {
    date: "2023-10-27",
    time: "10:00 AM EST",
    title: "Confianza del Consumidor (Universidad de Michigan)",
    source: "Universidad de Michigan",
    importance: "Medium",
    forecast: "64.0",
    previous: "63.0",
  },
  {
    date: "2023-10-28",
    time: "02:00 PM EST",
    title: "Decisión de Tasas de Interés del FOMC",
    source: "Reserva Federal de EE.UU.",
    importance: "High",
    forecast: "5.50%",
    previous: "5.25%",
  },
  {
    date: "2023-10-29",
    time: "08:30 AM EST",
    title: "Pedidos de Bienes Duraderos",
    source: "Oficina del Censo de EE.UU.",
    importance: "Medium",
    forecast: "0.8%",
    previous: "0.2%",
  },
];

const importanceColors = {
  High: "bg-red-600",
  Medium: "bg-yellow-600",
  Low: "bg-green-600",
};

export default function EconomicCalendar() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="rounded-2xl shadow-lg bg-gray-800 text-white p-4 sm:p-6 lg:p-8 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl sm:text-2xl font-bold">Calendario Económico</h3>
        <div className="relative">
          <InformationCircleIcon
            className="h-6 w-6 text-gray-400 cursor-pointer"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          />
          {showTooltip && (
            <div className="absolute right-0 bottom-full mb-2 w-64 p-3 rounded-md bg-gray-700 text-sm text-gray-200 shadow-md transition-opacity duration-300">
              <p>Clasificación de importancia:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-red-600 mr-2"></span>
                  Alto impacto
                </li>
                <li className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-yellow-600 mr-2"></span>
                  Medio impacto
                </li>
                <li className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-600 mr-2"></span>
                  Bajo impacto
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-400 mb-6">
        Próximos eventos y anuncios económicos que pueden afectar al mercado.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Fecha
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Hora
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Evento
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Importancia
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Pronóstico
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Anterior
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {events.map((event, index) => (
              <tr key={index}>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {event.date}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-now-wrap text-sm text-gray-300">
                  {event.time}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {event.title}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      importanceColors[event.importance]
                    } text-gray-100`}
                  >
                    {event.importance}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {event.forecast}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {event.previous}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
