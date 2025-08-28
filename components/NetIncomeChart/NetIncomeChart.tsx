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
import { ApiAssetItem } from "@/types/api";

// ===================================
// INTERFACES Y FUNCIONES AUXILIARES
// ===================================

interface ChartData {
  year: string;
  netIncome: number | null;
}

interface NetIncomeChartProps {
  assetData: ApiAssetItem;
}

// Función auxiliar para formatear valores del eje Y
const formatYAxisTick = (value: number) => {
  if (value === 0) return "$0";

  const absValue = Math.abs(value);
  let formattedValue: string;

  if (absValue >= 1_000_000_000) {
    formattedValue = `$${(value / 1_000_000_000).toFixed(1)}B`;
  } else if (absValue >= 1_000_000) {
    formattedValue = `$${(value / 1_000_000).toFixed(1)}M`;
  } else if (absValue >= 1_000) {
    formattedValue = `$${(value / 1_000).toFixed(1)}K`;
  } else {
    formattedValue = `$${value.toLocaleString()}`;
  }

  return formattedValue;
};

// Función auxiliar para formatear los valores del Tooltip
const formatTooltipValue = (value: number) => {
  if (value === null) return "N/A";
  return `$${value.toLocaleString()}`;
};

// ===================================
// COMPONENTE PRINCIPAL
// ===================================
export default function NetIncomeChart({ assetData }: NetIncomeChartProps) {
  const financialHistory =
    assetData.data.cashflowStatementHistory?.cashflowStatements;

  const hasFinancialHistory = financialHistory && financialHistory.length > 0;

  const chartData: ChartData[] = hasFinancialHistory
    ? financialHistory
        .map((item) => {
          const year = item.endDate
            ? new Date(item.endDate as string).getFullYear().toString()
            : "N/A";
          const netIncomeValue = item.netIncome ?? null;

          return {
            year,
            netIncome: netIncomeValue,
          };
        })
        .reverse()
    : [];

  if (!hasFinancialHistory) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg text-center my-8">
        <h4 className="text-lg font-semibold text-yellow-800 mb-2">
          Datos de Ingresos Netos No Disponibles
        </h4>
        <p className="text-sm text-yellow-600">
          La información histórica de Ingresos Netos no está disponible para
          esta empresa.
        </p>
      </div>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
      <h3 className="text-2xl font-semibold text-[#0A2342] mb-6 text-center">
        Análisis de Ingresos Netos
      </h3>
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-xl font-semibold text-[#0A2342] mb-4 text-center">
          Histórico de Ingresos Netos
        </h4>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              // Aumentar el margen izquierdo para darle más espacio al eje Y
              margin={{ top: 20, right: 30, left: 80, bottom: 5 }} // <-- CAMBIO AQUÍ
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis
                label={{
                  value: "Ingreso Neto ($)",
                  angle: -90,
                  position: "outside",
                  // Mover la etiqueta más a la izquierda
                  dx: -70, // <-- CAMBIO AQUÍ
                  style: { textAnchor: 'middle' }
                }}
                tickFormatter={formatYAxisTick}
              />
              <Tooltip formatter={formatTooltipValue} />
              <Bar dataKey="netIncome" fill="#4B5563" name="Ingreso Neto" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}