"use client";
import React, { useState } from "react";
import {
  TrashIcon,
  PencilIcon,
  PlusCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

// Tipos para la tabla de recomendaciones
interface Recommendation {
  id: number;
  ticker: string;
  assetName: string;
  recommendationDate: string;
  buyPrice: number;
  currentPrice: number;
  targetPrice: number;
  sellPrice?: number;
  status: "COMPRAR" | "MANTENER" | "VENDER";
  responsible: string;
}

// Datos de ejemplo
const initialRecs: Recommendation[] = [
  {
    id: 1,
    ticker: "NVDA",
    assetName: "NVIDIA Corp",
    recommendationDate: "2025-09-01",
    buyPrice: 125.5,
    currentPrice: 130.1,
    targetPrice: 150.0,
    status: "MANTENER",
    responsible: "L. Riofrio",
  },
  {
    id: 2,
    ticker: "AAPL",
    assetName: "Apple Inc.",
    recommendationDate: "2025-08-15",
    buyPrice: 170.2,
    currentPrice: 175.45,
    targetPrice: 190.0,
    status: "COMPRAR",
    responsible: "D. Aluisa",
  },
  {
    id: 3,
    ticker: "TSLA",
    assetName: "Tesla, Inc.",
    recommendationDate: "2025-07-20",
    buyPrice: 250.0,
    currentPrice: 230.75,
    targetPrice: 200.0,
    status: "VENDER",
    sellPrice: 235.5,
    responsible: "M. Saa",
  },
];

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState(initialRecs);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPRAR":
        return "bg-green-100 text-green-800";
      case "MANTENER":
        return "bg-yellow-100 text-yellow-800";
      case "VENDER":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calcula la ganancia/pérdida
  const getGainLossPercent = (rec: Recommendation) => {
    const finalPrice =
      rec.status === "VENDER" ? rec.sellPrice! : rec.currentPrice;
    return ((finalPrice - rec.buyPrice) / rec.buyPrice) * 100;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Recomendaciones</h3>
        <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center">
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Nueva Recomendación
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Activo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                P. Rec.
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                P. Actual
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                G/P (%)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Responsable
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Informe
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recommendations.map((rec) => (
              <tr key={rec.id}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-semibold text-indigo-600">
                    {rec.ticker}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {rec.recommendationDate}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  ${rec.buyPrice.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-800">
                  ${rec.currentPrice.toFixed(2)}
                </td>
                <td
                  className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${
                    getGainLossPercent(rec) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {getGainLossPercent(rec).toFixed(2)}%
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`text-xs font-semibold rounded-full px-3 py-1 ${getStatusColor(
                      rec.status
                    )}`}
                  >
                    {rec.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {rec.responsible}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <Link
                    href={`/stock-screener/${rec.ticker.toLowerCase()}`}
                    className="text-blue-600 hover:underline"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
