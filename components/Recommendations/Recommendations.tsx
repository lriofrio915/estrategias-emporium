// components/Recommendations/Recommendations.tsx
"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowPathIcon,
  TrashIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  PlusCircleIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  createRecommendation,
  updateRecommendationStatus,
  deleteRecommendation,
  refreshRecommendationPrices,
  getRecommendations as fetchPaginatedRecommendations,
  updateRecommendationData,
} from "@/app/actions/marketActions";
import { Recommendation, RecommendationStatus } from "@/types/market";
// NUEVO: Importamos el modal
import SuccessModal from "@/components/Shared/SuccessModal";

const ROWS_PER_PAGE = 10;

// --- Tipos de Retorno (simplificados) ---
interface ActionResponse {
  success?: boolean;
  error?: string;
  updated?: number;
  message?: string;
}
interface PaginatedData {
  recommendations: Recommendation[];
  totalPages: number;
  totalCount: number;
  error?: string;
}

// --- Funciones Auxiliares (Formato) ---

const formatCurrency = (
  value: number | string | null | undefined,
  currencySymbol: string = "$"
): string => {
  if (value === null || value === undefined) {
    return "N/A";
  }

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue) || !isFinite(numValue)) {
    return "N/A";
  }

  return `${currencySymbol}${numValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getGainLossPercent = (rec: Recommendation) => {
  const finalPrice =
    rec.status === "VENDER" && rec.sellPrice ? rec.sellPrice : rec.currentPrice;

  const pRec = rec.purchasePrice || rec.buyPrice || 0;

  if (pRec === 0) return 0;

  return ((finalPrice - pRec) / pRec) * 100;
};

// --- SUB-COMPONENTE FORMULARIO DE CREACIÓN ---
function NewRecommendationForm({
  setError,
  onSuccess,
}: {
  setError: (msg: string | null) => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    if (
      !(formData.get("ticker") as string)?.trim() ||
      !parseFloat(formData.get("buyPrice") as string) ||
      !parseFloat(formData.get("targetPrice") as string) ||
      !(formData.get("responsible") as string)?.trim()
    ) {
      setError("Por favor, completa todos los campos de texto requeridos.");
      return;
    }

    startTransition(async () => {
      setError(null);

      const result: ActionResponse = await createRecommendation(formData);

      if (result.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
        setShowForm(false);
        onSuccess();
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 mb-8 border border-gray-200">
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full flex items-center justify-center text-lg font-semibold rounded-lg transition-colors duration-200 text-[#0A2342] hover:text-[#2CA58D] py-2"
      >
        <PlusCircleIcon className="h-6 w-6 mr-2 text-[#2CA58D]" />
        {showForm ? "Ocultar Formulario" : "Añadir Nueva Oportunidad"}
        {showForm ? (
          <ChevronUpIcon className="ml-2 h-5 w-5" />
        ) : (
          <ChevronDownIcon className="ml-2 h-5 w-5" />
        )}
      </button>
      {showForm && (
        <form action={handleSubmit} ref={formRef} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <input
              type="text"
              name="ticker"
              placeholder="Ticker"
              required
              className="p-2 border border-gray-300 rounded-lg text-gray-900"
            />
            <input
              type="number"
              name="buyPrice"
              step="0.01"
              placeholder="P. Rec. (P. Compra)"
              required
              className="p-2 border border-gray-300 rounded-lg text-gray-900"
            />
            <input
              type="number"
              name="targetPrice"
              step="0.01"
              placeholder="P. Objetivo"
              required
              className="p-2 border border-gray-300 rounded-lg text-gray-900"
            />
            <input
              type="text"
              name="responsible"
              placeholder="Responsable"
              required
              className="p-2 border border-gray-300 rounded-lg text-gray-900"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t pt-4 border-gray-200">
            <label
              htmlFor="reportFile"
              className="block text-sm font-medium text-gray-700 w-full sm:w-auto"
            >
              Adjuntar Informe (PDF/Word):
            </label>
            <input
              type="file"
              id="reportFile"
              name="reportFile"
              accept=".pdf,.doc,.docx"
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0A2342] file:text-white hover:file:bg-[#1A3A5A]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-[#2CA58D] text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-colors duration-200 flex items-center justify-center"
              disabled={isPending}
            >
              {isPending ? (
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Agregar Oportunidad"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// --- SUB-COMPONENTE FORMULARIO DE EDICIÓN ---
function EditRecommendationForm({
  recommendation,
  onClose,
  onSuccess,
  setError,
  currentError,
}: {
  recommendation: Recommendation;
  onClose: () => void;
  onSuccess: () => void;
  setError: (msg: string | null) => void;
  currentError: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [removeFileFlag, setRemoveFileFlag] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const id = recommendation._id;

  const handleEditSubmit = (formData: FormData) => {
    const purchasePrice = parseFloat(formData.get("purchasePrice") as string);
    const targetPrice = parseFloat(formData.get("targetPrice") as string);
    const responsible = formData.get("responsible") as string;

    if (isNaN(purchasePrice) || isNaN(targetPrice) || !responsible.trim()) {
      setError(
        "Por favor, completa los campos numéricos y de responsable correctamente."
      );
      return;
    }

    startTransition(async () => {
      setError(null);

      formData.append("removeFile", removeFileFlag.toString());
      formData.append("id", id);
      formData.append("ticker", recommendation.ticker);

      const result: ActionResponse = await updateRecommendationData(
        id,
        formData
      );

      if (result.error) {
        setError(result.error);
      } else {
        onClose();
        onSuccess();
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white text-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg relative border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold mb-4">
          Editar Recomendación: {recommendation.ticker}
        </h2>
        <form
          action={handleEditSubmit}
          ref={formRef}
          className="space-y-4"
          encType="multipart/form-data"
        >
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Ticker (No editable)
              </span>
              <input
                type="text"
                name="ticker"
                defaultValue={recommendation.ticker}
                disabled
                className="mt-1 p-2 border border-gray-300 rounded-lg text-gray-500 bg-gray-100 w-full"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Responsable
              </span>
              <input
                type="text"
                name="responsible"
                defaultValue={recommendation.responsible}
                placeholder="Responsable"
                required
                className="mt-1 p-2 border border-gray-300 rounded-lg text-gray-900 w-full"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">P. Rec.</span>
              <input
                type="number"
                name="purchasePrice"
                step="0.01"
                defaultValue={(
                  recommendation.purchasePrice ||
                  recommendation.buyPrice ||
                  0
                ).toString()}
                placeholder="P. Rec."
                required
                className="mt-1 p-2 border border-gray-300 rounded-lg text-gray-900 w-full"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                P. Objetivo
              </span>
              <input
                type="number"
                name="targetPrice"
                step="0.01"
                defaultValue={(recommendation.targetPrice ?? 0).toString()}
                placeholder="P. Objetivo"
                required
                className="mt-1 p-2 border border-gray-300 rounded-lg text-gray-900 w-full"
              />
            </label>
          </div>

          {/* Sección de Archivos */}
          <div className="border border-gray-300 rounded-lg p-3 space-y-2">
            <h3 className="font-semibold text-sm">Informe Adjunto</h3>
            {recommendation.reportUrl && !removeFileFlag ? (
              <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                <a
                  href={recommendation.reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 truncate flex items-center"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  {recommendation.reportUrl.split("/").pop() ||
                    "Informe actual"}
                </a>
                <button
                  type="button"
                  onClick={() => setRemoveFileFlag(true)}
                  className="text-red-500 hover:text-red-700 ml-2"
                  title="Eliminar informe actual"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                {removeFileFlag ? (
                  <span className="text-red-500">
                    Informe marcado para eliminación. Suba uno nuevo para
                    reemplazar.
                  </span>
                ) : (
                  <span>No hay informe adjunto.</span>
                )}
              </div>
            )}

            {/* Input para subir o reemplazar archivo */}
            <label
              htmlFor="editReportFile"
              className="block text-sm font-medium text-gray-700 pt-2"
            >
              {recommendation.reportUrl
                ? "Reemplazar o Subir (Opcional):"
                : "Subir Informe (Opcional):"}
            </label>
            <input
              type="file"
              id="editReportFile"
              name="reportFile"
              accept=".pdf,.doc,.docx"
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0A2342] file:text-white hover:file:bg-[#1A3A5A]"
            />
            {recommendation.reportUrl && removeFileFlag && (
              <button
                type="button"
                onClick={() => setRemoveFileFlag(false)}
                className="text-sm text-blue-600 hover:underline"
              >
                Deshacer eliminación de informe.
              </button>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
              disabled={isPending}
            >
              {isPending ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
          {isPending && (
            <div className="text-center text-sm text-gray-500">
              La tabla se actualizará al terminar.
            </div>
          )}
          {currentError && (
            <div className="text-red-500 text-sm mt-2">{currentError}</div>
          )}
        </form>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL (Recomendaciones) ---
interface RecommendationsProps {
  initialRecommendations: Recommendation[];
  initialTotalPages: number;
  initialTotalCount: number;
}

export default function Recommendations({
  initialRecommendations,
  initialTotalPages,
  initialTotalCount,
}: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    initialRecommendations
  );
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // NUEVO ESTADO: Mensaje del modal de éxito
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [editingRec, setEditingRec] = useState<Recommendation | null>(null);

  const [isPending, startTransition] = useTransition();
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [pendingUpdateIds, setPendingUpdateIds] = useState<string[]>([]);

  const isLoading = isPending || isRefreshing;

  const fetchRecommendations = React.useCallback(
    async (page: number = currentPage) => {
      if (isLoading && page === currentPage) return;

      startRefreshTransition(async () => {
        setError(null);
        try {
          const result: PaginatedData = await fetchPaginatedRecommendations(
            page
          );

          if (result.error) {
            setError(result.error);
          } else {
            setRecommendations(result.recommendations);
            setTotalPages(result.totalPages);
            setTotalCount(result.totalCount);
            setCurrentPage(page);
          }
        } catch (e) {
          console.error("Fallo al recargar recomendaciones:", e);
          setError("Fallo al recargar los datos de las recomendaciones.");
        }
      });
    },
    [currentPage, startRefreshTransition, isLoading]
  );

  useEffect(() => {
    if (currentPage !== 1 || initialRecommendations.length === 0) {
      fetchRecommendations(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // --- Manejadores de CRUD/Actions ---

  const handleStatusChange = (id: string, newStatus: RecommendationStatus) => {
    setPendingUpdateIds((prev) => [...prev, id]);

    startTransition(async () => {
      const result: ActionResponse = await updateRecommendationStatus(
        id,
        newStatus
      );
      setPendingUpdateIds((prev) => prev.filter((pid) => pid !== id));

      if (result.error) {
        alert(result.error);
      } else {
        // Muestra modal de éxito
        setSuccessMessage(`Estado actualizado a ${newStatus} con éxito.`);
        fetchRecommendations();
      }
    });
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        "¿Estás seguro de eliminar esta recomendación y su informe adjunto?"
      )
    ) {
      setPendingUpdateIds((prev) => [...prev, id]);

      startTransition(async () => {
        const result: ActionResponse = await deleteRecommendation(id);
        setPendingUpdateIds((prev) => prev.filter((pid) => pid !== id));

        if (result.error) {
          alert(result.error);
        } else {
          // Muestra modal de éxito
          setSuccessMessage("Recomendación eliminada con éxito.");
          const targetPage =
            recommendations.length === 1 && currentPage > 1
              ? currentPage - 1
              : currentPage;
          fetchRecommendations(targetPage);
        }
      });
    }
  };

  const handleRefreshPrices = () => {
    startRefreshTransition(async () => {
      try {
        const result: ActionResponse = await refreshRecommendationPrices();
        if (result.error) throw new Error(result.error);

        // Muestra modal de éxito
        setSuccessMessage(
          `Precios actualizados para ${result.updated} activos.`
        );
        fetchRecommendations(currentPage);
      } catch (e: unknown) {
        const err = e as Error;
        alert(err.message || "Error al actualizar precios.");
      }
    });
  };

  const handleNewRecommendationSuccess = () => {
    // Muestra modal de éxito
    setSuccessMessage("Recomendación creada con éxito.");
    fetchRecommendations(1);
  };

  const handleEditSuccess = () => {
    // Muestra modal de éxito
    setSuccessMessage("Recomendación editada y guardada con éxito.");
    fetchRecommendations(currentPage);
  };

  // --- Render Helpers ---

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

  const CurrentPageSummary = () => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE + 1;
    const endIndex = Math.min(currentPage * ROWS_PER_PAGE, totalCount);

    if (totalCount === 0)
      return (
        <p className="text-sm text-gray-700">No hay registros para mostrar.</p>
      );

    return (
      <p className="text-sm text-gray-700">
        Mostrando {startIndex} a {endIndex} de {totalCount} registros.
      </p>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8 text-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Oportunidades</h3>
        <button
          onClick={handleRefreshPrices}
          disabled={isLoading}
          className="ml-2 p-2 text-sm font-medium text-white bg-gray-600 rounded-full hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
          title="Actualizar precios"
        >
          <ArrowPathIcon
            className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Formulario de adición */}
      <NewRecommendationForm
        setError={setError}
        onSuccess={handleNewRecommendationSuccess}
      />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {/* Indicador de carga centralizado para la tabla */}
      {isLoading && recommendations.length === 0 ? (
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
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  P. Rec.
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  P. Actual
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  P. Objetivo
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  G/P (%)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Responsable
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Informe
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recommendations.map((rec) => {
                const isUpdating = pendingUpdateIds.includes(rec._id);
                const gainLossPercent = getGainLossPercent(rec);

                return (
                  <tr
                    key={rec._id}
                    className={
                      isUpdating
                        ? "opacity-50 transition-opacity"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Link
                        href={`/stock-screener/${rec.ticker.toLowerCase()}`}
                        className="font-semibold text-blue-600 hover:underline flex flex-col items-start"
                      >
                        <span className="text-base font-semibold">
                          {rec.ticker}
                        </span>
                        <span className="text-xs font-normal text-gray-500">
                          {rec.assetName}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(rec.recommendationDate).toLocaleDateString(
                        "es-ES"
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">
                      {formatCurrency(rec.purchasePrice || rec.buyPrice)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-right text-[#0A2342]">
                      {formatCurrency(rec.currentPrice)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-right text-blue-600">
                      {formatCurrency(rec.targetPrice)}
                    </td>
                    <td
                      className={`px-4 py-3 whitespace-nowrap text-sm font-semibold text-right ${
                        gainLossPercent >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {gainLossPercent.toFixed(2)}%
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
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                      {rec.reportUrl ? (
                        <a
                          href={rec.reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center justify-center"
                        >
                          Ver <DocumentTextIcon className="h-4 w-4 ml-1" />
                        </a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm flex space-x-2 justify-center items-center">
                      {/* BOTÓN DE EDICIÓN - Con cursor pointer */}
                      <button
                        onClick={() => setEditingRec(rec)}
                        disabled={isLoading}
                        className="text-blue-500 hover:text-blue-700 disabled:text-gray-300 transition-colors cursor-pointer"
                        title="Editar recomendación"
                      >
                        <PencilIcon className="h-5 w-5 mx-auto" />
                      </button>
                      {/* BOTÓN DE ELIMINACIÓN - Con cursor pointer */}
                      <button
                        onClick={() => handleDelete(rec._id)}
                        disabled={isUpdating || isLoading}
                        className="text-red-500 hover:text-red-700 disabled:text-gray-300 transition-colors cursor-pointer"
                        title="Eliminar recomendación"
                      >
                        <TrashIcon className="h-5 w-5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Controles de Paginación */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
        <CurrentPageSummary />
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isLoading}
            className="p-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <span className="py-2 px-4 text-sm font-semibold text-[#0A2342]">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || isLoading}
            className="p-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
          >
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* MODAL DE EDICIÓN */}
      {editingRec && (
        <EditRecommendationForm
          recommendation={editingRec}
          onClose={() => {
            setEditingRec(null);
            setError(null);
          }}
          onSuccess={handleEditSuccess}
          setError={setError}
          currentError={error}
        />
      )}

      {/* MODAL DE ÉXITO (Reemplazo de alert()) */}
      {successMessage && (
        <SuccessModal
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
          title="Operación Exitosa"
        />
      )}
    </div>
  );
}
