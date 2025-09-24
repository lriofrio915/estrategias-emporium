"use client";

import { useState, useMemo, useEffect, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Portfolio, ApiAssetItem } from "@/types/api";
import {
  addTickerToPortfolio,
  removeTickerFromPortfolio,
  deletePortfolio,
  createCartera,
} from "@/app/actions/portfolioActions";
import {
  TrashIcon,
  PlusCircleIcon,
  ChevronDownIcon,
  FolderIcon,
  ArrowRightIcon,
  XMarkIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

// Interfaces para los datos de activos que se mostrarán en la UI
interface AssetData {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  price: number | null;
  dailyChange: number | null;
}

interface Props {
  portfolio: Portfolio;
}

// Tipo para valores que pueden ser number o tener propiedad raw
type ValueWithRaw = number | { raw: number };

/**
 * Función auxiliar para obtener el valor numérico de la API de forma segura
 */
const getRawValue = (value: ValueWithRaw | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "object" && "raw" in value) return value.raw;
  return null;
};

export default function PortfolioDetailPageClient({
  portfolio: initialPortfolio,
}: Props) {
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTickerInput, setNewTickerInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<"sector" | "industry" | "none">("none");
  const router = useRouter();

  // Estados para Modales
  const [isCarteraModalOpen, setIsCarteraModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newCarteraName, setNewCarteraName] = useState("");

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
        throw new Error("La respuesta de la red no fue exitosa.");
      const result = await response.json();
      if (!result.success)
        throw new Error(result.message || "Error al obtener datos de activos");

      const fetchedAssets = result.data.map(
        (item: ApiAssetItem): AssetData => ({
          ticker: item.ticker,
          name: item.data.price?.longName || item.ticker,
          sector: item.data.assetProfile?.sector || "N/A",
          industry: item.data.assetProfile?.industry || "N/A",
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
    fetchAssetData(initialPortfolio.tickers);
  }, [initialPortfolio.tickers, fetchAssetData]);

  const sortedAssets = useMemo(() => {
    const sortableAssets = [...assets];
    if (sortBy === "sector")
      return sortableAssets.sort((a, b) => a.sector.localeCompare(b.sector));
    if (sortBy === "industry")
      return sortableAssets.sort((a, b) =>
        a.industry.localeCompare(b.industry)
      );
    return sortableAssets;
  }, [assets, sortBy]);

  const handleAddTicker = async (e: FormEvent) => {
    e.preventDefault();
    const tickerToAdd = newTickerInput.trim().toUpperCase();
    if (!tickerToAdd || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await addTickerToPortfolio(initialPortfolio.slug, tickerToAdd);
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
      await removeTickerFromPortfolio(initialPortfolio.slug, tickerToDelete);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el ticker."
      );
    }
  };

  const handleDeletePortfolio = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await deletePortfolio(initialPortfolio.slug);
      router.push("/portafolio");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el portafolio."
      );
      setIsSubmitting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleCreateCartera = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCarteraName || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      // **CORRECCIÓN:** Se envía solo los datos que la Server Action espera.
      await createCartera({
        portfolioSlug: initialPortfolio.slug,
        name: newCarteraName,
      });
      setNewCarteraName("");
      setIsCarteraModalOpen(false);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al crear la cartera."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriceColor = (change: number | null) => {
    if (change === null) return "text-gray-500";
    return change > 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 text-gray-800 pt-2 font-inter">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
          <header className="text-center mb-12 mt-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A2342] mb-4">
              Portafolio: {initialPortfolio.name}
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Gestiona tu lista de seguimiento y organiza tus activos en
              carteras.
            </p>
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

          <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
            <h2 className="text-2xl font-bold text-center text-[#0A2342] mb-6">
              Gestionar Portafolio
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <form
                onSubmit={handleAddTicker}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <input
                  type="text"
                  value={newTickerInput}
                  onChange={(e) => setNewTickerInput(e.target.value)}
                  placeholder="Añadir Ticker a la lista"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 w-full sm:w-auto focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  className="bg-[#0A2342] text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 flex items-center justify-center disabled:bg-gray-400"
                  disabled={isSubmitting}
                >
                  <PlusCircleIcon className="h-5 w-5 mr-2" />
                  {isSubmitting ? "Añadiendo..." : "Añadir"}
                </button>
              </form>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center w-full sm:w-auto"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Eliminar Portafolio
              </button>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Activos en Seguimiento
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase">
                      Activo
                    </th>
                    <th
                      className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase cursor-pointer"
                      onClick={() =>
                        setSortBy(sortBy === "sector" ? "none" : "sector")
                      }
                    >
                      Sector <ChevronDownIcon className="h-4 w-4 inline" />
                    </th>
                    <th
                      className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase cursor-pointer"
                      onClick={() =>
                        setSortBy(sortBy === "industry" ? "none" : "industry")
                      }
                    >
                      Industria <ChevronDownIcon className="h-4 w-4 inline" />
                    </th>
                    <th className="py-3 px-6 text-right text-sm font-semibold text-gray-700 uppercase">
                      Precio
                    </th>
                    <th className="py-3 px-6 text-right text-sm font-semibold text-gray-700 uppercase">
                      Cambio %
                    </th>
                    <th className="py-3 px-6 text-center text-sm font-semibold text-gray-700 uppercase">
                      Informe
                    </th>
                    <th className="py-3 px-6 text-center text-sm font-semibold text-gray-700 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        Cargando activos...
                      </td>
                    </tr>
                  ) : sortedAssets.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        No hay activos en la lista.
                      </td>
                    </tr>
                  ) : (
                    sortedAssets.map((asset) => (
                      <tr key={asset.ticker} className="hover:bg-gray-50">
                        <td className="py-4 px-6 font-medium">
                          <p className="text-gray-900">{asset.name}</p>
                          <p className="text-gray-500 text-xs">
                            {asset.ticker}
                          </p>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-800">
                          {asset.sector}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-800">
                          {asset.industry}
                        </td>
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
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
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

          <section className="mt-16">
            <header className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-[#0A2342]">
                Carteras Específicas
              </h2>
              <p className="mt-2 text-lg text-gray-600">
                Organiza tus activos por estrategia.
              </p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <button
                onClick={() => setIsCarteraModalOpen(true)}
                className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 cursor-pointer group"
              >
                <PlusCircleIcon className="h-12 w-12 text-gray-400 group-hover:text-indigo-600" />
                <p className="mt-4 text-lg font-semibold text-gray-700 group-hover:text-indigo-800">
                  Crear Nueva Cartera
                </p>
              </button>
              {initialPortfolio.carteras?.map((cartera) => (
                <Link
                  key={cartera.slug}
                  href={`/portafolio/${initialPortfolio.slug}/${cartera.slug}`}
                  className="block bg-white rounded-lg shadow-lg p-6 flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div>
                    <div className="flex items-center mb-4">
                      <FolderIcon className="h-8 w-8 text-indigo-500 mr-3" />
                      <h2 className="text-xl font-bold text-gray-800 truncate">
                        {cartera.name}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-500">
                      {cartera.tickers.length} activo(s).
                    </p>
                  </div>
                  <div className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600">
                    Gestionar <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      {isCarteraModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button
              onClick={() => setIsCarteraModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-900"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">
              Crear Nueva Cartera
            </h2>
            <form onSubmit={handleCreateCartera}>
              <div className="mb-4">
                <label
                  htmlFor="carteraName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre de la Cartera
                </label>
                <input
                  type="text"
                  id="carteraName"
                  value={newCarteraName}
                  onChange={(e) => setNewCarteraName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 px-3 py-2"
                  placeholder="Ej: Bajo Riesgo, Tecnológicas..."
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsCarteraModalOpen(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 disabled:bg-indigo-300"
                >
                  {isSubmitting ? "Creando..." : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative text-center">
            <ExclamationCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              ¿Eliminar Portafolio?
            </h3>
            <p className="text-gray-600 mb-6">
              Esta acción es irreversible y eliminará el portafolio
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
                onClick={handleDeletePortfolio}
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
