"use client";
import React, { useState, useEffect } from "react";
import Tooltip from "../Shared/Tooltips";
import { MultiplesData } from "@/types/valuation"; // Importamos el nuevo tipo

interface Props {
  currentPrice: number;
  data: MultiplesData | null; // El componente ahora recibe los datos pre-calculados
}

const ValuationMultiplesTable: React.FC<Props> = ({
  currentPrice,
  data,
}) => {
  const [valuationMetrics, setValuationMetrics] =
    useState<MultiplesData | null>(data);
  const [loading, setLoading] = useState<boolean>(!data);

  const metricDescriptions: { [key: string]: string } = {
    PER: "Mide cuánto están los inversores dispuestos a pagar por cada dólar de ganancias de una empresa. Se calcula dividiendo el precio de la acción entre el EPS.",
    EV_EBITDA:
      "Compara el valor total de la empresa (Enterprise Value) con las ganancias antes de intereses, impuestos, depreciación y amortización. Es una medida de la rentabilidad operativa.",
    EV_EBIT:
      "Similar al EV/EBITDA, pero excluye la depreciación y amortización. Útil para comparar empresas con diferentes estructuras de capital.",
    EV_FCF:
      "Compara el valor total de la empresa (Enterprise Value) con el flujo de caja libre. Es útil porque se enfoca en la caja real que la empresa produce.",
  };

  useEffect(() => {
    setValuationMetrics(data);
    setLoading(!data);
  }, [data]);

  const handleTargetChange = (key: string, value: string) => {
    if (!valuationMetrics) return;

    setValuationMetrics((prevMetrics) => {
      if (!prevMetrics) return null;
      const keyTyped = key as keyof MultiplesData;
      return {
        ...prevMetrics,
        [keyTyped]: {
          ...prevMetrics[keyTyped],
          target: parseFloat(value) || 0,
        },
      };
    });
  };

  if (loading) {
    return (
      <div className="bg-white text-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 flex items-center justify-center h-full">
        <p className="text-gray-500">Cargando múltiplos de valoración...</p>
      </div>
    );
  }

  if (!valuationMetrics) {
    return (
      <div className="bg-white text-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 flex items-center justify-center h-full">
        <p className="text-red-500">
          No se pudieron cargar los múltiplos de valoración.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-800 p-4 rounded-lg shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Múltiplos de valoración</h3>
        <div className="text-right">
          <p className="text-sm text-gray-500">Precio actual</p>
          <p className="text-2xl font-bold text-green-600">
            ${currentPrice.toFixed(2)}
          </p>
        </div>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="py-2">Métrica</th>
            <th className="py-2 text-center">LTM</th>
            <th className="py-2 text-center">Objetivo</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(valuationMetrics).map(([key, value]) => (
            <tr key={key} className="border-b border-gray-200">
              <td className="py-2 font-semibold uppercase">
                <Tooltip
                  text={metricDescriptions[key] || "Descripción no disponible."}
                >
                  {key.replace("_", " / ")}
                </Tooltip>
              </td>
              <td className="py-2 text-center">
                {typeof value.ltm === "number"
                  ? value.ltm.toFixed(2)
                  : value.ltm}
              </td>
              <td className="py-2 text-center text-red-600 font-bold">
                <input
                  type="number"
                  value={value.target}
                  onChange={(e) => handleTargetChange(key, e.target.value)}
                  className="w-20 text-center bg-transparent border-none focus:outline-none focus:ring-0"
                  step="0.1"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ValuationMultiplesTable;
