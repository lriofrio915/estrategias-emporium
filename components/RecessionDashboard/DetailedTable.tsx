"use client";
import React from "react";
import type { ProcessedIndicator } from "../../lib/reccesion/types";

interface DetailedTableProps {
  data: ProcessedIndicator[];
}

const formatNumber = (
  value: number | undefined | null,
  precision: number = 2
): string => {
  if (value === undefined || value === null || isNaN(value)) return "—";
  return value.toFixed(precision);
};

const formatPercent = (value: number | undefined | null): string => {
  const formatted = formatNumber(value, 2);
  return formatted === "—" ? "—" : `${formatted}%`;
};

export const DetailedTable: React.FC<DetailedTableProps> = ({ data }) => {
  const handleDownload = () => {
    const headers = [
      "Indicador",
      "Tipo",
      "Ticker",
      "Fecha",
      "Último",
      "YoY",
      "Secuencial",
      "Aceleración YoY",
      "Fase",
      "FRED",
    ];
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        [
          `"${row.name}"`,
          row.kind,
          row.id,
          row.latest_date,
          formatNumber(row.latest_value),
          formatNumber(row.yoy),
          formatNumber(row.mom),
          formatNumber(row.accel),
          row.phase,
          row.fred_url,
        ].join(",")
      ),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "dashboard_ciclo_economico.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
        >
          ⬇️ Exportar CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700">
            <tr>
              <th scope="col" className="px-4 py-3">
                Indicador
              </th>
              <th scope="col" className="px-4 py-3">
                Tipo
              </th>
              <th scope="col" className="px-4 py-3">
                Fase
              </th>
              <th scope="col" className="px-4 py-3">
                Última Fecha
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Último Valor
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                YoY
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Secuencial
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Aceleración YoY
              </th>
              <th scope="col" className="px-4 py-3">
                Enlace FRED
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-700 hover:bg-gray-600/50"
              >
                <td className="px-4 py-4 font-medium text-white whitespace-nowrap">
                  {item.name}
                </td>
                <td className="px-4 py-4">{item.kind}</td>
                <td className="px-4 py-4 text-xl">{item.phase}</td>
                <td className="px-4 py-4">{item.latest_date}</td>
                <td className="px-4 py-4 text-right">
                  {formatNumber(item.latest_value)}
                </td>
                <td
                  className={`px-4 py-4 text-right font-semibold ${
                    item.yoy > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {formatPercent(item.yoy)}
                </td>
                <td
                  className={`px-4 py-4 text-right ${
                    item.mom > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {formatPercent(item.mom)}
                </td>
                <td className="px-4 py-4 text-right">
                  {formatNumber(item.accel, 2)}
                </td>
                <td className="px-4 py-4">
                  <a
                    href={item.fred_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Enlace
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
