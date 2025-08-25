// components/DebtHistoryChart/DebtHistoryChart.tsx
"use client";

import { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
  ChartOptions, // AÑADIDO: Importa el tipo ChartOptions
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { ApiAssetItem } from "@/types/api";
import { formatCurrency } from "../Shared/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FinancialHistoryItem {
  year: string;
  freeCashFlow: number;
  totalDebt: number;
  totalEquity: number;
  debtToEquity: number;
  operatingCashFlow?: number;
  capitalExpenditures?: number;
}

interface DebtHistoryChartProps {
  assetData: ApiAssetItem;
}

export default function DebtHistoryChart({ assetData }: DebtHistoryChartProps) {
  const [showGrowthRate, setShowGrowthRate] = useState(false);

  const financialHistory = useMemo(() => {
    return (assetData.data.financialHistory || []) as FinancialHistoryItem[];
  }, [assetData]);

  const currencySymbol = assetData.data.price?.currencySymbol || "$";

  const debtGrowthRates = useMemo(() => {
    if (financialHistory.length < 2) return [];

    // TIPO CORREGIDO: ahora el arreglo puede contener números o null
    const rates: (number | null)[] = []; 
    for (let i = 0; i < financialHistory.length - 1; i++) {
      const currentDebt = financialHistory[i].totalDebt;
      const previousDebt = financialHistory[i + 1].totalDebt;
      const growthRate =
        previousDebt !== 0
          ? ((currentDebt - previousDebt) / previousDebt) * 100
          : 0;
      rates.push(growthRate);
    }
    // Añadimos null sin la necesidad de 'as any'
    rates.push(null); 

    return rates;
  }, [financialHistory]);

  const chartData = useMemo(() => {
    if (financialHistory.length === 0) {
      return null;
    }

    const sortedHistory = [...financialHistory].sort(
      (a, b) => parseInt(a.year) - parseInt(b.year)
    );

    const labels = sortedHistory.map((item) => item.year);

    const debtData = sortedHistory.map((item) => item.totalDebt);
    const equityData = sortedHistory.map((item) => item.totalEquity);

    if (showGrowthRate) {
      const growthData = debtGrowthRates.map((rate) =>
        rate !== null ? rate : 0
      );

      return {
        labels: labels.filter((_, index) => debtGrowthRates[index] !== null),
        datasets: [
          {
            label: "Crecimiento Anual de Deuda (%)",
            data: growthData.filter((rate) => rate !== null),
            backgroundColor: growthData.map(
              (rate) =>
                rate > 0
                  ? "rgba(239, 68, 68, 0.6)" // Rojo para crecimiento positivo
                  : "rgba(34, 197, 94, 0.6)" // Verde para reducción
            ),
            borderColor: growthData.map((rate) =>
              rate > 0 ? "rgba(239, 68, 68, 1)" : "rgba(34, 197, 94, 1)"
            ),
            borderWidth: 2,
          },
        ],
      };
    } else {
      return {
        labels,
        datasets: [
          {
            label: "Deuda Total",
            data: debtData,
            backgroundColor: "rgba(239, 68, 68, 0.6)",
            borderColor: "rgba(239, 68, 68, 1)",
            borderWidth: 2,
          },
          {
            label: "Patrimonio Neto",
            data: equityData,
            backgroundColor: "rgba(34, 197, 94, 0.6)",
            borderColor: "rgba(34, 197, 94, 1)",
            borderWidth: 2,
          },
        ],
      };
    }
  }, [financialHistory, showGrowthRate, debtGrowthRates]);

  // TIPO CORREGIDO: usamos el tipo de Chart.js
  const chartOptions = useMemo(() => {
    const baseOptions: ChartOptions<'bar'> = {
      responsive: true,
      plugins: {
        legend: {
          position: "top" as const,
        },
        title: {
          display: true,
          text: showGrowthRate
            ? "Crecimiento Anual de la Deuda"
            : "Evolución de Deuda y Patrimonio",
        },
        tooltip: {
          mode: "index" as const,
          intersect: false,
          callbacks: {
            label: function (context: TooltipItem<"bar">) {
              const value = context.parsed.y;
              const datasetLabel = context.dataset.label || "";

              if (datasetLabel.includes("%") || showGrowthRate) {
                return `${datasetLabel}: ${value > 0 ? "+" : ""}${value.toFixed(
                  1
                )}%`;
              }

              return `${datasetLabel}: ${formatCurrency(
                value,
                currencySymbol
              )}`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Año Fiscal",
          },
          stacked: false,
        },
        y: {
          type: "linear" as const,
          display: true,
          position: "left" as const,
          title: {
            display: true,
            text: showGrowthRate
              ? "Crecimiento (%)"
              : `Monto (${currencySymbol})`,
          },
          stacked: false,
        },
      },
      maintainAspectRatio: false,
    };

    return baseOptions;
  }, [showGrowthRate, currencySymbol]);

  if (!chartData || financialHistory.length === 0) {
    return (
      <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
        <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
          Histórico de Deuda
        </h2>
        <div className="text-center py-10 text-gray-500">
          <p>No hay datos históricos de deuda disponibles.</p>
        </div>
      </section>
    );
  }

  // Calcular estadísticas
  const currentDebt = financialHistory[0]?.totalDebt || 0;
  const peakDebt = Math.max(...financialHistory.map((item) => item.totalDebt));
  const debtChange =
    financialHistory.length > 1
      ? currentDebt - financialHistory[1].totalDebt
      : 0;
  const debtChangePercent =
    financialHistory.length > 1 && financialHistory[1].totalDebt !== 0
      ? (debtChange / financialHistory[1].totalDebt) * 100
      : 0;

  return (
    <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
      <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
        Histórico de Deuda
      </h2>

      {/* Selector de vista */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <button
          onClick={() => setShowGrowthRate(false)}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            !showGrowthRate
              ? "bg-[#0A2342] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Montos Absolutos
        </button>

        <button
          onClick={() => setShowGrowthRate(true)}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            showGrowthRate
              ? "bg-[#0A2342] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Tasa de Crecimiento
        </button>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800">Deuda Actual</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(currentDebt, currencySymbol)}
          </p>
          <p className="text-sm text-red-700">
            Año {financialHistory[0]?.year}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Cambio Anual</h3>
          <p
            className={`text-2xl font-bold ${
              debtChange >= 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {debtChange >= 0 ? "+" : ""}
            {formatCurrency(debtChange, currencySymbol)}
          </p>
          <p
            className={`text-sm ${
              debtChange >= 0 ? "text-red-700" : "text-green-700"
            }`}
          >
            {debtChangePercent >= 0 ? "+" : ""}
            {debtChangePercent.toFixed(1)}% vs año anterior
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">Pico de Deuda</h3>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(peakDebt, currencySymbol)}
          </p>
          <p className="text-sm text-purple-700">Máximo histórico</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Deuda/Patrimonio</h3>
          <p className="text-2xl font-bold text-green-600">
            {financialHistory[0]?.debtToEquity?.toFixed(1)}%
          </p>
          <p className="text-sm text-green-700">Ratio actual</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="relative h-96">
        {chartData && <Bar data={chartData} options={chartOptions} />}
      </div>

      {/* Leyenda explicativa */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Análisis de Deuda</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            • <strong>Deuda Total:</strong> Obligaciones financieras totales de
            la empresa
          </li>
          <li>
            • <strong>Patrimonio Neto:</strong> Valor contable de los activos
            menos pasivos
          </li>
          <li>
            • <strong>Crecimiento positivo:</strong> Aumento de deuda (puede ser
            señal de expansión o riesgo)
          </li>
          <li>
            • <strong>Crecimiento negativo:</strong> Reducción de deuda (mejora
            de salud financiera)
          </li>
          <li>
            • <strong>Ratio Deuda/Patrimonio:</strong> Idealmente menor al 100%
          </li>
        </ul>
      </div>
    </section>
  );
}