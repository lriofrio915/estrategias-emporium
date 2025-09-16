"use client";
import React, { useState, useMemo } from "react";
import Tooltip from "../Shared/Tooltips";

// Interfaz para los datos que este componente espera recibir
export interface MultiplesData {
  trailingPE?: number;
  enterpriseValue?: number;
  ebitda?: number;
  ebit?: number;
  freeCashFlow?: number;
}

interface Props {
  ticker: string;
  currentPrice: number;
  data: MultiplesData | null; // Recibe los datos como prop
}

const ValuationMultiplesTable: React.FC<Props> = ({
  ticker,
  currentPrice,
  data,
}) => {
  // Los objetivos ahora son parte del estado para que el usuario pueda modificarlos
  const [targets, setTargets] = useState({
    PER: 20,
    EV_EBITDA: 16,
    EV_EBIT: 18,
    EV_FCF: 22,
  });

  const metricDescriptions: { [key: string]: string } = {
    PER: "Mide cuánto están los inversores dispuestos a pagar por cada dólar de ganancias de una empresa. Se calcula dividiendo el precio de la acción entre el EPS.",
    EV_EBITDA:
      "Compara el valor total de la empresa (Enterprise Value) con las ganancias antes de intereses, impuestos, depreciación y amortización. Es una medida de la rentabilidad operativa.",
    EV_EBIT:
      "Similar al EV/EBITDA, pero excluye la depreciación y amortización. Útil para comparar empresas con diferentes estructuras de capital.",
    EV_FCF:
      "Compara el valor total de la empresa (Enterprise Value) con el flujo de caja libre. Es útil porque se enfoca en la caja real que la empresa produce.",
  };

  // Calculamos los múltiplos LTM (Last Twelve Months) basados en los datos recibidos
  const ltmMetrics = useMemo(() => {
    if (!data) {
      return { PER: 0, EV_EBITDA: 0, EV_EBIT: 0, EV_FCF: 0 };
    }
    const {
      trailingPE = 0,
      enterpriseValue = 0,
      ebitda = 0,
      ebit = 0,
      freeCashFlow = 0,
    } = data;

    return {
      PER: trailingPE,
      EV_EBITDA: ebitda && ebitda !== 0 ? enterpriseValue / ebitda : 0,
      EV_EBIT: ebit && ebit !== 0 ? enterpriseValue / ebit : 0,
      EV_FCF:
        freeCashFlow && freeCashFlow !== 0 ? enterpriseValue / freeCashFlow : 0,
    };
  }, [data]);

  const handleTargetChange = (key: string, value: string) => {
    setTargets((prevTargets) => ({
      ...prevTargets,
      [key]: parseFloat(value) || 0,
    }));
  };

  if (!data) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
          <div className="text-right">
            <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="space-y-4 mt-4">
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
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
          {Object.entries(ltmMetrics).map(([key, value]) => (
            <tr key={key} className="border-b border-gray-200">
              <td className="py-2 font-semibold uppercase">
                <Tooltip
                  text={metricDescriptions[key] || "Descripción no disponible."}
                >
                  {key.replace("_", " / ")}
                </Tooltip>
              </td>
              <td className="py-2 text-center">{value?.toFixed(2) || "-"}</td>
              <td className="py-2 text-center text-red-600 font-bold">
                <input
                  type="number"
                  value={targets[key as keyof typeof targets]}
                  onChange={(e) => handleTargetChange(key, e.target.value)}
                  className="w-20 text-center bg-transparent border-none outline-none focus:ring-0"
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
