"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, ChartBarIcon } from "@heroicons/react/24/outline";

// Interfaz para los resultados de búsqueda que se mostrarán en la UI
interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

// --- Nueva Interfaz para la respuesta de tu API de stocks ---
// Esta interfaz describe la estructura de cada elemento dentro de `data.data` de tu API.
interface StockApiResponseItem {
  ticker: string;
  data: {
    price?: {
      // 'price' es opcional
      longName?: string; // 'longName' es opcional dentro de 'price'
      currency?: string; // 'currency' es opcional dentro de 'price'
    };
    assetProfile?: {
      // 'assetProfile' es opcional
      longName?: string; // 'longName' es opcional dentro de 'assetProfile'
    };
    // Puedes añadir más propiedades aquí si tu API devuelve más datos relevantes
  };
}

// Interfaz para la respuesta completa de tu API de stocks
interface StockApiData {
  success: boolean;
  data: StockApiResponseItem[];
  // Si tu API devuelve más propiedades a nivel superior, agrégalas aquí.
}
// --- Fin de las nuevas interfaces ---

export default function StockScreener() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Función para buscar acciones usando tu API existente de stocks
  const searchStocks = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Usamos tu API existente de stocks para buscar
      const response = await fetch(
        `/api/stocks?tickers=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error("Error en la búsqueda");
      }

      // Casteamos la respuesta JSON a la interfaz StockApiData
      const data: StockApiData = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        // Convertimos los datos de tu API al formato que espera el buscador
        const formattedResults = data.data.map(
          (item: StockApiResponseItem) => ({
            // <--- ¡Aquí está el cambio!
            symbol: item.ticker,
            name:
              item.data.price?.longName ||
              item.data.assetProfile?.longName ||
              item.ticker,
            type: "Equity",
            region: "US",
            currency: item.data.price?.currency || "USD",
          })
        );

        setResults(formattedResults);
      } else {
        setResults([]);
        setError("No se encontraron resultados");
      }
    } catch (err) {
      console.error("Error buscando acciones:", err);
      setError("Error al realizar la búsqueda. Intenta nuevamente.");
      setResults([]);

      // Fallback: resultados de ejemplo si la API falla (para desarrollo)
      if (process.env.NODE_ENV === "development") {
        setResults([
          {
            symbol: "AAPL",
            name: "Apple Inc.",
            type: "Equity",
            region: "US",
            currency: "USD",
          },
          {
            symbol: "MSFT",
            name: "Microsoft Corporation",
            type: "Equity",
            region: "US",
            currency: "USD",
          },
          {
            symbol: "GOOGL",
            name: "Alphabet Inc.",
            type: "Equity",
            region: "US",
            currency: "USD",
          },
          {
            symbol: "AMZN",
            name: "Amazon.com Inc.",
            type: "Equity",
            region: "US",
            currency: "USD",
          },
          {
            symbol: "TSLA",
            name: "Tesla, Inc.",
            type: "Equity",
            region: "US",
            currency: "USD",
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto para buscar con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        searchStocks(query);
      } else {
        setResults([]);
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timer);
  }, [query, searchStocks]);

  // Función para ver el informe de un ticker (ruta interna dentro de stock-screener)
  const viewReport = (ticker: string) => {
    // Navegar a la página de informe dentro del mismo stock-screener
    router.push(`/stock-screener/${ticker.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Stock Screener
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Busca acciones por ticker o nombre de empresa y accede directamente
            a sus informes financieros detallados.
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Buscar por ticker o nombre de empresa (ej: AAPL o Apple Inc.)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Mensajes de estado */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Buscando acciones...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 rounded-lg shadow-md p-6 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Resultados de búsqueda */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Resultados de búsqueda
              </h2>
            </div>
            <ul className="divide-y divide-gray-200">
              {results.map((result) => (
                <li key={result.symbol} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {result.symbol}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {result.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {result.region} · {result.type} · {result.currency}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        onClick={() => viewReport(result.symbol)}
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <ChartBarIcon className="-ml-1 mr-2 h-5 w-5" />
                        Ver Informe
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Información adicional cuando no hay búsqueda */}
        {!query && !loading && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cómo usar el Stock Screener
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>
                Escribe el ticker o nombre de una empresa en la barra de
                búsqueda
              </li>
              <li>
                Los resultados se mostrarán automáticamente mientras escribes
              </li>
              <li>
                Haz clic en &quot;Ver Informe&quot; para acceder al análisis
                completo
              </li>
              <li>
                Los informes incluyen datos financieros, gráficos y métricas
                clave
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
