"use client";

import React, { useState, useEffect } from "react";

// Define la interfaz para la estructura de los datos financieros combinados
interface FinancialData {
  headers: string[];
  metrics: {
    // Métricas del Income Statement
    totalRevenue: number[];
    ebit: number[];
    ebitda: number[];
    netIncome: number[];
    basicAverageShares: number[];
    pretaxIncome: number[];
    taxRateForCalcs: number[];
    // Métricas del Balance Sheet
    ordinarySharesNumber: number[];
    totalDebt: number[];
    cashAndCashEquivalents: number[];
    // Métricas del Cash Flow
    freeCashFlow: number[];
  };
}

// Define la interfaz para los datos de la tabla
interface TableRow {
  name: string;
  values: (number | string)[];
}

interface FutureFinancialTableProps {
  ticker: string;
}

const formatNumber = (num: number) => {
  if (num === 0) return "0";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

// Función para calcular la tasa impositiva real
const calculateTaxRate = (
  taxProvisions: number[],
  pretaxIncomes: number[]
): (number | string)[] => {
  const taxRates: (number | string)[] = [];
  for (let i = 0; i < taxProvisions.length; i++) {
    const taxProvision = taxProvisions[i];
    const pretaxIncome = pretaxIncomes[i];
    if (pretaxIncome === 0) {
      taxRates.push("N/A");
    } else {
      const rate = (taxProvision / pretaxIncome) * 100;
      taxRates.push(parseFloat(rate.toFixed(2)));
    }
  }
  return taxRates;
};

export default function FutureFinancialTable({
  ticker,
}: FutureFinancialTableProps) {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (currentTicker: string) => {
    setLoading(true);
    setError(null);
    try {
      // Realiza llamadas a todas las APIs en paralelo
      const [incomeResponse, balanceResponse, cashFlowResponse] =
        await Promise.all([
          fetch(`/api/income-statement?ticker=${currentTicker}`),
          fetch(`/api/balance-sheet?ticker=${currentTicker}`),
          fetch(`/api/free-cash-flow?ticker=${currentTicker}`),
        ]);

      if (!incomeResponse.ok) {
        throw new Error("No se pudo obtener datos del Income Statement.");
      }
      if (!balanceResponse.ok) {
        throw new Error("No se pudo obtener datos del Balance Sheet.");
      }
      if (!cashFlowResponse.ok) {
        throw new Error("No se pudo obtener datos del Cash Flow.");
      }

      const incomeData = await incomeResponse.json();
      const balanceData = await balanceResponse.json();
      const cashFlowData = await cashFlowResponse.json();

      if (incomeData.error || balanceData.error || cashFlowData.error) {
        throw new Error(
          incomeData.error || balanceData.error || cashFlowData.error
        );
      }

      // Combina los datos de las tres APIs
      const combinedData: FinancialData = {
        headers: incomeData.headers, // Se asume que los encabezados son los mismos
        metrics: {
          ...incomeData.metrics,
          ...balanceData.metrics,
          ...cashFlowData.metrics,
        },
      };

      setData(combinedData);
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

  useEffect(() => {
    if (ticker) {
      fetchData(ticker);
    }
  }, [ticker]);

  const tableRows: TableRow[] = data
    ? [
        {
          name: "Número de acciones en circulación",
          values:
            data.metrics.ordinarySharesNumber ||
            data.metrics.basicAverageShares ||
            [],
        },
        {
          name: "Ventas (Revenue)",
          values: data.metrics.totalRevenue || [],
        },
        {
          name: "EBIT",
          values: data.metrics.ebit || [],
        },
        {
          name: "EBITDA",
          values: data.metrics.ebitda || [],
        },
        {
          name: "Free Cash Flow (FCF)",
          values: data.metrics.freeCashFlow || [],
        },
        {
          name: "Deuda Total",
          values: data.metrics.totalDebt || [],
        },
        {
          name: "Efectivo y equivalentes",
          values: data.metrics.cashAndCashEquivalents || [],
        },
        {
          name: "Tasa de impuestos (%)",
          values: calculateTaxRate(
            data.metrics.taxRateForCalcs || [],
            data.metrics.pretaxIncome || []
          ),
        },
      ]
    : [];

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-950 text-white min-h-screen font-sans">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-center text-teal-400">
          Datos Financieros de {ticker}
        </h1>
        <p className="text-lg md:text-xl text-gray-400 text-center mb-6">
          Obtén datos financieros de Yahoo Finance
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-500"></div>
          <p className="ml-4 text-xl text-teal-400">Cargando...</p>
        </div>
      )}

      {error && (
        <div className="text-center p-8 bg-red-900 rounded-lg shadow-lg">
          <p className="text-red-300 text-lg">Error: {error}</p>
        </div>
      )}

      {data && !loading && (
        <div className="overflow-x-auto rounded-xl shadow-2xl bg-gray-800">
          <table className="min-w-full divide-y divide-gray-700">
            {/* Encabezados de la tabla */}
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Métrica
                </th>
                {data.headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            {/* Cuerpo de la tabla */}
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {tableRows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-200">
                    {row.name}
                  </td>
                  {row.values.map((value, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-400"
                    >
                      {typeof value === "number" ? formatNumber(value) : value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
