// components/FinancialProjections/FinancialProjections.tsx
"use client";

import React, { useState, useEffect } from "react";

// Interfaces para los datos y las proyecciones
interface ScrapedData {
  headers: string[];
  metrics: { [key: string]: (number | string)[] };
}

interface FinancialData {
  headers: string[];
  sharesOutstanding: (number | string)[];
  enterpriseValue: (number | string)[];
  revenue: (number | string)[];
  ebit: (number | string)[];
  ebitda: (number | string)[];
  freeCashFlow: (number | string)[];
  totalDebt: (number | string)[];
  cashAndEquivalents: (number | string)[];
  taxRate: (number | string)[];
}

interface Projections {
  salesGrowth: string;
  ebitMargin: string;
  fcfAsPercentageOfSales: string;
  taxRate: string;
}

interface FinancialProjectionsProps {
  ticker: string;
}

// Función auxiliar para formatear números grandes
const formatNumber = (num: number | string): string => {
  if (typeof num !== "number" || isNaN(num)) return num.toString();
  if (num === 0) return "0";
  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (absNum >= 1e12) {
    return `${sign}${(absNum / 1e12).toFixed(2)}T`;
  }
  if (absNum >= 1e9) {
    return `${sign}${(absNum / 1e9).toFixed(2)}B`;
  }
  if (absNum >= 1e6) {
    return `${sign}${(absNum / 1e6).toFixed(2)}M`;
  }
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export default function FinancialProjections({
  ticker,
}: FinancialProjectionsProps) {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [projections, setProjections] = useState<Projections>({
    salesGrowth: "5.0",
    ebitMargin: "15.0",
    fcfAsPercentageOfSales: "10.0",
    taxRate: "21.0",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!ticker) return;
      setLoading(true);
      setError(null);

      try {
        const responses = await Promise.all([
          fetch(`/api/income-statement?ticker=${ticker}`),
          fetch(`/api/balance-sheet?ticker=${ticker}`),
          fetch(`/api/free-cash-flow?ticker=${ticker}`),
          fetch(`/api/key-statistics?ticker=${ticker}`),
        ]);

        const [incomeRes, balanceRes, fcfRes, keyStatsRes] = responses;

        if (!incomeRes.ok || !balanceRes.ok || !fcfRes.ok || !keyStatsRes.ok) {
          throw new Error("Una o más APIs de scraping fallaron.");
        }

        const incomeData: ScrapedData = await incomeRes.json();
        const balanceData: ScrapedData = await balanceRes.json();
        const fcfData: ScrapedData = await fcfRes.json();
        const keyStatsData: ScrapedData = await keyStatsRes.json();

        // El TTM suele ser el primer dato
        const ttmIncome = incomeData.metrics;
        const ttmBalance = balanceData.metrics;
        const ttmFcf = fcfData.metrics;
        const ttmKeyStats = keyStatsData.metrics;

        const combinedData: FinancialData = {
          headers: incomeData.headers,
          sharesOutstanding:
            ttmBalance.ordinarySharesNumber ||
            ttmIncome.basicAverageShares ||
            [],
          enterpriseValue: ttmKeyStats.enterpriseValue || [],
          revenue: ttmIncome.totalRevenue || [],
          ebit: ttmIncome.ebit || [],
          ebitda: ttmIncome.ebitda || [],
          freeCashFlow: ttmFcf.freeCashFlow || [],
          totalDebt: ttmBalance.totalDebt || [],
          cashAndEquivalents: ttmBalance.cashAndCashEquivalents || [],
          taxRate: ttmIncome.taxRateForCalcs || [],
        };

        setData(combinedData);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Un error inesperado ocurrió."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker]);

  const handleProjectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProjections((prev) => ({ ...prev, [name]: value }));
  };

  const tableRows = data
    ? [
        { name: "Ingresos (Revenue)", values: data.revenue },
        { name: "EBITDA", values: data.ebitda },
        { name: "EBIT", values: data.ebit },
        { name: "Flujo de Caja Libre (FCF)", values: data.freeCashFlow },
        { name: "Deuda Total", values: data.totalDebt },
        { name: "Efectivo y Equivalentes", values: data.cashAndEquivalents },
        { name: "Acciones en Circulación", values: data.sharesOutstanding },
        { name: "Valor de la Empresa (EV)", values: data.enterpriseValue },
      ]
    : [];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 my-12 text-center">
        <p className="text-gray-600">
          Cargando datos financieros para proyecciones...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-12 rounded-lg"
        role="alert"
      >
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 my-12">
      <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
        Análisis de Valoración y Proyecciones
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tabla de Datos Históricos */}
        <div className="lg:col-span-2 overflow-x-auto">
          <h3 className="text-xl font-semibold text-[#0A2342] mb-4">
            Datos Históricos (en miles de USD)
          </h3>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-3 text-left font-semibold text-gray-600">
                  Métrica
                </th>
                {data?.headers.map((header) => (
                  <th
                    key={header}
                    className="py-2 px-3 text-right font-semibold text-gray-600"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tableRows.map((row) => (
                <tr key={row.name} className="hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium text-gray-800">
                    {row.name}
                  </td>
                  {row.values.map((val, index) => (
                    <td
                      key={index}
                      className="py-2 px-3 text-right text-gray-700"
                    >
                      {formatNumber(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Panel de Proyecciones */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-[#0A2342] mb-4">
            Asunciones para Proyección
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Crecimiento de Ventas (%)
              </label>
              <input
                type="number"
                name="salesGrowth"
                value={projections.salesGrowth}
                onChange={handleProjectionChange}
                className="mt-1 w-full p-2 border rounded-md text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Margen EBIT (%)
              </label>
              <input
                type="number"
                name="ebitMargin"
                value={projections.ebitMargin}
                onChange={handleProjectionChange}
                className="mt-1 w-full p-2 border rounded-md text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                FCF / Ventas (%)
              </label>
              <input
                type="number"
                name="fcfAsPercentageOfSales"
                value={projections.fcfAsPercentageOfSales}
                onChange={handleProjectionChange}
                className="mt-1 w-full p-2 border rounded-md text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tasa de Impuestos (%)
              </label>
              <input
                type="number"
                name="taxRate"
                value={projections.taxRate}
                onChange={handleProjectionChange}
                className="mt-1 w-full p-2 border rounded-md text-gray-900"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Estos valores se usarán para calcular el precio objetivo futuro.
          </p>
        </div>
      </div>
    </section>
  );
}
