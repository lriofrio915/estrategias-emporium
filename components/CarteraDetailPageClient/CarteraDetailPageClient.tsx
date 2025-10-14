"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Portfolio, Cartera, ApiAssetItem } from "@/types/api";
import {
  addTickerToCartera,
  removeTickerFromCartera,
  deleteCartera,
} from "@/app/actions/portfolioActions";
import {
  TrashIcon,
  PlusCircleIcon,
  ExclamationCircleIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";

// Interfaces para los tipos de datos (Actualizadas)
interface AssetData {
  ticker: string;
  name: string;
  sector: string | null; // Nuevo campo para Sector
  industry: string | null; // Nuevo campo para Industria
  country: string | null; // Nuevo campo para País
  price: number | null;
  dailyChange: number | null;
}

interface Props {
  portfolio: Portfolio;
  cartera: Cartera;
}
// Tipo para valores que pueden ser number o tener propiedad raw
type ValueWithRaw = number | { raw: number };

/**
 * Función auxiliar para extraer el valor numérico de un campo
 * que puede ser directamente un número o un objeto con propiedad raw
 */
const getRawValue = (value: ValueWithRaw | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "object" && "raw" in value) return value.raw;
  return null;
};

export default function CarteraDetailPageClient({ portfolio, cartera }: Props) {
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTickerInput, setNewTickerInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  const fetchAssetData = useCallback(async (tickers: string[]) => {
    if (tickers.length === 0) {
      setAssets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/stocks?tickers=${tickers.join(",")}`);
      if (!response.ok)
        throw new Error("Fallo en la comunicación con la API de activos.");
      const result = await response.json();
      if (!result.success)
        throw new Error(result.message || "Error al obtener datos de activos");

      const fetchedAssets = result.data.map(
        (item: ApiAssetItem): AssetData => ({
          ticker: item.ticker,
          name: item.data.price?.longName || item.ticker,
          // --- NUEVOS CAMPOS EXTRAÍDOS ---
          sector: item.data.assetProfile?.sector || null,
          industry: item.data.assetProfile?.industry || null,
          country: item.data.assetProfile?.country || null,
          // --------------------------------
          price: getRawValue(item.data.price?.regularMarketPrice),
          dailyChange: getRawValue(item.data.price?.regularMarketChangePercent),
        })
      );
      setAssets(fetchedAssets);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Falló al cargar los activos."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssetData(cartera.tickers);
  }, [cartera.tickers, fetchAssetData]);

  const handleAddTicker = async (e: FormEvent) => {
    e.preventDefault();
    const tickerToAdd = newTickerInput.trim().toUpperCase();
    if (!tickerToAdd || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      // Nota: addTickerToCartera refresca la ruta, lo cual dispara fetchAssetData de nuevo
      await addTickerToCartera(portfolio.slug, cartera.slug, tickerToAdd);
      setNewTickerInput("");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo añadir el ticker."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTicker = async (tickerToDelete: string) => {
    setError(null);
    try {
      await removeTickerFromCartera(
        portfolio.slug,
        cartera.slug,
        tickerToDelete
      );
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el ticker."
      );
    }
  };

  const handleDeleteCartera = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await deleteCartera(portfolio.slug, cartera.slug);
      router.push(`/portafolio/${portfolio.slug}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar la cartera."
      );
      setIsSubmitting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const getPriceColor = (change: number | null) => {
    if (change === null) return "text-gray-500";
    // Compara directamente el cambio porcentual como decimal, no multiplicado por 100
    return change > 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 text-gray-800 pt-2 font-inter">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
          <header className="mb-12 mt-8">
            <Link
              href={`/portafolio/${portfolio.slug}`}
              className="text-blue-600 hover:underline flex items-center mb-4 w-fit"
            >
              <ArrowUturnLeftIcon className="h-5 w-5 mr-2" />
              Volver a {portfolio.name}
            </Link>
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A2342] mb-4">
                Cartera: {cartera.name}
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                Lista de seguimiento para tu estrategia &quot;{cartera.name}
                &quot;.
              </p>
            </div>
          </header>

          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-md"
              role="alert"
            >
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          <section className="bg-white rounded-lg shadow-xl p-6 md:p-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <form
                onSubmit={handleAddTicker}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <input
                  type="text"
                  value={newTickerInput}
                  onChange={(e) => setNewTickerInput(e.target.value)}
                  placeholder="Añadir Ticker a la cartera"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 w-full sm:w-auto focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  className="bg-[#0A2342] text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 flex items-center justify-center disabled:bg-gray-400 transition-colors"
                  disabled={isSubmitting}
                >
                  <PlusCircleIcon className="h-5 w-5 mr-2" />
                  {isSubmitting ? "..." : "Añadir"}
                </button>
              </form>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center w-full sm:w-auto transition-colors"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Eliminar Cartera
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full bg-white divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    {/* NUEVA COLUMNA DE NUMERACIÓN */}
                    <th className="py-3 px-3 text-center text-xs font-semibold text-gray-700 uppercase">
                      N°
                    </th>
                    <th className="py-3 px-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Activo
                    </th>
                    {/* NUEVAS COLUMNAS DE DETALLE */}
                    <th className="py-3 px-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Sector
                    </th>
                    <th className="py-3 px-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Industria
                    </th>
                    <th className="py-3 px-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      País
                    </th>
                    {/* COLUMNAS EXISTENTES */}
                    <th className="py-3 px-6 text-right text-xs font-semibold text-gray-700 uppercase">
                      Precio
                    </th>
                    <th className="py-3 px-6 text-right text-xs font-semibold text-gray-700 uppercase">
                      Cambio %
                    </th>
                    <th className="py-3 px-6 text-center text-xs font-semibold text-gray-700 uppercase">
                      Informe
                    </th>
                    <th className="py-3 px-6 text-center text-xs font-semibold text-gray-700 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={9} // Colspan ajustado a 9 (4 viejas + 5 nuevas)
                        className="text-center py-8 text-gray-500"
                      >
                        Cargando activos...
                      </td>
                    </tr>
                  ) : assets.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9} // Colspan ajustado a 9
                        className="text-center py-8 text-gray-500"
                      >
                        Esta cartera aún no tiene activos.
                      </td>
                    </tr>
                  ) : (
                    assets.map((asset, index) => (
                      <tr key={asset.ticker} className="hover:bg-gray-50">
                        {/* CELDA DE NUMERACIÓN */}
                        <td className="py-4 px-3 text-sm text-center text-gray-600">
                          {index + 1}
                        </td>
                        {/* CELDA DE ACTIVO */}
                        <td className="py-4 px-3 font-medium">
                          <p className="text-gray-900">{asset.name}</p>
                          <p className="text-gray-500 text-xs">
                            {asset.ticker}
                          </p>
                        </td>
                        {/* CELDAS DE SECTOR, INDUSTRIA, PAÍS */}
                        <td className="py-4 px-3 text-sm text-left text-gray-800">
                          {asset.sector || "N/A"}
                        </td>
                        <td className="py-4 px-3 text-sm text-left text-gray-800">
                          {asset.industry || "N/A"}
                        </td>
                        <td className="py-4 px-3 text-sm text-left text-gray-800">
                          {asset.country || "N/A"}
                        </td>
                        {/* CELDAS EXISTENTES */}
                        <td className="py-4 px-6 text-sm text-right text-gray-800">
                          {asset.price ? `$${asset.price.toFixed(2)}` : "N/A"}
                        </td>
                        <td
                          className={`py-4 px-6 text-sm text-right font-semibold ${getPriceColor(
                            asset.dailyChange
                          )}`}
                        >
                          {asset.dailyChange !== null
                            ? `${(asset.dailyChange * 100).toFixed(2)}%`
                            : "N/A"}
                        </td>
                        <td className="py-4 px-6 text-sm text-center">
                          <Link
                            href={`/stock-screener/${asset.ticker.toLowerCase()}`}
                            className="text-blue-600 hover:underline"
                          >
                            Ver más
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-sm text-center">
                          <button
                            onClick={() => handleDeleteTicker(asset.ticker)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative text-center">
            <ExclamationCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              ¿Eliminar Cartera?
            </h3>
            <p className="text-gray-600 mb-6">
              Esta acción eliminará la cartera &quot;{cartera.name}&quot;
              permanentemente.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md font-semibold hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteCartera}
                className="px-6 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
