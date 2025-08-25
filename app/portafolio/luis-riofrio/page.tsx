"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

// Definimos la interfaz para los datos de cada activo que el frontend necesita
interface AssetData {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  price: number | null;
  dailyChange: number | null;
  error?: string;
}

// Definimos la interfaz para la estructura de cada elemento de la API
// Basado en el output del `portfolio-api-handler`
interface ApiAssetItem {
  ticker: string;
  data: {
    price?: {
      longName?: string;
      symbol?: string;
      regularMarketPrice?: number;
      regularMarketChangePercent?: number;
    };
    assetProfile?: {
      sector?: string;
      industry?: string;
    };
    // Podemos añadir otros módulos si es necesario, pero solo los relevantes para la extracción aquí
  };
}

export default function LuisRiofrioPortfolioPage() {
  const [currentTickers] = useState<string[]>([
    "BAS.DE",
    "FTNT",
    "HQY",
    "LH",
    "MRVL",
    "OKTA",
    "PM",
  ]);

  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"none" | "sector" | "industry">("none");

  const fetchPortfolioData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      currentTickers.forEach((ticker) => queryParams.append("tickers", ticker));

      const response = await fetch(
        `/api/portfolio-luis-riofrio?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error("Fallo al obtener los datos del portafolio.");
      }
      const apiResponse = await response.json();

      if (apiResponse.success === false) {
        setError(
          apiResponse.message ||
            "Error desconocido al obtener datos del portafolio."
        );
        setLoading(false);
        return;
      }

      // Usamos la interfaz ApiAssetItem para el tipo de assetItem
      const transformedAssets: AssetData[] = apiResponse.data.map(
        (assetItem: ApiAssetItem) => {
          const priceData = assetItem.data?.price;
          const assetProfileData = assetItem.data?.assetProfile;

          const name =
            priceData?.longName || priceData?.symbol || assetItem.ticker;
          const sector = assetProfileData?.sector || "N/A";
          const industry = assetProfileData?.industry || "N/A";
          const price = priceData?.regularMarketPrice ?? null;
          const dailyChange = priceData?.regularMarketChangePercent ?? null;

          return {
            ticker: assetItem.ticker,
            name: name,
            sector: sector,
            industry: industry,
            price: price,
            dailyChange: dailyChange,
          };
        }
      );

      setAssets(transformedAssets);
    } catch (err: unknown) {
      // Cambiado 'any' a 'unknown'
      console.error("Error al obtener datos del portafolio:", err);
      // Verificamos si el error es una instancia de Error para acceder a 'message'
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los datos del portafolio. Por favor, inténtalo de nuevo más tarde."
      );
    } finally {
      setLoading(false);
    }
  }, [currentTickers]);

  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  const sortedAssets = useMemo(() => {
    const sortableAssets = [...assets];
    if (sortBy === "sector") {
      return sortableAssets.sort((a, b) => {
        if (!a.sector || a.sector === "N/A") return 1;
        if (!b.sector || b.sector === "N/A") return -1;
        return a.sector.localeCompare(b.sector);
      });
    } else if (sortBy === "industry") {
      return sortableAssets.sort((a, b) => {
        if (!a.industry || a.industry === "N/A") return 1;
        if (!b.industry || b.industry === "N/A") return -1;
        return a.industry.localeCompare(b.industry);
      });
    }
    return assets;
  }, [assets, sortBy]);

  const toggleSortBySector = () => {
    setSortBy(sortBy === "sector" ? "none" : "sector");
  };

  const toggleSortByIndustry = () => {
    setSortBy(sortBy === "industry" ? "none" : "industry");
  };

  const getPriceColor = (change: number | null) => {
    if (change === null) return "text-gray-500";
    return change * 100 > 0
      ? "text-green-600"
      : change * 100 < 0
      ? "text-red-600"
      : "text-gray-500";
  };

  // --- NUEVA FUNCIÓN PARA OBTENER LA RUTA DEL INFORME ---
  const getReportPath = (ticker: string) => {
    if (ticker === "BAS.DE") {
      return "/portafolio/luis-riofrio/basf";
    }
    return `/portafolio/luis-riofrio/${ticker.toLowerCase()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pt-2 font-inter">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <header className="text-center mb-12 mt-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A2342] mb-4">
            Portafolio de Luis Riofrío
          </h1>
          <p className="text-lg md:text-xl text-[#849E8F]">
            Un resumen de los activos que componen el portafolio, con
            información de precios y cambios diarios, incluyendo sector e
            industria.
          </p>
        </header>

        <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-6">
            Activos en Cartera
          </h2>
          {loading ? (
            <div className="text-center py-10 text-gray-500">
              <svg
                className="animate-spin h-8 w-8 text-blue-500 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
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
              <p className="mt-4">Cargando datos...</p>
            </div>
          ) : error ? (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          ) : sortedAssets.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No se encontraron activos para mostrar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th
                      scope="col"
                      className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      Item
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      Activo
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      Ticker
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-[#0A2342] transition-colors duration-200"
                      onClick={toggleSortBySector}
                    >
                      <div className="flex items-center">
                        Sector
                        {sortBy === "sector" ? (
                          <ChevronUpIcon className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDownIcon className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-[#0A2342] transition-colors duration-200"
                      onClick={toggleSortByIndustry}
                    >
                      <div className="flex items-center">
                        Industria
                        {sortBy === "industry" ? (
                          <ChevronUpIcon className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDownIcon className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      Precio Actual
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      Cambio % Diario
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      Informe
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAssets.map((asset, index) => (
                    <tr
                      key={asset.ticker}
                      className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="py-4 px-6 text-sm text-gray-800 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-800">
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
                        {asset.price !== null
                          ? `$${asset.price.toFixed(2)}`
                          : "N/A"}
                      </td>
                      <td
                        className={`py-4 px-6 text-sm font-semibold ${getPriceColor(
                          asset.dailyChange
                        )}`}
                      >
                        {asset.dailyChange !== null
                          ? `${(asset.dailyChange * 100).toFixed(2)}%`
                          : "N/A"}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <a
                          // --- AQUÍ SE UTILIZA LA NUEVA FUNCIÓN getReportPath ---
                          href={getReportPath(asset.ticker)}
                          className="text-blue-600 hover:text-blue-800 font-medium underline transition-colors duration-200"
                        >
                          Ver más
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="text-center mt-12 pt-8 border-t border-gray-200">
          <h3 className="font-bold mb-2 text-[#0A2342]">Aviso Legal</h3>
          <p className="text-xs text-[#849E8F] max-w-4xl mx-auto">
            El contenido de este portafolio tiene fines puramente educativos e
            informativos y no constituye en ningún caso asesoramiento de
            inversión. La operativa con activos financieros implica un alto
            grado de riesgo y puede no ser adecuada para todos los inversores.
            Existe la posibilidad de que se incurra en pérdidas que superen la
            inversión inicial. Los resultados pasados no son indicativos de
            resultados futuros.
          </p>
        </footer>
      </div>
    </div>
  );
}
