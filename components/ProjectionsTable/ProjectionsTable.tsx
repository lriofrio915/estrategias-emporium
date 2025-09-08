"use client";

import React, { useState, useEffect } from "react";
import Tooltip from "../Shared/Tooltips";

interface Props {
  ticker: string;
}

// Interfaz para la estructura de los datos que se obtienen de la API
interface FinancialData {
  headers: string[];
  metrics: {
    totalRevenue: number[];
    ebit: number[];
    taxRateForCalcs: number[];
    basicAverageShares: number[];
  };
}

// Función para calcular el promedio de crecimiento de ventas
const calculateAverageSalesGrowth = (revenues: number[]): number | string => {
  const yearsToAverage = 4; // Promedio de 2022 a 2025
  const growthRates: number[] = [];
  // Asegurarse de que hay suficientes datos (2022, 2023, 2024, 2025)
  if (revenues.length < yearsToAverage + 1) {
    return "N/A";
  }
  // Los datos de la API vienen con el año más reciente primero (TTM), luego 2025, 2024, etc.
  // Nos interesan los índices 1 (2025), 2 (2024), 3 (2023) y 4 (2022)
  for (let i = 1; i <= yearsToAverage; i++) {
    const currentRevenue = revenues[i];
    const previousRevenue = revenues[i + 1];
    if (previousRevenue && previousRevenue !== 0) {
      const growth =
        ((currentRevenue - previousRevenue) / previousRevenue) * 100;
      growthRates.push(growth);
    }
  }

  if (growthRates.length === 0) {
    return "N/A";
  }

  const averageGrowth =
    growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
  return parseFloat(averageGrowth.toFixed(2));
};

// Función para calcular el promedio del margen EBIT
const calculateAverageEbitMargin = (
  ebits: number[],
  revenues: number[]
): number | string => {
  const yearsToAverage = 4; // Promedio de 2022 a 2025
  const ebitMargins: number[] = [];
  // Asegurarse de que hay suficientes datos
  if (ebits.length < yearsToAverage || revenues.length < yearsToAverage) {
    return "N/A";
  }
  // Nos interesan los índices 0 a 3, que corresponden a 2025 a 2022
  for (let i = 0; i < yearsToAverage; i++) {
    const ebit = ebits[i];
    const revenue = revenues[i];
    if (revenue !== 0) {
      // Usamos el beneficio antes de impuestos (ebit) como proxy si no tenemos un valor más preciso
      const margin = (ebit / revenue) * 100;
      ebitMargins.push(margin);
    }
  }

  if (ebitMargins.length === 0) {
    return "N/A";
  }

  const averageMargin =
    ebitMargins.reduce((sum, margin) => sum + margin, 0) / ebitMargins.length;
  return parseFloat(averageMargin.toFixed(2));
};

// Función para calcular el promedio de la tasa impositiva
const calculateAverageTaxRate = (
  taxProvisions: number[],
  pretaxIncomes: number[]
): number | string => {
  const yearsToAverage = 4; // Promedio de 2022 a 2025
  const taxRates: number[] = [];
  if (
    taxProvisions.length < yearsToAverage ||
    pretaxIncomes.length < yearsToAverage
  ) {
    return "N/A";
  }

  for (let i = 0; i < yearsToAverage; i++) {
    const taxProvision = taxProvisions[i];
    const pretaxIncome = pretaxIncomes[i];
    if (pretaxIncome !== 0) {
      const rate = (taxProvision / pretaxIncome) * 100;
      taxRates.push(rate);
    }
  }

  if (taxRates.length === 0) {
    return "N/A";
  }

  const averageRate =
    taxRates.reduce((sum, rate) => sum + rate, 0) / taxRates.length;
  return parseFloat(averageRate.toFixed(2));
};

// Función para calcular el promedio de aumento de acciones
const calculateAverageSharesIncrease = (shares: number[]): number | string => {
  const yearsToAverage = 4; // Promedio de 2022 a 2025
  const sharesIncreases: number[] = [];
  if (shares.length < yearsToAverage + 1) {
    return "N/A";
  }
  for (let i = 1; i <= yearsToAverage; i++) {
    const currentShares = shares[i];
    const previousShares = shares[i + 1];
    if (previousShares && previousShares !== 0) {
      const increase =
        ((currentShares - previousShares) / previousShares) * 100;
      sharesIncreases.push(increase);
    }
  }

  if (sharesIncreases.length === 0) {
    return "N/A";
  }

  const averageIncrease =
    sharesIncreases.reduce((sum, rate) => sum + rate, 0) /
    sharesIncreases.length;
  return parseFloat(averageIncrease.toFixed(2));
};

const ProjectionsTable: React.FC<Props> = ({ ticker }) => {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [estimates, setEstimates] = useState({
    salesGrowth: "0",
    ebitMargin: "0",
    taxRate: "0",
    sharesIncrease: "0",
  });

  const projectionDescriptions: { [key: string]: string } = {
    salesGrowth:
      "The expected average annual growth rate in the company's sales.",
    ebitMargin:
      "The company's operating profitability. It measures the percentage of sales that becomes earnings before interest and taxes.",
    taxRate: "The corporate tax rate the company is expected to pay.",
    sharesIncrease:
      "The projected change in the number of outstanding shares, which affects the value per share.",
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/income-statement?ticker=${ticker}`);
        if (!response.ok) {
          throw new Error("Failed to fetch API response");
        }
        const result = await response.json();
        if (result.error) {
          throw new Error(result.error);
        }
        setData(result);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          console.error(err);
        } else {
          setError("Ocurrió un error inesperado.");
          console.error("Ocurrió un error inesperado:", err);
        }
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (ticker) {
      fetchData();
    }
  }, [ticker]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEstimates((prevEstimates) => ({
      ...prevEstimates,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-500"></div>
        <p className="ml-4 text-xl text-teal-400">Cargando proyecciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-900 rounded-lg shadow-lg">
        <p className="text-red-300 text-lg">
          Error al cargar las proyecciones: {error}
        </p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const averageData = {
    salesGrowth: calculateAverageSalesGrowth(data.metrics.totalRevenue),
    ebitMargin: calculateAverageEbitMargin(
      data.metrics.ebit,
      data.metrics.totalRevenue
    ),
    taxRate: calculateAverageTaxRate(
      data.metrics.taxRateForCalcs,
      data.metrics.ebit
    ),
    sharesIncrease: calculateAverageSharesIncrease(
      data.metrics.basicAverageShares
    ),
  };

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
            <th className="py-2">Metric</th>
            <th className="py-2 text-center">
              <div className="flex flex-col items-center">
                <span>Average</span>
                <span className="text-sm font-normal">2022 - 2025</span>
              </div>
            </th>
            <th className="py-2 text-center">
              <div className="flex flex-col items-center">
                <span>Estimates</span>
                <span className="text-sm font-normal">2026e</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="space-x-8">
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
