// components/FreeCashFlowChart/FreeCashFlowChart.tsx
"use client";

import { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
  ChartOptions, // AÑADIDO: Importa el tipo ChartOptions
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { ApiAssetItem } from "@/types/api";
import { formatCurrency } from "../Shared/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
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

interface FreeCashFlowChartProps {
  assetData: ApiAssetItem;
}

export default function FreeCashFlowChart({
  assetData,
}: FreeCashFlowChartProps) {
  const [showDebtToEquity, setShowDebtToEquity] = useState(false);

  const financialHistory = useMemo(() => {
    return (assetData.data.financialHistory || []) as FinancialHistoryItem[];
  }, [assetData]);

  const currencySymbol = assetData.data.price?.currencySymbol || "$";

  const chartData = useMemo(() => {
    if (financialHistory.length === 0) {
      return null;
    }

    const sortedHistory = [...financialHistory].sort(
      (a, b) => parseInt(a.year) - parseInt(b.year)
    );

    const labels = sortedHistory.map((item) => item.year);

    const freeCashFlowData = sortedHistory.map((item) => item.freeCashFlow);
    const operatingCashFlowData = sortedHistory.map(
      (item) => item.operatingCashFlow || 0
    );
    const capitalExpendituresData = sortedHistory.map((item) =>
      item.capitalExpenditures ? Math.abs(item.capitalExpenditures) : 0
    );

    const debtToEquityData = sortedHistory.map((item) => item.debtToEquity);

    if (showDebtToEquity) {
      return {
        labels,
        datasets: [
          {
            type: "bar" as const,
            label: "Free Cash Flow",
            data: freeCashFlowData,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
            yAxisID: "y",
          },
          {
            type: "line" as const,
            label: "Debt to Equity (%)",
            data: debtToEquityData,
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 3,
            fill: false,
            tension: 0.1,
            yAxisID: "y1",
            pointStyle: "circle",
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      };
    } else {
      return {
        labels,
        datasets: [
          {
            type: "bar" as const,
            label: "Operating Cash Flow",
            data: operatingCashFlowData,
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 2,
          },
          {
            type: "bar" as const,
            label: "Capital Expenditures",
            data: capitalExpendituresData,
            backgroundColor: "rgba(255, 99, 132, 0.6)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 2,
          },
          {
            type: "bar" as const,
            label: "Free Cash Flow",
            data: freeCashFlowData,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
          },
        ],
      };
    }
  }, [financialHistory, showDebtToEquity]);

  const chartOptions = useMemo(() => {
    // Usamos el tipo ChartOptions<'bar' | 'line'> como ya habíamos corregido
    const baseOptions: ChartOptions<"bar" | "line"> = {
      responsive: true,
      plugins: {
        legend: {
          position: "top" as const,
        },
        title: {
          display: true,
          text: showDebtToEquity
            ? "Free Cash Flow vs Debt to Equity Ratio"
            : "Análisis de Free Cash Flow",
        },
        tooltip: {
          mode: "index" as const,
          intersect: false,
          callbacks: {
            label: function (context: TooltipItem<"bar" | "line">) {
              const value = context.parsed.y;
              const datasetLabel = context.dataset.label || "";

              if (datasetLabel.includes("Debt to Equity")) {
                return `${datasetLabel}: ${value.toFixed(2)}%`;
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
          stacked: !showDebtToEquity,
        },
        y: {
          type: "linear" as const,
          display: true,
          position: "left" as const,
          title: {
            display: true,
            text: `Flujo de Caja (${currencySymbol})`,
          },
          stacked: !showDebtToEquity,
        },
      },
      maintainAspectRatio: false,
    };

    // AHORA HACEMOS LA ASIGNACIÓN DE FORMA SEGURA
    if (showDebtToEquity) {
      // Verificamos si la propiedad 'scales' existe antes de intentar acceder a ella.
      // TypeScript ya entiende que no es undefined si se entra en este 'if'.
      if (baseOptions.scales) {
        baseOptions.scales.y1 = {
          type: "linear" as const,
          display: true,
          position: "right" as const,
          title: {
            display: true,
            text: "Debt to Equity (%)",
          },
          grid: {
            drawOnChartArea: false,
          },
        };
      }
    }

    return baseOptions;
  }, [showDebtToEquity, currencySymbol]);

  if (!chartData || financialHistory.length === 0) {
    return (
      <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
        <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
          Análisis de Free Cash Flow
        </h2>
        <div className="text-center py-10 text-gray-500">
          <p>No hay datos históricos de Free Cash Flow disponibles.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
      <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
        Análisis de Free Cash Flow
      </h2>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <button
          onClick={() => setShowDebtToEquity(false)}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            !showDebtToEquity
              ? "bg-[#0A2342] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Ver Componentes FCF
        </button>

        <button
          onClick={() => setShowDebtToEquity(true)}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            showDebtToEquity
              ? "bg-[#0A2342] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          FCF vs Debt/Equity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Último FCF</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(
              financialHistory[0]?.freeCashFlow || 0,
              currencySymbol
            )}
          </p>
          <p className="text-sm text-blue-700">
            Año {financialHistory[0]?.year}
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Crecimiento FCF</h3>
          <p className="text-2xl font-bold text-green-600">
            {financialHistory.length > 1
              ? `${(
                  (((financialHistory[0]?.freeCashFlow || 0) -
                    (financialHistory[1]?.freeCashFlow || 0)) /
                    (financialHistory[1]?.freeCashFlow || 1)) *
                  100
                ).toFixed(1)}%`
              : "N/A"}
          </p>
          <p className="text-sm text-green-700">vs año anterior</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">Debt/Equity</h3>
          <p className="text-2xl font-bold text-purple-600">
            {financialHistory[0]?.debtToEquity?.toFixed(1)}%
          </p>
          <p className="text-sm text-purple-700">Ratio actual</p>
        </div>
      </div>

      <div className="relative h-96">
        {chartData && (
          <Chart type="bar" data={chartData} options={chartOptions} />
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">¿Qué significa?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            • <strong>Free Cash Flow (FCF):</strong> Efectivo disponible después
            de inversiones en capital
          </li>
          <li>
            • <strong>Operating Cash Flow:</strong> Efectivo generado por
            operaciones principales
          </li>
          <li>
            • <strong>Capital Expenditures:</strong> Inversiones en propiedad,
            planta y equipo
          </li>
          <li>
            • <strong>Debt to Equity:</strong> Ratio de deuda sobre patrimonio
            (ideal: bajo)
          </li>
        </ul>
      </div>
    </section>
  );
}
