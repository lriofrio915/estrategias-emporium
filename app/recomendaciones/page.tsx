// app/recomendaciones/page.tsx
"use client";

import {
  useState,
  useEffect,
  useCallback,
} from "react";
import TopMovers from "@/components/TopMovers/TopMovers";
import Recommendations from "@/components/Recommendations/Recommendations";
import {
  getDayMovers,
  getYtdMovers,
  getRecommendations,
} from "@/app/actions/marketActions";
import { MoverQuote } from "@/types/api";
import { Recommendation } from "@/types/market";
// Eliminado: import LoadingSpinner from "@/components/Shared/LoadingSpinner"; // Ya no se usa
import StockScreenerSearch from "@/components/StockScreenerSearch/StockScreenerSearch";

// Definimos el tipo para los datos de los movers
type MoversData = {
  gainers: MoverQuote[];
  losers: MoverQuote[];
  error: string | null;
};

// --- Componente de Carga de Datos de Mercado (Cliente) ---
function MarketDataFetcher({ view }: { view: "1D" | "YTD" }) {
  const [movers, setMovers] = useState<MoversData>({
    gainers: [],
    losers: [],
    error: null,
  });
  const [isLoadingMovers, setIsLoadingMovers] = useState(true);

  const fetchMovers = useCallback(async () => {
    setIsLoadingMovers(true);
    try {
      // Los datos son objetos de respuesta de Server Actions; se usa 'e' en el catch del Server Action
      // Aquí 'e' es capturado en la promesa, no en el scope local.
      const data = view === "1D" ? await getDayMovers() : await getYtdMovers();
      setMovers(data);
    } catch {
      setMovers({
        gainers: [],
        losers: [],
        error: "Error al cargar los movers.",
      });
    } finally {
      setIsLoadingMovers(false);
    }
  }, [view]);

  useEffect(() => {
    fetchMovers();
  }, [fetchMovers]);

  if (isLoadingMovers) {
    return (
      <div className="text-center text-gray-500">
        <div className="inline-flex items-center px-6 py-3 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-blue-600 font-medium">Cargando movers...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {movers.error && (
        <div
          className="my-8 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md"
          role="alert"
        >
          <p className="font-bold">Aviso de Mercado</p>
          <p>{movers.error}</p>
        </div>
      )}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TopMovers
          title={view === "1D" ? "Top Ganadores del Día" : "Top Ganadores YTD"}
          movers={movers.gainers}
          type="gainers"
        />
        <TopMovers
          title={
            view === "1D" ? "Grandes Ofertas del Día" : "Grandes Ofertas YTD"
          }
          movers={movers.losers}
          type="losers"
        />
      </div>
    </>
  );
}

// Componente principal de la página (Client Component)
export default function RecommendationsPageWrapper() {
  const [view, setView] = useState<"1D" | "YTD">("1D");
  const [recommendationsData, setRecommendationsData] = useState<{
    recommendations: Recommendation[];
    totalPages: number;
    totalCount: number;
    loading: boolean;
  }>({
    recommendations: [],
    totalPages: 0,
    totalCount: 0,
    loading: true,
  });

  // ELIMINADO: [isRecommendationsUpdating, startRecommendationsTransition] - No se usan

  // Función unificada para obtener la primera página de recomendaciones (inicial)
  const fetchInitialRecommendations = useCallback(async () => {
    setRecommendationsData((prev) => ({ ...prev, loading: true }));
    try {
      const result = await getRecommendations(1);
      setRecommendationsData({
        recommendations: result.recommendations,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        loading: false,
      });
    } catch (e) {
      console.error("Fallo al cargar recomendaciones iniciales:", e);
      setRecommendationsData((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // Efecto para la carga inicial de las recomendaciones (solo la primera vez)
  useEffect(() => {
    fetchInitialRecommendations();
  }, [fetchInitialRecommendations]);

  // Si la carga inicial está en curso, mostramos un spinner general
  if (recommendationsData.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 flex justify-center items-center">
        <div className="inline-flex items-center px-6 py-3 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-blue-600 font-medium">
            Cargando datos iniciales...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Recomendaciones
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Busca acciones y analiza las tendencias del mercado.
          </p>
          {/* Componente Recommendations ahora recibe los datos y la paginación */}
          <Recommendations
            initialRecommendations={recommendationsData.recommendations}
            initialTotalPages={recommendationsData.totalPages}
            initialTotalCount={recommendationsData.totalCount}
          />
        </div>

        {/* Botones para cambiar la vista */}
        <div className="my-8 flex justify-center items-center gap-4">
          <button
            onClick={() => setView("1D")}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
              view === "1D"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-200"
            }`}
          >
            1 Día
          </button>
          <button
            onClick={() => setView("YTD")}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
              view === "YTD"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-200"
            }`}
          >
            YTD
          </button>
        </div>

        <MarketDataFetcher view={view} />

        <StockScreenerSearch />
      </div>
    </div>
  );
}
