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
    // Métricas de Valoración (nuevas)
    enterpriseValue?: (number | string)[];
  };
}

// Define la interfaz para los datos de valoración
interface ValuationData {
  headers: string[];
  metrics: {
    marketCap: number[];
    enterpriseValue: number[];
    trailingPE: number[];
    forwardPE: number[];
    pegRatio: number[];
    priceSales: number[];
    priceBook: number[];
    enterpriseValueRevenue: number[];
    enterpriseValueEBITDA: number[];
  };
}

// Define la interfaz para los datos de la tabla
interface TableRow {
  name: string;
  nameEn: string;
  values: (number | string)[];
}

interface FutureFinancialTableProps {
  ticker: string;
}

const formatNumber = (num: number) => {
  if (num === 0) return "0";

  // Si el número es mayor o igual a 1 billón, formatear con "T"
  if (num >= 1e12) {
    return (num / 1e12).toFixed(2) + "T";
  }

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

// Función para ajustar los datos de Enterprise Value a las fechas de la tabla principal
const adjustEnterpriseValueToMainDates = (
  valuationData: ValuationData,
  mainHeaders: string[]
): (number | string)[] => {
  const adjustedValues: (number | string)[] = [];

  // Para cada fecha en los headers principales
  mainHeaders.forEach((mainHeader) => {
    // Buscamos el índice en los headers de valoración que coincida exactamente con la fecha principal
    const valuationIndex = valuationData.headers.findIndex(
      (valuationHeader) => valuationHeader === mainHeader
    );

    if (valuationIndex !== -1) {
      // Si encontramos una coincidencia exacta, usamos ese valor
      adjustedValues.push(
        valuationData.metrics.enterpriseValue[valuationIndex]
      );
    } else {
      // Si no encontramos coincidencia exacta, buscamos el valor "Current"
      const currentIndex = valuationData.headers.findIndex((header) =>
        header.toLowerCase().includes("current")
      );

      // Si la fecha principal es "Current" o "TTM", usar el valor "Current"
      if (
        mainHeader.toLowerCase().includes("current") ||
        mainHeader.toLowerCase().includes("ttm")
      ) {
        if (currentIndex !== -1) {
          adjustedValues.push(
            valuationData.metrics.enterpriseValue[currentIndex]
          );
        } else {
          adjustedValues.push("N/A");
        }
      } else {
        // Para otras fechas sin coincidencia exacta, usar "N/A"
        adjustedValues.push("N/A");
      }
    }
  });

  return adjustedValues;
};

// Función para filtrar datos del año 2021
const filterOut2021Data = (
  data: FinancialData | null
): FinancialData | null => {
  if (!data) return null;

  const headers = data.headers;
  const indicesToRemove: number[] = [];

  // Encontrar índices de las columnas que contienen "2021"
  headers.forEach((header, index) => {
    if (header.includes("2021")) {
      indicesToRemove.push(index);
    }
  });

  // Si no hay datos de 2021, retornar los datos originales
  if (indicesToRemove.length === 0) return data;

  // Filtrar headers
  const filteredHeaders = headers.filter(
    (_, index) => !indicesToRemove.includes(index)
  );

  // Filtrar todas las métricas
  const filteredMetrics: FinancialData["metrics"] =
    {} as FinancialData["metrics"];

  Object.entries(data.metrics).forEach(([key, valueArray]) => {
    if (Array.isArray(valueArray)) {
      filteredMetrics[key as keyof FinancialData["metrics"]] =
        valueArray.filter(
          (_, index) => !indicesToRemove.includes(index)
        ) as any;
    }
  });

  return {
    headers: filteredHeaders,
    metrics: filteredMetrics,
  };
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
      const [
        incomeResponse,
        balanceResponse,
        cashFlowResponse,
        valuationResponse,
      ] = await Promise.all([
        fetch(`/api/income-statement?ticker=${currentTicker}`),
        fetch(`/api/balance-sheet?ticker=${currentTicker}`),
        fetch(`/api/free-cash-flow?ticker=${currentTicker}`),
        fetch(`/api/key-statistics?ticker=${currentTicker}`),
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
      if (!valuationResponse.ok) {
        console.warn(
          "No se pudieron obtener datos de Valoración, pero continuamos sin ellos."
        );
        // No lanzamos error para valuation, ya que es opcional
      }

      const incomeData = await incomeResponse.json();
      const balanceData = await balanceResponse.json();
      const cashFlowData = await cashFlowResponse.json();
      const valuationData = valuationResponse.ok
        ? await valuationResponse.json()
        : null;

      if (incomeData.error || balanceData.error || cashFlowData.error) {
        throw new Error(
          incomeData.error || balanceData.error || cashFlowData.error
        );
      }

      // Combina los datos de las tres APIs principales
      const combinedData: FinancialData = {
        headers: incomeData.headers,
        metrics: {
          ...incomeData.metrics,
          ...balanceData.metrics,
          ...cashFlowData.metrics,
        },
      };

      // Si tenemos datos de valoración, los ajustamos a las fechas principales
      if (valuationData && !valuationData.error) {
        const adjustedEnterpriseValue = adjustEnterpriseValueToMainDates(
          valuationData,
          incomeData.headers
        );
        combinedData.metrics.enterpriseValue = adjustedEnterpriseValue;
      }

      // Filtrar datos del 2021 antes de establecer el estado
      const filteredData = filterOut2021Data(combinedData);
      setData(filteredData);
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
          name: "Acciones en circulación",
          nameEn: "Shares Outstanding",
          values:
            data.metrics.ordinarySharesNumber ||
            data.metrics.basicAverageShares ||
            [],
        },
        {
          name: "Valor de la Empresa (EV)",
          nameEn: "Enterprise Value",
          values:
            data.metrics.enterpriseValue ||
            Array(data.headers.length).fill("N/A"),
        },
        {
          name: "Ventas",
          nameEn: "Revenue",
          values: data.metrics.totalRevenue || [],
        },
        {
          name: "EBIT",
          nameEn: "EBIT",
          values: data.metrics.ebit || [],
        },
        {
          name: "EBITDA",
          nameEn: "EBITDA",
          values: data.metrics.ebitda || [],
        },
        {
          name: "Flujo de Caja Libre (FCF)",
          nameEn: "Free Cash Flow",
          values: data.metrics.freeCashFlow || [],
        },
        {
          name: "Deuda Total",
          nameEn: "Total Debt",
          values: data.metrics.totalDebt || [],
        },
        {
          name: "Efectivo y equivalentes",
          nameEn: "Cash & Equivalents",
          values: data.metrics.cashAndCashEquivalents || [],
        },
        {
          name: "Tasa de impuestos (%)",
          nameEn: "Tax Rate (%)",
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
                  Métrica / Metric
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
                    <div>{row.name}</div>
                    <div className="text-xs text-gray-400">{row.nameEn}</div>
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
