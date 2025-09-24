import StockScreenerSearch from "@/components/StockScreenerSearch/StockScreenerSearch";
import TopMovers from "@/components/TopMovers/TopMovers";
import Recommendations from "@/components/Recommendations/Recommendations";

// Datos de ejemplo para los movers (en un futuro, esto vendrá de una Server Action)
const DUMMY_GAINERS_DAILY = [
  { symbol: "GNR", name: "Gainers Inc.", price: 150.25, changePercent: 15.2 },
  { symbol: "UPWD", name: "Upward Corp", price: 88.4, changePercent: 12.1 },
  { symbol: "SKY", name: "SkyHigh Stocks", price: 210.0, changePercent: 10.5 },
];
const DUMMY_LOSERS_DAILY = [
  { symbol: "FALL", name: "Falling Co.", price: 45.5, changePercent: -18.3 },
  { symbol: "DROP", name: "Dropdown Inc.", price: 72.1, changePercent: -14.2 },
  {
    symbol: "LOW",
    name: "Lowland Industries",
    price: 95.8,
    changePercent: -9.8,
  },
];
const DUMMY_GAINERS_YTD = [
  { symbol: "ROCKET", name: "Rocket Corp", price: 350.0, changePercent: 120.5 },
  {
    symbol: "BOOM",
    name: "Boom Industries",
    price: 190.75,
    changePercent: 98.2,
  },
];
const DUMMY_LOSERS_YTD = [
  { symbol: "SINK", name: "Sinker Ltd.", price: 12.3, changePercent: -75.4 },
  { symbol: "CRASH", name: "Crash & Co.", price: 25.6, changePercent: -60.1 },
];

export default function StockScreenerPage() {
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

        {/* Tu barra de búsqueda original ahora vive en su propio componente */}
        <StockScreenerSearch />

        {/* Nuevas Secciones */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TopMovers
            title="Top Ganadores"
            type="gainers"
            dailyMovers={DUMMY_GAINERS_DAILY}
            ytdMovers={DUMMY_GAINERS_YTD}
          />
          <TopMovers
            title="Grandes Ofertas"
            type="losers"
            dailyMovers={DUMMY_LOSERS_DAILY}
            ytdMovers={DUMMY_LOSERS_YTD}
          />
        </div>

        <Recommendations />
      </div>
    </div>
  );
}
