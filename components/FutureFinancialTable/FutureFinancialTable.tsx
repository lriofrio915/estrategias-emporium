"use client";

import React from "react";

// Define la interfaz para la estructura de los datos financieros combinados
// Exportamos esta interfaz para que ReportPage pueda usarla
export interface FinancialData {
  headers: string[];
  metrics: {
    totalRevenue: number[];
    ebit: number[];
    ebitda: number[];
    netIncome: number[];
    basicAverageShares: number[];
    pretaxIncome: number[];
    taxRateForCalcs: number[];
    ordinarySharesNumber: number[];
    totalDebt: number[];
    cashAndCashEquivalents: number[];
    freeCashFlow: number[];
    enterpriseValue?: (number | string)[];
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
  data: FinancialData | null; // Recibe los datos como prop
}

const formatNumber = (num: number) => {
  if (num === 0) return "0";
  if (num >= 1e12) {
    return (num / 1e12).toFixed(2) + "T";
  }
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

const calculateTaxRate = (
  taxProvisions: number[],
  pretaxIncomes: number[]
): (number | string)[] => {
  if (!taxProvisions || !pretaxIncomes) return [];
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
  data, // Usa los datos pasados como prop
}: FutureFinancialTableProps) {
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
            data.metrics.taxRateForCalcs,
            data.metrics.pretaxIncome
          ),
        },
      ]
    : [];

  // Renderizado condicional basado en la existencia de 'data'
  const renderContent = () => {
    if (!data) {
      // Muestra un estado de carga o vacío si no hay datos.
      // El spinner principal ya está en ReportPage, así que aquí podemos mostrar un mensaje.
      return (
        <div className="text-center p-8 text-gray-400">
          <p>No hay datos financieros para mostrar.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-xl shadow-2xl bg-gray-800">
        <table className="min-w-full divide-y divide-gray-700">
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
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-950 text-white min-h-screen font-sans">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-center text-teal-400">
          Datos Financieros de {ticker}
        </h1>
        <p className="text-lg md:text-xl text-gray-400 text-center mb-6">
          Datos históricos y proyecciones de Yahoo Finance.
        </p>
      </div>
      {renderContent()}
    </div>
  );
}
