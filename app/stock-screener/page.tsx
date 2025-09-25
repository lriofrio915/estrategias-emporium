import StockScreenerSearch from "@/components/StockScreenerSearch/StockScreenerSearch";
import TopMovers from "@/components/TopMovers/TopMovers";
import Recommendations from "@/components/Recommendations/Recommendations";
import { getDayMovers, getRecommendations } from "@/app/actions/marketActions";

export default async function StockScreenerPage() {
  // Obtenemos los datos en el servidor al cargar la página
  const { gainers, losers, error: moversError } = await getDayMovers();
  const recommendations = await getRecommendations();

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
            title="Top Ganadores del Día"
            movers={gainers}
            type="gainers"
          />
          <TopMovers
            title="Grandes Ofertas del Día"
            movers={losers}
            type="losers"
          />
        </div>

        <Recommendations initialRecommendations={recommendations} />
      </div>
    </div>
  );
}
