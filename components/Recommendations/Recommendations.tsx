"use client";

import React, { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { ArrowPathIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  createRecommendation,
  updateRecommendationStatus,
  deleteRecommendation,
  refreshRecommendationPrices,
} from "@/app/actions/marketActions";
import {
  Recommendation,
  RecommendationStatus,
  NewRecommendationData,
} from "@/types/market";

// Props para el componente principal
interface RecommendationsProps {
  initialRecommendations: Recommendation[];
}

// Props para el sub-componente del formulario
interface NewRecommendationFormProps {
  setError: (msg: string | null) => void;
}

// --- SUB-COMPONENTE FORMULARIO ---
function NewRecommendationForm({ setError }: NewRecommendationFormProps) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    const data: NewRecommendationData = {
      ticker: (formData.get("ticker") as string).toUpperCase(),
      buyPrice: parseFloat(formData.get("buyPrice") as string),
      targetPrice: parseFloat(formData.get("targetPrice") as string),
      responsible: formData.get("responsible") as string,
    };

    if (
      !data.ticker ||
      isNaN(data.buyPrice) ||
      isNaN(data.targetPrice) ||
      !data.responsible
    ) {
      setError("Por favor, completa todos los campos correctamente.");
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await createRecommendation(data);
      if (result?.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
      }
    });
  };

  return (
    <form
      action={handleSubmit}
      ref={formRef}
      className="p-4 bg-gray-50 rounded-md mb-4 flex flex-wrap gap-4 items-end"
    >
      <input
        name="ticker"
        placeholder="Ticker"
        required
        className="px-2 py-1 border rounded text-sm w-24 text-gray-900"
      />
      <input
        name="buyPrice"
        type="number"
        step="0.01"
        placeholder="P. Compra"
        required
        className="px-2 py-1 border rounded text-sm w-28 text-gray-900"
      />
      <input
        name="targetPrice"
        type="number"
        step="0.01"
        placeholder="P. Objetivo"
        required
        className="px-2 py-1 border rounded text-sm w-28 text-gray-900"
      />
      <input
        name="responsible"
        placeholder="Responsable"
        required
        className="px-2 py-1 border rounded text-sm w-32 text-gray-900"
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
      >
        {isPending ? "Agregando..." : "Agregar"}
      </button>
    </form>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function Recommendations({
  initialRecommendations,
}: RecommendationsProps) {
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = (id: string, newStatus: RecommendationStatus) => {
    startTransition(async () => {
      const result = await updateRecommendationStatus(id, newStatus);
      if (result?.error) alert(result.error);
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta recomendación?")) {
      startTransition(async () => {
        const result = await deleteRecommendation(id);
        if (result?.error) alert(result.error);
      });
    }
  };

  const handleRefreshPrices = () => {
    startRefreshTransition(async () => {
      await refreshRecommendationPrices();
    });
  };

  const getStatusColor = (status: RecommendationStatus) => {
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

  const getGainLossPercent = (rec: Recommendation) => {
    const finalPrice =
      rec.status === "VENDER" && rec.sellPrice
        ? rec.sellPrice
        : rec.currentPrice;
    if (rec.buyPrice === 0) return 0;
    return ((finalPrice - rec.buyPrice) / rec.buyPrice) * 100;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8 text-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Recomendaciones</h3>
        <button
          onClick={handleRefreshPrices}
          disabled={isRefreshing}
          className="ml-2 px-3 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 disabled:bg-gray-400"
          title="Actualizar precios"
        >
          <ArrowPathIcon
            className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>
      <NewRecommendationForm setError={setError} />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <div className="overflow-x-auto mt-4">
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {initialRecommendations.map((rec) => (
              <tr key={rec._id}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-semibold text-indigo-600">
                    {rec.ticker}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {new Date(rec.recommendationDate).toLocaleDateString()}
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
                  <select
                    value={rec.status}
                    onChange={(e) =>
                      handleStatusChange(
                        rec._id,
                        e.target.value as RecommendationStatus
                      )
                    }
                    className={`text-xs font-semibold rounded-full px-2 py-1 ${getStatusColor(
                      rec.status
                    )} border-transparent focus:ring-0 focus:outline-none`}
                    disabled={isPending}
                  >
                    <option value="COMPRAR">COMPRAR</option>
                    <option value="MANTENER">MANTENER</option>
                    <option value="VENDER">VENDER</option>
                  </select>
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
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleDelete(rec._id)}
                    disabled={isPending}
                    className="text-red-500 hover:text-red-700 disabled:text-gray-300"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
