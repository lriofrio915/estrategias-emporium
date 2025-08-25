// app/portafolio/[operador]/page.tsx
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation"; // Importa useRouter
import {
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
  PlusCircleIcon,
  ExclamationCircleIcon, // Nuevo icono para el modal de confirmación
} from "@heroicons/react/24/outline";

// Definimos la interfaz para los datos de cada activo
interface AssetData {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  price: number | null;
  dailyChange: number | null;
  error?: string; // Para manejar errores individuales por activo
}

// Definimos la interfaz para la estructura de cada elemento de la API
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
  };
}

// Interfaz para la estructura del portafolio, consistente con Navbar y AddPortfolioForm
interface Portfolio {
  name: string;
  slug: string;
  tickers: string[];
}

export default function PortfolioPage() {
  const params = useParams();
  const router = useRouter(); // Inicializa el router
  const operadorSlug = params.operador as string;

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [currentTickers, setCurrentTickers] = useState<string[]>([]);
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"none" | "sector" | "industry">("none");
  const [newTickerInput, setNewTickerInput] = useState<string>("");
  const [addingTicker, setAddingTicker] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false); // Estado para el modal de confirmación

  // Carga los datos iniciales del portafolio al montar el componente
  useEffect(() => {
    if (typeof window !== "undefined" && operadorSlug) {
      const savedPortfolios = localStorage.getItem("portfolios");
      if (savedPortfolios) {
        try {
          const allPortfolios: Portfolio[] = JSON.parse(savedPortfolios);
          const foundPortfolio = allPortfolios.find(
            (p) => p.slug === operadorSlug
          );

          if (foundPortfolio) {
            setPortfolio(foundPortfolio);
            setCurrentTickers(foundPortfolio.tickers);
          } else {
            setError("Portafolio no encontrado para este operador.");
            setLoading(false);
          }
        } catch (err) {
          console.error(
            "Error al parsear los portafolios de localStorage:",
            err
          );
          setError("Error al cargar los datos del portafolio.");
          setLoading(false);
        }
      } else {
        setError("No hay portafolios guardados.");
        setLoading(false);
      }
    }
  }, [operadorSlug]);

  // Función para obtener los datos de un solo ticker desde la API
  const fetchSingleAssetData = useCallback(async (ticker: string) => {
    try {
      const response = await fetch(`/api/stocks?tickers=${ticker}`);
      if (!response.ok) {
        throw new Error(`Fallo al obtener los datos para ${ticker}.`);
      }
      const apiResponse = await response.json();

      if (
        apiResponse.success === false ||
        !apiResponse.data ||
        apiResponse.data.length === 0
      ) {
        return {
          ticker,
          error:
            apiResponse.message || `No se encontraron datos para ${ticker}.`,
        };
      }

      const assetItem: ApiAssetItem = apiResponse.data[0];
      const priceData = assetItem.data?.price;
      const assetProfileData = assetItem.data?.assetProfile;

      const name = priceData?.longName || priceData?.symbol || assetItem.ticker;
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
    } catch (err: unknown) {
      console.error(`Error al obtener datos de ${ticker}:`, err);
      return {
        ticker,
        error: err instanceof Error ? err.message : "Error desconocido.",
      };
    }
  }, []);

  // Función para obtener los datos de todo el portafolio
  const fetchPortfolioData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (currentTickers.length === 0) {
        setAssets([]);
        setLoading(false);
        return;
      }
      const fetchedAssets = await Promise.all(
        currentTickers.map((ticker) => fetchSingleAssetData(ticker))
      );
      setAssets(fetchedAssets.filter((asset) => !asset.error) as AssetData[]);
    } catch (err: unknown) {
      console.error("Error al obtener datos del portafolio:", err);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los datos del portafolio. Por favor, inténtalo de nuevo más tarde."
      );
    } finally {
      setLoading(false);
    }
  }, [currentTickers, fetchSingleAssetData]);

  // Vuelve a cargar los datos de los tickers cada vez que cambia la lista currentTickers
  useEffect(() => {
    if (portfolio && currentTickers.length > 0) {
      fetchPortfolioData();
    } else if (portfolio && currentTickers.length === 0) {
      setAssets([]);
      setLoading(false);
    }
  }, [portfolio, currentTickers, fetchPortfolioData]);

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

  const updatePortfoliosInLocalStorage = useCallback(
    (updatedPortfolio: Portfolio) => {
      if (typeof window !== "undefined") {
        const savedPortfolios = localStorage.getItem("portfolios");
        if (savedPortfolios) {
          try {
            const allPortfolios: Portfolio[] = JSON.parse(savedPortfolios);
            const updatedAllPortfolios = allPortfolios.map((p) =>
              p.slug === updatedPortfolio.slug ? updatedPortfolio : p
            );
            localStorage.setItem(
              "portfolios",
              JSON.stringify(updatedAllPortfolios)
            );
          } catch (err) {
            console.error(
              "Error al actualizar portafolios en localStorage:",
              err
            );
          }
        }
      }
    },
    []
  );

  const handleAddTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    const tickerToAdd = newTickerInput.trim().toUpperCase();

    // Modificación aquí: Mensaje de error más específico
    if (!tickerToAdd) {
      setError("Por favor, introduce un ticker para añadir.");
      return;
    }
    if (currentTickers.includes(tickerToAdd)) {
      setError("Este ticker ya está en la lista.");
      return;
    }

    setAddingTicker(true);
    setError(null); // Limpia cualquier error anterior

    const newAssetData = await fetchSingleAssetData(tickerToAdd);

    if (newAssetData.error) {
      setError(newAssetData.error);
    } else {
      const updatedTickers = [...currentTickers, tickerToAdd];
      setCurrentTickers(updatedTickers);
      setAssets((prevAssets) => [...prevAssets, newAssetData as AssetData]);
      setNewTickerInput("");

      // Actualizar localStorage con los nuevos tickers para este portafolio
      if (portfolio) {
        const updatedPortfolio: Portfolio = {
          ...portfolio,
          tickers: updatedTickers,
        };
        setPortfolio(updatedPortfolio);
        updatePortfoliosInLocalStorage(updatedPortfolio);
      }
    }
    setAddingTicker(false);
  };

  const handleDeleteTicker = (tickerToDelete: string) => {
    const updatedTickers = currentTickers.filter(
      (ticker) => ticker !== tickerToDelete
    );
    setCurrentTickers(updatedTickers);
    setAssets((prevAssets) =>
      prevAssets.filter((asset) => asset.ticker !== tickerToDelete)
    );

    // Actualizar localStorage con los tickers eliminados para este portafolio
    if (portfolio) {
      const updatedPortfolio: Portfolio = {
        ...portfolio,
        tickers: updatedTickers,
      };
      setPortfolio(updatedPortfolio);
      updatePortfoliosInLocalStorage(updatedPortfolio);
    }
  };

  const getReportPath = (ticker: string) => {
    return `/portafolio/${operadorSlug}/${ticker.toLowerCase()}`;
  };

  // Función para abrir el modal de confirmación de eliminación
  const openDeleteConfirmModal = () => {
    setShowConfirmModal(true);
  };

  // Función para cerrar el modal de confirmación
  const closeDeleteConfirmModal = () => {
    setShowConfirmModal(false);
  };

  // Función para eliminar el portafolio
  const confirmDeletePortfolio = () => {
    if (typeof window !== "undefined") {
      const savedPortfolios = localStorage.getItem("portfolios");
      if (savedPortfolios) {
        try {
          const allPortfolios: Portfolio[] = JSON.parse(savedPortfolios);
          // Filtra el portafolio a eliminar por su slug
          const updatedAllPortfolios = allPortfolios.filter(
            (p) => p.slug !== operadorSlug
          );
          localStorage.setItem(
            "portfolios",
            JSON.stringify(updatedAllPortfolios)
          );
        } catch (err) {
          console.error("Error al eliminar portafolio de localStorage:", err);
        }
      }
    }
    closeDeleteConfirmModal(); // Cierra el modal
    router.push("/"); // Redirige a la página de inicio
    // router.refresh(); // Eliminado: router.refresh() no es tan fiable para un refresh completo
    window.location.reload(); // Agregado: Fuerza un refresco completo de la página para actualizar el Navbar
  };

  // Muestra un mensaje de carga o error si no hay datos iniciales
  if (loading && !portfolio && !error) {
    return (
      <div className="pt-24 min-h-screen bg-[#0A192F] text-white flex justify-center items-center">
        <p>Cargando datos del portafolio...</p>
      </div>
    );
  }

  if (error && !portfolio) { // Solo muestra el error si no hay portafolio cargado
    return (
      <div className="pt-24 min-h-screen bg-[#0A192F] text-white flex justify-center items-center">
        <p className="text-red-500 text-lg">
          {error || "No se pudo cargar el portafolio."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pt-2 font-inter">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <header className="text-center mb-12 mt-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A2342] mb-4">
            Portafolio de {portfolio?.name || "Cargando..."}
          </h1>
          <p className="text-lg md:text-xl text-[#849E8F]">
            Un resumen de los activos que componen el portafolio, con
            información de precios y cambios diarios, incluyendo sector e
            industria.
          </p>
        </header>

        {/* --- FORMULARIO PARA AÑADIR TICKERS Y BOTÓN DE ELIMINAR --- */}
        <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-bold text-center text-[#0A2342] mb-6">
            Gestionar Activos
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6"> {/* Contenedor para los botones */}
            <form
              onSubmit={handleAddTicker}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto"
            >
              <input
                type="text"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2342] w-full sm:w-auto text-gray-900"
                placeholder="Introduce un Ticker (ej: GOOGL)"
                value={newTickerInput}
                onChange={(e) => setNewTickerInput(e.target.value)}
                disabled={addingTicker}
              />
              <button
                type="submit"
                className="bg-[#0A2342] text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors duration-200 flex items-center justify-center w-full sm:w-auto"
                disabled={addingTicker}
              >
                {addingTicker ? (
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
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
                ) : (
                  <PlusCircleIcon className="h-5 w-5 mr-2" />
                )}
                Añadir Activo
              </button>
            </form>
            {/* Botón para eliminar el portafolio completo, ahora al lado del formulario */}
            <button
              onClick={openDeleteConfirmModal}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 flex items-center justify-center w-full sm:w-auto"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Eliminar Portafolio
            </button>
          </div>
          {/* Muestra el error aquí, dentro de la sección del formulario */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4 text-center">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}
        </section>

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
                    <th
                      scope="col"
                      className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      Acciones
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
                        {asset.error ? (
                          <span className="text-red-500 text-xs">
                            Error de carga
                          </span>
                        ) : (
                          <a
                            href={getReportPath(asset.ticker)}
                            className="text-blue-600 hover:text-blue-800 font-medium underline transition-colors duration-200"
                          >
                            Ver más
                          </a>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-800 flex justify-center items-center">
                        <button
                          onClick={() => handleDeleteTicker(asset.ticker)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200 cursor-pointer"
                          title={`Eliminar ${asset.ticker}`}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
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

      {/* Modal de Confirmación de Eliminación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative text-center">
            <ExclamationCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              ¿Estás seguro de que quieres eliminar este portafolio?
            </h3>
            <p className="text-gray-600 mb-6">
              Esta acción es irreversible y eliminará el portafolio
              &quot;{portfolio?.name}&quot; de forma permanente.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={closeDeleteConfirmModal}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md font-semibold hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeletePortfolio}
                className="px-6 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
