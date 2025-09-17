// components/IntrinsicValueResults/IntrinsicValueResults.tsx
import React from "react";
import { ValuationDashboardData, ValuationResult } from "@/types/valuation";

interface Props {
  results: ValuationDashboardData["valuationResults"];
  marginOfSafety: ValuationDashboardData["marginOfSafety"];
  cagrResults: ValuationDashboardData["cagrResults"];
}

const IntrinsicValueResults: React.FC<Props> = ({
  results,
  marginOfSafety,
  cagrResults,
}) => {
  // Si no hay resultados, no renderizamos nada para evitar errores.
  if (!results || Object.keys(results).length === 0) {
    return (
      <div className="bg-white text-gray-800 p-4 rounded-lg shadow-lg mt-8 border border-gray-200">
        <p className="text-center text-gray-500">
          Calculando resultados de valoración intrínseca...
        </p>
      </div>
    );
  }
  const years = Object.keys(results) as (keyof typeof results)[];
  const metrics = Object.keys(results[years[0]]) as (keyof ValuationResult)[];

  // CAMBIOS AQUI: bg-white y text-gray-800
  return (
    <div className="bg-white text-gray-800 p-4 rounded-lg shadow-lg mt-8 border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="py-2 px-4">Precio objetivo</th>
              {years.map((year) => (
                <th key={year} className="py-2 px-4 text-center">
                  {year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric} className="border-b border-gray-200">
                <td className="py-2 px-4 font-semibold uppercase">
                  {/* Reemplazamos 'per_ex_cash' para que se vea mejor */}
                  {metric
                    .replace("per_ex_cash", "PER ex-cash")
                    .replace("_", " / ")}
                </td>
                {years.map((year) => (
                  <td
                    key={`${year}-${metric}`}
                    className="py-2 px-4 text-center"
                  >
                    ${results[year][metric].toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-b border-gray-200 bg-gray-50">
              <td className="py-2 px-4 font-bold">Promedio</td>
              {years.map((year) => {
                const yearResults = results[year];

                // CORRECCIÓN 3: Añadimos tipos explícitos a la función reduce.
                const avg =
                  Object.values(yearResults).reduce(
                    (sum: number, value: number) => sum + value,
                    0
                  ) / metrics.length;

                return (
                  <td
                    key={`${year}-avg`}
                    className="py-2 px-4 font-bold text-center"
                  >
                    ${avg.toFixed(2)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4 flex-wrap gap-4">
        <div className="bg-gray-100 p-3 rounded-lg flex-1 min-w-[200px] text-center">
          <p className="text-gray-500 text-sm">Margen de seguridad</p>
          <p className="font-bold text-2xl text-green-600">{marginOfSafety}%</p>
        </div>
        <div className="bg-gray-100 p-3 rounded-lg flex-1 min-w-[200px] text-center">
          <p className="text-gray-500 text-sm">
            Retorno Anualizado (CAGR 5 años)
          </p>
          <p className="font-bold text-2xl text-green-600">
            {cagrResults.ev_fcf}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntrinsicValueResults;
