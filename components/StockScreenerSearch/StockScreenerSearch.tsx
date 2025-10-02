"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { searchStocksAction } from "@/app/actions/searchActions"; // 1. Importamos la Server Action real

// Interfaz para los resultados que se mostrarán en la UI.
interface SearchSuggestion {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

export default function StockScreenerSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isListVisible, setIsListVisible] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

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

    // 2. Usamos startTransition para llamar a la Server Action sin bloquear la UI.
    startTransition(async () => {
      setError(null);
      const { results, error: actionError } = await searchStocksAction(
        newQuery
      );

      if (actionError) {
        setError(actionError);
        setSuggestions([]);
      } else {
        // Filtramos para mostrar solo acciones (EQUITY) como querías.
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
    <div className="relative mt-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-md"
            placeholder="Buscar por ticker o nombre (ej: AAPL o Apple)"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.length > 1 && setIsListVisible(true)}
            onBlur={() => setTimeout(() => setIsListVisible(false), 200)} // Pequeño delay para permitir el clic en la lista
          />
        </div>
      </div>

      {isListVisible && query.length >= 2 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg">
          {isPending && <div className="p-4 text-gray-500">Buscando...</div>}
          {error && <div className="p-4 text-red-500">{error}</div>}
          {!isPending && suggestions.length > 0 && (
            <ul className="max-h-60 overflow-y-auto">
              {suggestions.map((item) => (
                <li
                  key={item.symbol}
                  className="px-4 py-3 hover:bg-indigo-50 cursor-pointer"
                  onMouseDown={() => viewReport(item.symbol)} // Usamos onMouseDown para que se dispare antes del onBlur del input
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-indigo-700">{item.symbol}</p>
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
  );
}
