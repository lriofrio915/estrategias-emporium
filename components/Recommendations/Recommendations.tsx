// components/Recommendations/Recommendations.tsx
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

// Para solucionar el error 170:15 (Warning: 'result' is assigned a value but never used)
// En las Server Actions que devuelven { success: true } y no un objeto específico,
// podemos ignorar la variable 'result' si la destructuramos correctamente al verificar el error.

// Props para el componente principal
interface RecommendationsProps {
  recommendations: Recommendation[]; // La lista actual
  fetchRecommendations: () => void; // Función para recargar la lista
  isRecommendationsLoading: boolean; // Flag de carga inicial o recarga
}

// Props para el sub-componente del formulario
interface NewRecommendationFormProps {
  setError: (msg: string | null) => void;
  onSuccess: () => void; // Callback para notificar el éxito
}

// --- Tipo de Retorno para acciones de CRUD (implícito en tu código) ---
interface ActionResponse {
  success?: boolean;
  error?: string;
  updated?: number; // Usado por refreshRecommendationPrices
}

// --- SUB-COMPONENTE FORMULARIO ---
function NewRecommendationForm({
  setError,
  onSuccess,
}: NewRecommendationFormProps) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    // FIX: El tipo NewRecommendationData DEBE incluir portfolioSlug y sellPrice (opcionales)
    // Asumiendo que has actualizado tu tipo NewRecommendationData en '@/types/market'
    // para incluir los campos 'portfolioSlug' y 'sellPrice?: null', procedemos:
    const data: NewRecommendationData = {
      ticker: (formData.get("ticker") as string).toUpperCase(),
      buyPrice: parseFloat(formData.get("buyPrice") as string),
      targetPrice: parseFloat(formData.get("targetPrice") as string),
      responsible: formData.get("responsible") as string,
      portfolioSlug: "default", // Valor por defecto
      sellPrice: null,
    } as NewRecommendationData; // Usamos as NewRecommendationData, asumiendo que los tipos ahora coinciden.

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
      // FIX: Tipamos la respuesta como ActionResponse
      const result: ActionResponse = await createRecommendation(data);

      // Corregida la verificación de error
      if (result.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
        onSuccess(); // Notifica al padre que debe recargar la lista
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
  recommendations,
  fetchRecommendations,
  isRecommendationsLoading,
}: RecommendationsProps) {
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Mantenemos una lista de IDs que están en proceso de actualización (para estado visual)
  const [pendingUpdateIds, setPendingUpdateIds] = useState<string[]>([]);

  const handleStatusChange = (id: string, newStatus: RecommendationStatus) => {
    setPendingUpdateIds((prev) => [...prev, id]);

    startTransition(async () => {
      // FIX: Tipamos la respuesta como ActionResponse
      const result: ActionResponse = await updateRecommendationStatus(
        id,
        newStatus
      );
      setPendingUpdateIds((prev) => prev.filter((pid) => pid !== id));

      if (result.error) {
        alert(result.error);
      } else {
        fetchRecommendations(); // Recarga la lista después de la actualización
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta recomendación?")) {
      setPendingUpdateIds((prev) => [...prev, id]);

      startTransition(async () => {
        // FIX: Tipamos la respuesta como ActionResponse
        const result: ActionResponse = await deleteRecommendation(id);
        setPendingUpdateIds((prev) => prev.filter((pid) => pid !== id));

        // CORRECCIÓN ESLINT: `result` ahora se usa para verificar el error.
        if (result.error) {
          alert(result.error);
        } else {
          fetchRecommendations(); // Recarga la lista después de la eliminación
        }
      });
    }
  };

  const handleRefreshPrices = () => {
    startRefreshTransition(async () => {
      try {
        // FIX: La Server Action lanza un error en caso de fallo, por eso la envolvemos en try/catch.
        await refreshRecommendationPrices();
      } catch (e: unknown) {
        // FIX: Reemplazamos any por unknown
        const err = e as Error;
        alert(err.message || "Error al actualizar precios.");
      }
      fetchRecommendations(); // Recarga la lista después de actualizar precios (tanto si falla como si tiene éxito)
    });
  };

  const handleNewRecommendationSuccess = () => {
    fetchRecommendations();
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

  const isLoading = isRecommendationsLoading || isPending || isRefreshing;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8 text-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Oportunidades</h3>
        <button
          onClick={handleRefreshPrices}
          disabled={isRefreshing || isLoading}
          className="ml-2 px-3 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 disabled:bg-gray-400"
          title="Actualizar precios"
        >
          <ArrowPathIcon
            className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>
      {/* Pasamos el callback de éxito al formulario */}
      <NewRecommendationForm
        setError={setError}
        onSuccess={handleNewRecommendationSuccess}
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {/* Indicador de carga centralizado para la tabla */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
          <p className="text-gray-600">Cargando recomendaciones...</p>
        </div>
      ) : (
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
              {recommendations.map((rec) => {
                const isUpdating = pendingUpdateIds.includes(rec._id);

                return (
                  <tr
                    key={rec._id}
                    className={
                      isUpdating ? "opacity-50 transition-opacity" : ""
                    }
                  >
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
                        disabled={isUpdating || isLoading}
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
                        disabled={isUpdating || isLoading}
                        className="text-red-500 hover:text-red-700 disabled:text-gray-300"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
