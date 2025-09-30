// components/PortfoliosDashboardClient/PortfoliosDashboardClient.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FolderIcon,
  PlusCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import AddPortfolioForm from "@/components/AddPortfolioForm/AddPortfolioForm";
import { Portfolio } from "@/types/api";

interface Props {
  portfolios: Portfolio[];
}

export default function PortfoliosDashboardClient({
  portfolios: initialPortfolios,
}: Props) {
  const [portfolios, setPortfolios] = useState(initialPortfolios);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const router = useRouter();
  const formRef = useRef<HTMLDivElement | null>(null);

  // Sincroniza el estado si las props del servidor cambian (después de un refresh)
  useEffect(() => {
    setPortfolios(initialPortfolios);
  }, [initialPortfolios]);

  const handlePortfolioAdded = () => {
    // **LA CLAVE EN EL CLIENTE**
    // router.refresh() le pide a Next.js que actualice los datos del Server Component
    router.refresh();
    setIsFormOpen(false);
  };

  const handleOpenForm = () => setIsFormOpen(true);
  const handleCloseForm = () => setIsFormOpen(false);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-[#0A2342] sm:text-5xl">
              Panel de Portafolios
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              Gestiona tus portafolios de inversión o crea uno nuevo para
              empezar.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <button
              onClick={handleOpenForm}
              className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 cursor-pointer group"
            >
              <PlusCircleIcon className="h-12 w-12 text-gray-400 group-hover:text-indigo-600" />
              <p className="mt-4 text-lg font-semibold text-gray-700 group-hover:text-indigo-800">
                Crear Nuevo Portafolio
              </p>
            </button>

            {/* Ahora el map itera sobre el estado local 'portfolios' */}
            {portfolios.map((portfolio) => (
              <div
                key={portfolio.slug}
                className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center mb-4">
                    <FolderIcon className="h-8 w-8 text-indigo-500 mr-3" />
                    <h2 className="text-xl font-bold text-gray-800 truncate">
                      {portfolio.name}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    {portfolio.tickers.length} activo(s) en seguimiento.
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {portfolio.tickers.slice(0, 3).map((ticker) => (
                      <li
                        key={ticker}
                        className="font-mono bg-gray-100 rounded px-2 py-1 inline-block mr-1"
                      >
                        {ticker}
                      </li>
                    ))}
                    {portfolio.tickers.length > 3 && (
                      <li className="font-mono bg-gray-100 rounded px-2 py-1 inline-block">
                        +{portfolio.tickers.length - 3}...
                      </li>
                    )}
                  </ul>
                </div>
                <button
                  onClick={() => router.push(`/portafolio/${portfolio.slug}`)}
                  className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Gestionar
                  <ArrowRightIcon className="ml-2 -mr-1 h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {portfolios.length === 0 && (
            <div className="text-center mt-12 bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-700">
                ¡Comienza tu viaje de inversión!
              </h3>
              <p className="text-gray-500 mt-2">
                Aún no has creado ningún portafolio. Haz clic en &quot;Crear
                Nuevo Portafolio&quot; para empezar a seguir tus activos.
              </p>
            </div>
          )}
        </div>
      </div>
      {isFormOpen && (
        <AddPortfolioForm
          onClose={handleCloseForm}
          formRef={formRef}
          onPortfolioAdded={handlePortfolioAdded}
        />
      )}
    </>
  );
}
