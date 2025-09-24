"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { searchStocksAction } from "../actions/searchActions";

// La interfaz para los resultados se alinea con lo que devuelve la Server Action
interface SearchSuggestion {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

export default function StockScreener() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isListVisible, setIsListVisible] = useState(false);

  // useTransition para manejar el estado de carga sin bloquear la UI
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Función que se ejecuta cuando el input cambia
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (!newQuery.trim() || newQuery.trim().length < 2) {
      setSuggestions([]);
      setError(null);
      setIsListVisible(false);
      return;
    }

    setIsListVisible(true);

    // startTransition envuelve la llamada a la Server Action
    startTransition(async () => {
      setError(null);
      const { results, error: actionError } = await searchStocksAction(
        newQuery
      );
      if (actionError) {
        setError(actionError);
        setSuggestions([]);
      } else {
        setSuggestions(results.filter((item) => item.type === "EQUITY"));
      }
    });
  };

  const viewReport = (ticker: string) => {
    setQuery("");
    setSuggestions([]);
    setIsListVisible(false);
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
            Busca acciones por ticker o nombre y accede a sus informes
            financieros.
          </p>
        </div>

        <div className="relative">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Buscar por ticker o nombre (ej: AAPL o Apple)"
                value={query}
                onChange={handleInputChange} // La acción se dispara aquí directamente
                onFocus={() => query.length > 1 && setIsListVisible(true)}
                onBlur={() => setTimeout(() => setIsListVisible(false), 200)}
              />
            </div>
          </div>

          {isListVisible && query.length >= 2 && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg">
              {isPending && (
                <div className="p-4 text-gray-500">Buscando...</div>
              )}
              {error && <div className="p-4 text-red-500">{error}</div>}
              {!isPending && suggestions.length > 0 && (
                <ul className="max-h-60 overflow-y-auto">
                  {suggestions.map((item) => (
                    <li
                      key={item.symbol}
                      className="px-4 py-3 hover:bg-indigo-50 cursor-pointer"
                      onMouseDown={() => viewReport(item.symbol)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-indigo-700">
                            {item.symbol}
                          </p>
                          <p className="text-sm text-gray-600">{item.name}</p>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                          {item.region}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {!isPending &&
                !error &&
                suggestions.length === 0 &&
                query.length > 1 && (
                  <div className="p-4 text-gray-500">
                    No se encontraron acciones.
                  </div>
                )}
            </div>
          )}
        </div>

        {!query && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Comienza tu búsqueda
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Escribe al menos 2 caracteres para ver sugerencias.</li>
              <li>
                Puedes buscar por el símbolo del ticker (ej: &quot;MSFT&quot;).
              </li>
              <li>
                También puedes buscar por el nombre de la empresa (ej:
                &quot;Microsoft&quot;).
              </li>
              <li>
                Selecciona un resultado para ver el informe financiero completo.
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
