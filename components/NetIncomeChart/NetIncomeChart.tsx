"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ApiAssetItem,
  YahooFinanceRawValue,
  YahooFinanceDateValue,
} from "@/types/api";

interface ChartData {
  year: string;
  netIncome: number | null;
}

interface NetIncomeChartProps {
  assetData: ApiAssetItem;
}

const getNumericValue = (
  value: number | YahooFinanceRawValue | null | undefined
): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "object" && "raw" in value) return value.raw ?? null;
  return null;
};

const formatYAxisTick = (value: number) => {
  if (value === 0) return "$0";
  const absValue = Math.abs(value);

  if (absValue >= 1_000_000_000)
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (absValue >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (absValue >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
};

const formatTooltipValue = (value: number | null) => {
  return value === null ? "N/A" : `$${value.toLocaleString()}`;
};

// Función para extraer datos de ingresos netos de múltiples fuentes
const extractNetIncomeData = (assetData: ApiAssetItem): ChartData[] => {
  const results: ChartData[] = [];

  // 1. Buscar en cashflowStatementHistory
  const cashflowData =
    assetData.data.cashflowStatementHistory?.cashflowStatements;
  if (cashflowData && cashflowData.length > 0) {
    cashflowData.forEach((item) => {
      try {
        const dateValue = getDateValue(item.endDate);
        if (dateValue) {
          const year = new Date(dateValue * 1000).getFullYear().toString();
          const netIncome = getNumericValue(item.netIncome);
          if (netIncome !== null) {
            results.push({ year, netIncome });
          }
        }
      } catch {
        console.warn("Error procesando cashflow item");
      }
    });
  }

  // 2. Buscar en incomeStatementHistory
  const incomeData = assetData.data.incomeStatementHistory?.incomeStatements;
  if (incomeData && incomeData.length > 0) {
    incomeData.forEach((item) => {
      try {
        const dateValue = getDateValue(item.endDate);
        if (dateValue) {
          const year = new Date(dateValue * 1000).getFullYear().toString();
          const netIncome = getNumericValue(item.netIncome);
          if (netIncome !== null) {
            // Evitar duplicados por año
            const existingIndex = results.findIndex((r) => r.year === year);
            if (existingIndex === -1) {
              results.push({ year, netIncome });
            }
          }
        }
      } catch {
        console.warn("Error procesando income item");
      }
    });
  }

  // 3. Buscar en financialData (datos actuales)
  const financialData = assetData.data.financialData;
  if (financialData && financialData.netIncome !== undefined) {
    const netIncome = getNumericValue(financialData.netIncome);
    if (netIncome !== null) {
      // Usar el año actual para financialData
      const currentYear = new Date().getFullYear().toString();
      results.push({ year: currentYear, netIncome });
    }
  }

  return results.sort((a, b) => a.year.localeCompare(b.year));
};

// Función auxiliar para extraer valor de fecha
const getDateValue = (
  date: YahooFinanceDateValue | number | string | null | undefined
): number | null => {
  if (!date) return null;

  if (typeof date === "object") {
    if ("raw" in date && typeof date.raw === "number") {
      return date.raw;
    }
    if ("fmt" in date && typeof date.fmt === "string") {
      // Intentar parsear fecha string
      try {
        const dateObj = new Date(date.fmt);
        return Math.floor(dateObj.getTime() / 1000);
      } catch {
        return null;
      }
    }
    return null;
  }

  if (typeof date === "number") {
    return date < 1000000000000 ? date : Math.floor(date / 1000);
  }

  if (typeof date === "string") {
    try {
      const dateObj = new Date(date);
      return Math.floor(dateObj.getTime() / 1000);
    } catch {
      return null;
    }
  }

  return null;
};

export default function NetIncomeChart({ assetData }: NetIncomeChartProps) {
  // DEBUG: Ver estructura de datos
  console.log("META data analysis:", {
    ticker: assetData.ticker,
    hasCashflow: !!assetData.data.cashflowStatementHistory,
    hasIncome: !!assetData.data.incomeStatementHistory,
    hasFinancial: !!assetData.data.financialData,
    cashflowItems:
      assetData.data.cashflowStatementHistory?.cashflowStatements?.length || 0,
    incomeItems:
      assetData.data.incomeStatementHistory?.incomeStatements?.length || 0,
    financialNetIncome: assetData.data.financialData?.netIncome,
  });

  const chartData = extractNetIncomeData(assetData);
  const hasValidData =
    chartData.length > 0 && chartData.some((item) => item.netIncome !== null);

  if (!hasValidData) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg text-center my-8">
        <h4 className="text-lg font-semibold text-yellow-800 mb-2">
          Datos de Ingresos Netos No Disponibles
        </h4>
        <p className="text-sm text-yellow-600">
          No se encontraron datos de ingresos netos para {assetData.ticker}.
        </p>
        <div className="text-xs text-yellow-500 mt-4 text-left">
          <p>Módulos disponibles: {Object.keys(assetData.data).join(", ")}</p>
          <p>
            Cashflow items:{" "}
            {assetData.data.cashflowStatementHistory?.cashflowStatements
              ?.length || 0}
          </p>
          <p>
            Income items:{" "}
            {assetData.data.incomeStatementHistory?.incomeStatements?.length ||
              0}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow-xl">
      <div className="bg-gray-50 pt-1 rounded-lg">
        <h4 className="text-xl font-semibold text-[#0A2342] mb-4 text-center">
          Histórico de Ingresos Netos - {assetData.ticker}
        </h4>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis
                tickFormatter={formatYAxisTick}
                label={{
                  value: "Ingreso Neto ($)",
                  angle: -90,
                  position: "outside",
                  dx: -70,
                  style: { textAnchor: "middle" },
                }}
              />
              <Tooltip
                formatter={(value) =>
                  formatTooltipValue(value as number | null)
                }
                labelFormatter={(label) => `Año: ${label}`}
              />
              <Bar
                dataKey="netIncome"
                fill="#4B5563"
                name="Ingreso Neto"
                fillOpacity={0.8}
                barSize={40} // 👈 Ancho reducido de las barras
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
