"use client";

import { useState, useEffect } from "react";
import StockScreenerSearch from "@/components/StockScreenerSearch/StockScreenerSearch";
import TopMovers from "@/components/TopMovers/TopMovers";
import Recommendations from "@/components/Recommendations/Recommendations";
import {
  getDayMovers,
  getYtdMovers,
  getRecommendations,
} from "@/app/actions/marketActions";
import { MoverQuote } from "@/types/api";
import { Recommendation } from "@/types/market";

// Definimos el tipo para los datos de los movers
type MoversData = {
  gainers: MoverQuote[];
  losers: MoverQuote[];
  error: string | null;
};

export default function StockScreenerPage() {
  const [view, setView] = useState<"1D" | "YTD">("1D");
  const [dayMovers, setDayMovers] = useState<MoversData>({
    gainers: [],
    losers: [],
    error: null,
  });
  const [ytdMovers, setYtdMovers] = useState<MoversData>({
    gainers: [],
    losers: [],
    error: null,
  });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Obtenemos todos los datos en paralelo
      const [dayMoversData, ytdMoversData, recommendationsData] =
        await Promise.all([
          getDayMovers(),
          getYtdMovers(),
          getRecommendations(),
        ]);

      setDayMovers(dayMoversData);
      setYtdMovers(ytdMoversData);
      setRecommendations(recommendationsData);
      setLoading(false);
    }
    loadData();
  }, []);

  const moversError = view === "1D" ? dayMovers.error : ytdMovers.error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Stock Screener
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Busca acciones y analiza las tendencias del mercado y
            recomendaciones.
          </p>
        </div>

        <StockScreenerSearch />

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

        {loading ? (
          <div className="text-center text-gray-500">
            Cargando datos del mercado...
          </div>
        ) : (
          <>
            {moversError && (
              <div
                className="my-8 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md"
                role="alert"
              >
                <p className="font-bold">Aviso de Mercado</p>
                <p>{moversError}</p>
              </div>
            )}
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TopMovers
                title={
                  view === "1D" ? "Top Ganadores del Día" : "Top Ganadores YTD"
                }
                movers={view === "1D" ? dayMovers.gainers : ytdMovers.gainers}
                type="gainers"
              />
              <TopMovers
                title={
                  view === "1D"
                    ? "Grandes Ofertas del Día"
                    : "Grandes Ofertas YTD"
                }
                movers={view === "1D" ? dayMovers.losers : ytdMovers.losers}
                type="losers"
              />
            </div>
          </>
        )}

        <Recommendations initialRecommendations={recommendations} />
      </div>
    </div>
  );
}
