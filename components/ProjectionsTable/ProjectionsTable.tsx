"use client";

import React, { useState, useMemo } from "react";
import Tooltip from "../Shared/Tooltips";

// Interfaz de datos que espera este componente
export interface ProjectionsData {
  totalRevenue: number[];
  ebit: number[];
  taxRateForCalcs: number[];
  basicAverageShares: number[];
  pretaxIncome: number[];
}

interface Props {
  ticker: string;
  data: ProjectionsData | null; // Recibe los datos como prop
}

// --- Funciones de Cálculo ---

const calculateAverageSalesGrowth = (revenues: number[]): number | string => {
  const yearsToAverage = 4;
  if (!revenues || revenues.length < yearsToAverage + 1) return "N/A";

  const growthRates: number[] = [];
  for (let i = 0; i < yearsToAverage; i++) {
    const currentRevenue = revenues[i];
    const previousRevenue = revenues[i + 1];
    if (previousRevenue && previousRevenue !== 0) {
      const growth =
        ((currentRevenue - previousRevenue) / previousRevenue) * 100;
      growthRates.push(growth);
    }
  }

  if (growthRates.length === 0) return "N/A";
  const averageGrowth =
    growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
  return parseFloat(averageGrowth.toFixed(2));
};

const calculateAverageEbitMargin = (
  ebits: number[],
  revenues: number[]
): number | string => {
  const yearsToAverage = 4;
  if (
    !ebits ||
    !revenues ||
    ebits.length < yearsToAverage ||
    revenues.length < yearsToAverage
  ) {
    return "N/A";
  }

  const ebitMargins: number[] = [];
  for (let i = 0; i < yearsToAverage; i++) {
    const ebit = ebits[i];
    const revenue = revenues[i];
    if (revenue && revenue !== 0) {
      const margin = (ebit / revenue) * 100;
      ebitMargins.push(margin);
    }
  }

  if (ebitMargins.length === 0) return "N/A";
  const averageMargin =
    ebitMargins.reduce((sum, margin) => sum + margin, 0) / ebitMargins.length;
  return parseFloat(averageMargin.toFixed(2));
};

const calculateAverageTaxRate = (
  taxProvisions: number[],
  pretaxIncomes: number[]
): number | string => {
  const yearsToAverage = 4;
  if (
    !taxProvisions ||
    !pretaxIncomes ||
    taxProvisions.length < yearsToAverage ||
    pretaxIncomes.length < yearsToAverage
  ) {
    return "N/A";
  }

  const taxRates: number[] = [];
  for (let i = 0; i < yearsToAverage; i++) {
    const taxProvision = taxProvisions[i];
    const pretaxIncome = pretaxIncomes[i];
    if (pretaxIncome && pretaxIncome !== 0) {
      const rate = (taxProvision / pretaxIncome) * 100;
      taxRates.push(rate);
    }
  }

  if (taxRates.length === 0) return "N/A";
  const averageRate =
    taxRates.reduce((sum, rate) => sum + rate, 0) / taxRates.length;
  return parseFloat(averageRate.toFixed(2));
};

const calculateAverageSharesIncrease = (shares: number[]): number | string => {
  const yearsToAverage = 4;
  if (!shares || shares.length < yearsToAverage + 1) return "N/A";

  const sharesIncreases: number[] = [];
  for (let i = 0; i < yearsToAverage; i++) {
    const currentShares = shares[i];
    const previousShares = shares[i + 1];
    if (previousShares && previousShares !== 0) {
      const increase =
        ((currentShares - previousShares) / previousShares) * 100;
      sharesIncreases.push(increase);
    }
  }

  if (sharesIncreases.length === 0) return "N/A";
  const averageIncrease =
    sharesIncreases.reduce((sum, rate) => sum + rate, 0) /
    sharesIncreases.length;
  return parseFloat(averageIncrease.toFixed(2));
};

const ProjectionsTable: React.FC<Props> = ({ data }) => {
  const [estimates, setEstimates] = useState({
    salesGrowth: "0",
    ebitMargin: "0",
    taxRate: "0",
    sharesIncrease: "0",
  });

  const projectionDescriptions: { [key: string]: string } = {
    salesGrowth:
      "La tasa de crecimiento anual promedio esperada en las ventas de la empresa.",
    ebitMargin:
      "La rentabilidad operativa de la empresa. Mide el porcentaje de las ventas que se convierte en ganancias antes de intereses e impuestos.",
    taxRate:
      "La tasa de impuesto corporativo que se espera que pague la empresa.",
    sharesIncrease:
      "El cambio proyectado en el número de acciones en circulación, que afecta el valor por acción.",
  };

  const averageData = useMemo(() => {
    if (!data) {
      return {
        salesGrowth: "N/A",
        ebitMargin: "N/A",
        taxRate: "N/A",
        sharesIncrease: "N/A",
      };
    }

    return {
      salesGrowth: calculateAverageSalesGrowth(data.totalRevenue),
      ebitMargin: calculateAverageEbitMargin(data.ebit, data.totalRevenue),
      taxRate: calculateAverageTaxRate(data.taxRateForCalcs, data.pretaxIncome),
      sharesIncrease: calculateAverageSharesIncrease(data.basicAverageShares),
    };
  }, [data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEstimates((prevEstimates) => ({
      ...prevEstimates,
      [name]: value,
    }));
  };

  if (!data) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const projectionsToDisplay = [
    { key: "salesGrowth", name: "Sales Growth" },
    { key: "ebitMargin", name: "EBIT Margin" },
    { key: "taxRate", name: "Tax Rate" },
    { key: "sharesIncrease", name: "Shares Increase" },
  ];

  return (
    <div className="bg-white text-gray-800 p-4 rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-xl font-semibold mb-4">Proyección a futuro</h3>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="py-2">Métrica</th>
            <th className="py-2 text-center">
              <div className="flex flex-col items-center">
                <span>Promedio</span>
                <span className="text-sm font-normal">2022 - 2025</span>
              </div>
            </th>
            <th className="py-2 text-center">
              <div className="flex flex-col items-center">
                <span>Estimaciones</span>
                <span className="text-sm font-normal">2026e</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {projectionsToDisplay.map((projection) => (
            <tr key={projection.key} className="border-b border-gray-200">
              <td className="py-2">
                <Tooltip text={projectionDescriptions[projection.key] || ""}>
                  {projection.name}
                </Tooltip>
              </td>
              <td className="py-2 text-center font-semibold">
                {typeof averageData[
                  projection.key as keyof typeof averageData
                ] === "number"
                  ? `${
                      averageData[projection.key as keyof typeof averageData]
                    }%`
                  : averageData[projection.key as keyof typeof averageData]}
              </td>
              <td className="py-2 text-center text-red-600 font-bold">
                <div className="flex justify-center items-center">
                  <input
                    type="number"
                    name={projection.key}
                    value={estimates[projection.key as keyof typeof estimates]}
                    onChange={handleInputChange}
                    className="w-20 text-center bg-transparent border-none focus:outline-none focus:ring-0"
                    step="0.1"
                  />
                  %
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectionsTable;
