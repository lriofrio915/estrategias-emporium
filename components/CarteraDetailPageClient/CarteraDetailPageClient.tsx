"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  TrashIcon,
  PlusCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Portfolio, Cartera, ApiAssetItem } from "@/types/api";
import {
  addTickerToCartera,
  removeTickerFromCartera,
  deleteCartera, // Importamos la nueva acción
} from "@/app/actions/portfolioActions";

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
  cartera: Cartera;
}

export default function CarteraDetailPageClient({
  portfolio: parentPortfolio,
  cartera: initialCartera,
}: Props) {
  const [cartera, setCartera] = useState<Cartera>(initialCartera);
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTickerInput, setNewTickerInput] = useState("");
  const [sortBy, setSortBy] = useState<"sector" | "industry" | "none">("none");
  const router = useRouter();

  // (El código de fetchAssetData, useEffect, sortedAssets, etc. no cambia)
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
      const result = await response.json();
      if (!result.success)
        throw new Error(result.message || "Error fetching asset data");
      const fetchedAssets = result.data.map((item: ApiAssetItem) => ({
        ticker: item.ticker,
        name: item.data.price?.longName || item.ticker,
        sector: item.data.assetProfile?.sector || "N/A",
        industry: item.data.assetProfile?.industry || "N/A",
        price: item.data.price?.regularMarketPrice ?? null,
        dailyChange: item.data.price?.regularMarketChangePercent ?? null,
      }));
      setAssets(fetchedAssets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssetData(cartera.tickers);
  }, [cartera.tickers, fetchAssetData]);
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
  const getPriceColor = (change: number | null) => {
    if (change === null) return "text-gray-500";
    return change * 100 > 0 ? "text-green-600" : "text-red-600";
  };
  // (Fin del código sin cambios)

  const handleAddTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    const tickerToAdd = newTickerInput.trim().toUpperCase();
    if (!tickerToAdd) return;
    try {
      const updatedCartera = await addTickerToCartera(
        parentPortfolio.slug,
        cartera.slug,
        tickerToAdd
      );
      setCartera(updatedCartera);
      setNewTickerInput("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo añadir el ticker."
      );
    }
  };

  const handleDeleteTicker = async (tickerToDelete: string) => {
    try {
      const updatedCartera = await removeTickerFromCartera(
        parentPortfolio.slug,
        cartera.slug,
        tickerToDelete
      );
      setCartera(updatedCartera);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el ticker."
      );
    }
  };

  // SOLUCIÓN: Lógica para eliminar la cartera y refrescar
  const handleDeleteCartera = async () => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar la cartera "${cartera.name}"?`
      )
    ) {
      try {
        await deleteCartera(parentPortfolio.slug, cartera.slug);
        router.push(`/portafolio/${parentPortfolio.slug}`); // Redirige a la página anterior
        router.refresh(); // Refresca los datos del servidor para ver la lista actualizada
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo eliminar la cartera."
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pt-2 font-inter">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <header className="text-center mb-12 mt-8">
          <Link
            href={`/portafolio/${parentPortfolio.slug}`}
            className="text-indigo-600 hover:text-indigo-800 inline-flex items-center mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Volver al Portafolio de {parentPortfolio.name}
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A2342] mb-4">
            Cartera: {cartera.name}
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Activos asignados a esta cartera específica.
          </p>
        </header>

        <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-bold text-center text-[#0A2342] mb-6">
            Gestionar Activos de la Cartera
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <form
              onSubmit={handleAddTicker}
              className="flex flex-grow sm:flex-grow-0 gap-4"
            >
              <input
                type="text"
                value={newTickerInput}
                onChange={(e) => setNewTickerInput(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 w-full sm:w-auto"
                placeholder="Añadir Ticker (ej: GOOGL)"
              />
              <button
                type="submit"
                className="bg-[#0A2342] text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 flex items-center justify-center"
              >
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Añadir
              </button>
            </form>
            {/* SOLUCIÓN: Botón para eliminar la cartera */}
            <button
              onClick={handleDeleteCartera}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center w-full sm:w-auto"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Eliminar Cartera
            </button>
          </div>
        </section>

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-md"
            role="alert"
          >
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <section className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase">
                    ITEM
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase">
                    ACTIVO
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase">
                    TICKER
                  </th>
                  <th
                    className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase cursor-pointer"
                    onClick={() =>
                      setSortBy(sortBy === "sector" ? "none" : "sector")
                    }
                  >
                    SECTOR{" "}
                    {sortBy === "sector" ? (
                      <ChevronUpIcon className="h-4 w-4 inline" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 inline" />
                    )}
                  </th>
                  <th
                    className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase cursor-pointer"
                    onClick={() =>
                      setSortBy(sortBy === "industry" ? "none" : "industry")
                    }
                  >
                    INDUSTRIA{" "}
                    {sortBy === "industry" ? (
                      <ChevronUpIcon className="h-4 w-4 inline" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 inline" />
                    )}
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase">
                    PRECIO ACTUAL
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase">
                    CAMBIO % DIARIO
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase">
                    INFORME
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase">
                    ACCIONES
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">
                      Cargando activos...
                    </td>
                  </tr>
                ) : sortedAssets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">
                      Esta cartera aún no tiene activos.
                    </td>
                  </tr>
                ) : (
                  sortedAssets.map((asset, index) => (
                    <tr key={asset.ticker} className="hover:bg-gray-50">
                      <td className="py-4 px-6 text-sm text-gray-800">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">
                        {asset.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-800">
                        {asset.ticker}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-800">
                        {asset.sector}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-800">
                        {asset.industry}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-800">
                        {asset.price ? `$${asset.price.toFixed(2)}` : "N/A"}
                      </td>
                      <td
                        className={`py-4 px-6 text-sm font-semibold ${getPriceColor(
                          asset.dailyChange
                        )}`}
                      >
                        {asset.dailyChange
                          ? `${(asset.dailyChange * 100).toFixed(2)}%`
                          : "N/A"}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <Link
                          href={`/stock-screener/${asset.ticker.toLowerCase()}`}
                          className="text-blue-600 hover:underline"
                        >
                          Ver más
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <button
                          onClick={() => handleDeleteTicker(asset.ticker)}
                          className="text-red-500 hover:text-red-700"
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
  );
}
