// components/PerformanceChart/PerformanceChart.tsx
"use client";

import { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem, // Importa este tipo
} from "chart.js";
import { Line } from "react-chartjs-2";
import { ApiAssetItem } from "@/types/api";
import { parseFinanceDate, formatCurrency } from "../Shared/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type TimePeriod = "1W" | "1M" | "3M" | "1Y" | "5Y";

interface PerformanceChartProps {
  assetData: ApiAssetItem;
}

const periodButtons = [
  { key: "1W" as TimePeriod, label: "1 Semana" },
  { key: "1M" as TimePeriod, label: "1 Mes" },
  { key: "3M" as TimePeriod, label: "3 Meses" },
  { key: "1Y" as TimePeriod, label: "1 Año" },
  { key: "5Y" as TimePeriod, label: "5 Años" },
];

export default function PerformanceChart({ assetData }: PerformanceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("1M");
  const currencySymbol = assetData.data.price?.currencySymbol || "€";

  const filteredHistoricalData = useMemo(() => {
    if (!assetData.data.historical || assetData.data.historical.length === 0) {
      return [];
    }

    const now = new Date();
    let cutoffDate: Date;

    switch (selectedPeriod) {
      case "1W":
        cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "1M":
        cutoffDate = new Date(now);
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "3M":
        cutoffDate = new Date(now);
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case "1Y":
        cutoffDate = new Date(now);
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case "5Y":
        cutoffDate = new Date(now);
        cutoffDate.setFullYear(now.getFullYear() - 5);
        break;
      default:
        cutoffDate = new Date(now);
        cutoffDate.setMonth(now.getMonth() - 1);
    }

    return assetData.data.historical.filter((item) => {
      const itemDate = parseFinanceDate(item.date);
      return itemDate >= cutoffDate;
    });
  }, [assetData, selectedPeriod]);

  const performanceChartData = useMemo(() => {
    if (filteredHistoricalData.length === 0) {
      return null;
    }

    const labels = filteredHistoricalData.map((item) => {
      const date = parseFinanceDate(item.date);
      return date.toLocaleDateString();
    });

    const data = filteredHistoricalData.map((item) => item.close);

    return {
      labels: labels,
      datasets: [
        {
          label: "Precio de Cierre",
          data: data,
          fill: false,
          borderColor: "#0A2342",
          backgroundColor: "rgba(10, 35, 66, 0.1)",
          tension: 0.1,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: "#0A2342",
        },
      ],
    };
  }, [filteredHistoricalData]);

  const performanceChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Rendimiento Histórico (${selectedPeriod})`,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          // Aquí está la corrección: importamos TooltipItem y lo usamos para el tipo del contexto
          label: function (context: TooltipItem<"line">) {
            return `Precio: ${formatCurrency(
              context.parsed.y,
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
          text: "Fecha",
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        title: {
          display: true,
          text: `Precio (${currencySymbol})`,
        },
      },
    },
    maintainAspectRatio: false,
  };

  if (!performanceChartData) {
    return null;
  }

  return (
    <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
      <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
        Rendimiento Histórico
      </h2>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {periodButtons.map((period) => (
          <button
            key={period.key}
            onClick={() => setSelectedPeriod(period.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === period.key
                ? "bg-[#0A2342] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      <div className="relative h-96">
        <Line options={performanceChartOptions} data={performanceChartData} />
      </div>
    </section>
  );
}
