// components/IntrinsicValueResults/IntrinsicValueResults.tsx
import React from "react";
import { ValuationResult, ValuationResults } from "@/types/valuation"; // Importamos los tipos corregidos

// Interfaz de Props actualizada y simplificada
interface Props {
  results: ValuationResults | null; // Aceptamos que los resultados pueden ser nulos al inicio
  marginOfSafety: string | null;
  cagrResults: {
    per: number;
    ev_fcf: number;
    ev_ebitda: number;
    ev_ebit: number;
  } | null;
  currentPrice: number;
}

const IntrinsicValueResults: React.FC<Props> = ({
  results,
  marginOfSafety,
  cagrResults,
  currentPrice,
}) => {
  // 1. Comprobación robusta: si no hay resultados, no renderizar nada.
  if (!results || Object.keys(results).length === 0) {
    return null;
  }

  // 2. Obtenemos los años y las métricas de forma dinámica (sin hardcodear)
  const years = Object.keys(results).sort();
  const lastYear = years[years.length - 1];
  const metrics = Object.keys(results[years[0]]) as Array<
    keyof ValuationResult
  >;

  // 3. Calculamos el precio promedio final usando el último año disponible
  const finalAvgPrice =
    Object.values(results[lastYear]).reduce(
      (sum: number, value: number) => sum + value,
      0
    ) / metrics.length;

  const metricNames: Record<string, string> = {
    per: "Precio/Beneficios (P/E)",
    ev_ebitda: "Empresa/EBITDA (EV/EBITDA)",
    ev_ebit: "Empresa/EBIT (EV/EBIT)",
    ev_fcf: "Empresa/FCF (EV/FCF)",
  };

  return (
    <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg mt-8 border border-gray-200">
      <h3 className="text-xl font-semibold mb-4 text-center">
        Valoración Intrínseca Proyectada
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-sm">
              <th className="py-2 px-3">Métrica</th>
              {/* 4. Renderizamos las cabeceras de los años dinámicamente */}
              {years.map((year) => (
                <th key={year} className="py-2 px-3 text-center">
                  {year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr
                key={metric}
                className="border-b border-gray-200 last:border-b-0"
              >
                <td className="py-2 px-3 font-semibold">
                  {metricNames[metric] || String(metric).replace(/_/g, " / ")}
                </td>
                {/* 5. Renderizamos los valores para cada año dinámicamente */}
                {years.map((year) => (
                  <td
                    key={`${metric}-${year}`}
                    className="py-2 px-3 text-center font-bold text-blue-600"
                  >
                    ${results[year]?.[metric]?.toFixed(2) ?? "0.00"}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-gray-100">
              <td className="py-2 px-3 font-bold">Promedio</td>
              {years.map((year) => {
                const yearValues = Object.values(results[year]);
                const avg =
                  yearValues.reduce((sum, val) => sum + val, 0) /
                  yearValues.length;
                return (
                  <td
                    key={`avg-${year}`}
                    className="py-2 px-3 font-bold text-center text-green-600"
                  >
                    ${avg.toFixed(2)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* --- SECCIÓN ACTUALIZADA CON FÓRMULAS --- */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">
          ¿Cómo se calcula el valor intrínseco?
        </h4>
        <div className="text-sm text-blue-700 space-y-3">
          <p>
            Cada métrica utiliza las proyecciones financieras y los múltiplos
            objetivo para estimar el precio teórico de la acción:
          </p>
          <ul className="space-y-4 pl-4 font-mono">
            <li>
              <strong className="font-sans font-semibold text-blue-800">
                Precio/Beneficios (P/E):
              </strong>
              <p className="font-sans text-xs italic text-blue-600">
                Estima el precio basado en las ganancias por acción (EPS).
              </p>
              <div className="text-center bg-blue-100 p-2 rounded mt-1">
                <p>Precio Objetivo = EPS Proyectado × P/E Objetivo</p>
              </div>
            </li>
            <li>
              <strong className="font-sans font-semibold text-blue-800">
                Empresa/FCF (EV/FCF):
              </strong>
              <p className="font-sans text-xs italic text-blue-600">
                Calcula el valor basado en el flujo de caja libre, ajustado por
                deuda y caja.
              </p>
              <div className="text-center bg-blue-100 p-2 rounded mt-1">
                <p>
                  Precio Objetivo = [(FCF Proyectado × EV/FCF Objetivo) - Deuda
                  Neta] / N° de Acciones
                </p>
              </div>
            </li>
            <li>
              <strong className="font-sans font-semibold text-blue-800">
                Empresa/EBITDA (EV/EBITDA):
              </strong>
              <p className="font-sans text-xs italic text-blue-600">
                Usa las ganancias antes de intereses, impuestos, depreciación y
                amortización.
              </p>
              <div className="text-center bg-blue-100 p-2 rounded mt-1">
                <p>
                  Precio Objetivo = [(EBITDA Proyectado × EV/EBITDA Objetivo) -
                  Deuda Neta] / N° de Acciones
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
        <div className="bg-gray-100 p-3 rounded-lg flex-1 min-w-[200px] w-full text-center">
          <p className="text-gray-500 text-sm">
            Precio Actual vs. Objetivo {lastYear}
          </p>
          <p className="font-bold text-2xl">
            <span className="text-green-600">${currentPrice.toFixed(2)}</span>
            <span className="text-gray-400 mx-2">→</span>
            <span className="text-blue-600">${finalAvgPrice.toFixed(2)}</span>
          </p>
        </div>
        <div className="bg-gray-100 p-3 rounded-lg flex-1 min-w-[200px] w-full text-center">
          <p className="text-gray-500 text-sm">Margen de Seguridad</p>
          <p className="font-bold text-2xl text-green-600">{marginOfSafety}%</p>
        </div>
        <div className="bg-gray-100 p-3 rounded-lg flex-1 min-w-[200px] w-full text-center">
          <p className="text-gray-500 text-sm">Retorno Anualizado (CAGR)</p>
          <p className="font-bold text-2xl text-green-600">
            {cagrResults?.per?.toFixed(2) ?? "N/A"}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntrinsicValueResults;
