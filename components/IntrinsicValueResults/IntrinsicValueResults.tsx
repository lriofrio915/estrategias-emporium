// components/IntrinsicValueResults/IntrinsicValueResults.tsx
import React from "react";
import { AssetData, ValuationResult } from "@/types/valuation";

interface Props {
  results: AssetData["valuationResults"];
  marginOfSafety: number | string;
  cagrResults: AssetData["cagrResults"];
}

const IntrinsicValueResults: React.FC<Props> = ({
  results,
  marginOfSafety,
  cagrResults,
}) => {
  const years = Object.keys(results) as (keyof typeof results)[];
  const metrics = Object.keys(results[years[0]]) as (keyof ValuationResult)[];

  // CAMBIOS AQUI: bg-white y text-gray-800
  return (
    <div className="bg-white text-gray-800 p-4 rounded-lg shadow-lg mt-8 border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            {/* CAMBIO AQUI: border-gray-200 y text-gray-500 */}
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="py-2">Precio objetivo</th>
              {years.map((year) => (
                <th key={year} className="py-2">
                  {year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              // CAMBIO AQUI: border-gray-200
              <tr key={metric} className="border-b border-gray-200">
                <td className="py-2 font-semibold uppercase">
                  {metric.replace("_", " / ")}
                </td>
                {years.map((year) => (
                  <td key={year} className="py-2">
                    ${results[year][metric].toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
            {/* CAMBIO AQUI: bg-gray-100 */}
            <tr className="border-b border-gray-200 bg-gray-100">
              <td className="py-2 font-bold">Promedio</td>
              {years.map((year) => {
                const yearResults = results[year];
                const avg =
                  Object.values(yearResults).reduce(
                    (sum, value) => sum + value,
                    0
                  ) / metrics.length;
                return (
                  <td key={year} className="py-2 font-bold">
                    ${avg.toFixed(2)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4 flex-wrap gap-4">
        {/* CAMBIO AQUI: bg-gray-100 */}
        <div className="bg-gray-100 p-3 rounded-lg flex-1 min-w-[200px]">
          {/* CAMBIO AQUI: text-gray-500 */}
          <p className="text-gray-500 text-sm">Margen de seguridad</p>
          {/* CAMBIO AQUI: text-green-600 */}
          <p className="font-bold text-2xl text-green-600">{marginOfSafety}%</p>
        </div>
        {/* CAMBIO AQUI: bg-gray-100 */}
        <div className="bg-gray-100 p-3 rounded-lg flex-1 min-w-[200px]">
          {/* CAMBIO AQUI: text-gray-500 */}
          <p className="text-gray-500 text-sm">
            Retorno Anualizado (CAGR 5 años)
          </p>
          {/* CAMBIO AQUI: text-green-600 */}
          <p className="font-bold text-2xl text-green-600">
            {cagrResults.ev_fcf}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntrinsicValueResults;
