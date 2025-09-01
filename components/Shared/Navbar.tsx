"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import AddPortfolioForm from "../AddPortfolioForm/AddPortfolioForm";

// Define una interfaz para la estructura de cada portafolio
interface Portfolio {
  name: string; // Ej: "Nombre Apellido"
  slug: string; // Ej: "nombre-apellido"
  tickers: string[]; // Añadimos los tickers aquí
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  // Estado para almacenar los portafolios, inicializado como un array vacío
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

  const navbarRef = useRef<HTMLDivElement>(null);

  // Carga los portafolios desde localStorage al cargar el componente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPortfolios = localStorage.getItem("portfolios");
      if (savedPortfolios) {
        try {
          const parsedPortfolios: Portfolio[] = JSON.parse(savedPortfolios);
          setPortfolios(parsedPortfolios);
        } catch (error) {
          console.error(
            "Error al parsear los portafolios de localStorage:",
            error
          );
          setPortfolios([]); // Reinicia si hay un error de parseo
        }
      }
    }
  }, []); // Se ejecuta solo una vez al montar el componente

  const toggleDropdown = (dropdownName: string) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
    setOpenSubDropdown(null); // Cierra cualquier submenú al cambiar de menú principal
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleSubDropdown = (subDropdownName: string) => {
    setOpenSubDropdown(
      openSubDropdown === subDropdownName ? null : subDropdownName
    );
  };

  const closeAllMenus = useCallback(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    setOpenSubDropdown(null);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target as Node)
      ) {
        closeAllMenus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeAllMenus]);

  useEffect(() => {
    document.body.style.overflow =
      isMobileMenuOpen || isFormOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen, isFormOpen]);

  // Maneja la apertura del formulario
  const handleOpenForm = () => {
    closeAllMenus();
    setIsFormOpen(true);
  };

  // Callback llamado cuando un nuevo portafolio es añadido por el formulario
  const handlePortfolioAdded = (newPortfolio: Portfolio) => {
    setPortfolios((prevPortfolios) => {
      // Evitar añadir duplicados
      if (!prevPortfolios.some((p) => p.slug === newPortfolio.slug)) {
        const updatedPortfolios = [...prevPortfolios, newPortfolio];
        // Guarda la lista actualizada de portafolios en localStorage
        localStorage.setItem("portfolios", JSON.stringify(updatedPortfolios));
        return updatedPortfolios;
      }
      return prevPortfolios;
    });
  };

  // Maneja el cierre del formulario
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  return (
    <>
      <nav
        ref={navbarRef}
        className="fixed top-0 left-0 w-full bg-[#0A2342] py-4 text-white shadow-lg z-50"
      >
        <div className="container mx-auto flex justify-between items-center px-4 md:px-6">
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity duration-200"
            onClick={closeAllMenus}
          >
            <Image
              src="https://i.ibb.co/20RsFG5H/emporium-logo-1.jpg"
              alt="Emporium Quality Funds Logo"
              width={50}
              height={50}
              className="rounded-full mr-2"
            />
          </Link>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 p-1 rounded"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-7 w-7" />
              ) : (
                <Bars3Icon className="h-7 w-7" />
              )}
            </button>
          </div>

          <div className="hidden md:flex space-x-6 items-center">
            {/* Menú de Track Record */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("trackRecord")}
                className="flex items-center text-white hover:text-gray-300 transition-colors duration-200 px-3 py-2 rounded-md font-medium focus:outline-none cursor-pointer"
              >
                Track Record
                {openDropdown === "trackRecord" ? (
                  <ChevronUpIcon className="ml-1 h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                )}
              </button>
              {openDropdown === "trackRecord" && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A3A5E] rounded-md shadow-lg py-1 z-10">
                  <Link
                    href="/track-record/aluisa-diego"
                    className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                    onClick={closeAllMenus}
                  >
                    Aluisa Diego
                  </Link>
                  <Link
                    href="/track-record/riofrio-luis"
                    className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                    onClick={closeAllMenus}
                  >
                    Riofrío Luis
                  </Link>
                  <Link
                    href="/track-record/saa-mateo"
                    className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                    onClick={closeAllMenus}
                  >
                    Saa Mateo
                  </Link>
                  <Link
                    href="/track-record/tenesaca-jose"
                    className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                    onClick={closeAllMenus}
                  >
                    Tenesaca Jose
                  </Link>
                </div>
              )}
            </div>

            {/* Menú de Estrategias */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("estrategias")}
                className="flex items-center text-white hover:text-gray-300 transition-colors duration-200 px-3 py-2 rounded-md font-medium focus:outline-none cursor-pointer"
              >
                Estrategias
                {openDropdown === "estrategias" ? (
                  <ChevronUpIcon className="ml-1 h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                )}
              </button>
              {openDropdown === "estrategias" && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A3A5E] rounded-md shadow-lg py-1 z-10">
                  <Link
                    href="/manuales/Nasdaq-1"
                    className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                    onClick={closeAllMenus}
                  >
                    Estrategia NQ
                  </Link>
                  <Link
                    href="/manuales/Nasdaq-2"
                    className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                    onClick={closeAllMenus}
                  >
                    Estrategia MNQ
                  </Link>
                  <Link
                    href="/manuales/SP500-1"
                    className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                    onClick={closeAllMenus}
                  >
                    Estrategia MES
                  </Link>
                  <Link
                    href="/manuales/SP500-2"
                    className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                    onClick={closeAllMenus}
                  >
                    Estrategia ES
                  </Link>
                </div>
              )}
            </div>

            {/* Menú de Informes */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("informes")}
                className="flex items-center text-white hover:text-gray-300 transition-colors duration-200 px-3 py-2 rounded-md font-medium focus:outline-none cursor-pointer"
              >
                Informes
                {openDropdown === "informes" ? (
                  <ChevronUpIcon className="ml-1 h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                )}
              </button>
              {openDropdown === "informes" && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A3A5E] rounded-md shadow-lg py-1 z-10">
                  <Link
                    href="/informes/NQ"
                    className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                    onClick={closeAllMenus}
                  >
                    Informes NQ
                  </Link>
                  <Link
                    href="/informes/MNQ"
                    className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                    onClick={closeAllMenus}
                  >
                    Informes MNQ
                  </Link>
                  <Link
                    href="/informes/MES"
                    className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                    onClick={closeAllMenus}
                  >
                    Informes MES
                  </Link>
                  <Link
                    href="/informes/ES"
                    className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                    onClick={closeAllMenus}
                  >
                    Informes ES
                  </Link>
                </div>
              )}
            </div>

            {/* Menú de Herramientas */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("herramientas")}
                className="flex items-center text-white hover:text-gray-300 transition-colors duration-200 px-3 py-2 rounded-md font-medium focus:outline-none cursor-pointer"
              >
                <Cog6ToothIcon className="h-5 w-5 mr-1" />
                Herramientas
                {openDropdown === "herramientas" ? (
                  <ChevronUpIcon className="ml-1 h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                )}
              </button>
              {openDropdown === "herramientas" && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A3A5E] rounded-md shadow-lg py-1 z-10">
                  <div className="relative group">
                    <button
                      className="flex justify-between items-center px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200 w-full text-left"
                      onClick={() => toggleSubDropdown("preMercado")}
                    >
                      <span>Pre-Mercado</span>
                      {openSubDropdown === "preMercado" ? (
                        <ChevronUpIcon className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="ml-1 h-4 w-4" />
                      )}
                    </button>
                    {openSubDropdown === "preMercado" && (
                      <div className="absolute left-full top-0 mt-0 ml-1 w-48 bg-[#1A3A5E] rounded-md shadow-lg py-1 z-20">
                        <Link
                          href="/pre-mercado/new-york"
                          className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                          onClick={closeAllMenus}
                        >
                          Nueva York
                        </Link>
                        <Link
                          href="/pre-mercado/sidney"
                          className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                          onClick={closeAllMenus}
                        >
                          Sidney
                        </Link>
                        <Link
                          href="/pre-mercado/asia"
                          className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                          onClick={closeAllMenus}
                        >
                          Asia
                        </Link>
                        <Link
                          href="/pre-mercado/europa"
                          className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                          onClick={closeAllMenus}
                        >
                          Europa
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="relative group">
                    <button
                      className="flex justify-between items-center px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200 w-full text-left"
                      onClick={() => toggleSubDropdown("sesgoDiario")}
                    >
                      <span>Sesgo Diario</span>
                      {openSubDropdown === "sesgoDiario" ? (
                        <ChevronUpIcon className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="ml-1 h-4 w-4" />
                      )}
                    </button>
                    {openSubDropdown === "sesgoDiario" && (
                      <div className="absolute left-full top-0 mt-0 ml-1 w-48 bg-[#1A3A5E] rounded-md shadow-lg py-1 z-20">
                        <Link
                          href="/sentimiento-macro/NQ"
                          className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                          onClick={closeAllMenus}
                        >
                          Nasdaq
                        </Link>
                        <Link
                          href="/sentimiento-macro/ES"
                          className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                          onClick={closeAllMenus}
                        >
                          S&P 500
                        </Link>
                      </div>
                    )}
                  </div>
                  <Link
                    href="/stock-screener"
                    className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                    onClick={closeAllMenus}
                  >
                    Stock Screener
                  </Link>
                </div>
              )}
            </div>

            {/* Menú de Portafolios (Escritorio) */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("portafolios")}
                className="flex items-center text-white hover:text-gray-300 transition-colors duration-200 px-3 py-2 rounded-md font-medium focus:outline-none cursor-pointer"
              >
                Portafolios
                {openDropdown === "portafolios" ? (
                  <ChevronUpIcon className="ml-1 h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                )}
              </button>
              {openDropdown === "portafolios" && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A3A5E] rounded-md shadow-lg py-1 z-10">
                  <button
                    onClick={handleOpenForm}
                    className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                  >
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Agregar
                  </button>
                  {portfolios.length > 0 && ( // Solo muestra la línea si hay portafolios
                    <hr className="border-gray-700 my-1" />
                  )}
                  {/* Renderizado dinámico de portafolios */}
                  {portfolios.map((portfolio) => (
                    <Link
                      key={portfolio.slug}
                      href={`/portafolio/${portfolio.slug}`}
                      className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                      onClick={closeAllMenus}
                    >
                      {portfolio.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menú para Móvil */}
        <div
          className={`md:hidden absolute top-full left-0 w-full bg-[#0A2342] ${
            isMobileMenuOpen ? "block" : "hidden"
          } max-h-[calc(100vh-64px)] overflow-y-auto pb-4 px-2 transition-all duration-300 ease-in-out`}
        >
          <div className="space-y-3 pt-2">
            <span className="block text-gray-400 text-sm font-semibold px-3 py-2">
              Track Record:
            </span>
            <Link
              href="/track-record/aluisa-diego"
              className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
              onClick={closeAllMenus}
            >
              Aluisa Diego
            </Link>
            <Link
              href="/track-record/riofrio-luis"
              className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
              onClick={closeAllMenus}
            >
              Riofrío Luis
            </Link>
            <Link
              href="/track-record/saa-mateo"
              className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
              onClick={closeAllMenus}
            >
              Saa Mateo
            </Link>
            <Link
              href="/track-record/tenesaca-jose"
              className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
              onClick={closeAllMenus}
            >
              Tenesaca Jose
            </Link>
            <hr className="border-gray-700 my-2" />
            <span className="block text-gray-400 text-sm font-semibold px-3 py-2">
              Estrategias:
            </span>
            <Link
              href="/manuales/Nasdaq-1"
              className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
              onClick={closeAllMenus}
            >
              Estrategia NQ
            </Link>
            <Link
              href="/manuales/Nasdaq-2"
              className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
              onClick={closeAllMenus}
            >
              Estrategia MNQ
            </Link>
            <Link
              href="/manuales/SP500-1"
              className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
              onClick={closeAllMenus}
            >
              Estrategia MES
            </Link>
            <Link
              href="/manuales/SP500-2"
              className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
              onClick={closeAllMenus}
            >
              Estrategia ES
            </Link>
            <hr className="border-gray-700 my-2" />
            <span className="block text-gray-400 text-sm font-semibold px-3 py-2">
              Informes:
            </span>
            <Link
              href="/informes/NQ"
              className="block px-3 py-2 text-white hover:text-gray-300 rounded-md text-base font-medium pl-6"
              onClick={closeAllMenus}
            >
              Informes NQ
            </Link>
            <Link
              href="/informes/MNQ"
              className="block px-3 py-2 text-white hover:text-gray-300 rounded-md text-base font-medium pl-6"
              onClick={closeAllMenus}
            >
              Informes MNQ
            </Link>
            <Link
              href="/informes/MES"
              className="block px-3 py-2 text-white hover:text-gray-300 rounded-md text-base font-medium pl-6"
              onClick={closeAllMenus}
            >
              Informes MES
            </Link>
            <Link
              href="/informes/ES"
              className="block px-3 py-2 text-white hover:text-gray-300 rounded-md text-base font-medium pl-6"
              onClick={closeAllMenus}
            >
              Informes ES
            </Link>
            <hr className="border-gray-700 my-2" />
            <span className="block text-gray-400 text-sm font-semibold px-3 py-2">
              Herramientas:
            </span>
            <div className="px-3">
              <span className="block text-white text-sm font-medium py-1">
                Pre-Mercado
              </span>
              <Link
                href="/pre-mercado/new-york"
                className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
                onClick={closeAllMenus}
              >
                Nueva York
              </Link>
              <Link
                href="/pre-mercado/sidney"
                className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
                onClick={closeAllMenus}
              >
                Sidney
              </Link>
              <Link
                href="/pre-mercado/asia"
                className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
                onClick={closeAllMenus}
              >
                Asia
              </Link>
              <Link
                href="/pre-mercado/europa"
                className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
                onClick={closeAllMenus}
              >
                Europa
              </Link>
            </div>
            <Link
              href="/stock-screener"
              className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
              onClick={closeAllMenus}
            >
              Stock Screener
            </Link>
            <Link
              href="/sentimiento-macro/NQ"
              className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
              onClick={closeAllMenus}
            >
              Sesgo Diario - Nasdaq
            </Link>
            <Link
              href="/sentimiento-macro/ES"
              className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
              onClick={closeAllMenus}
            >
              Sesgo Diario - S&P 500
            </Link>
            <hr className="border-gray-700 my-2" />
            <span className="block text-gray-400 text-sm font-semibold px-3 py-2">
              Portafolios:
            </span>
            <button
              onClick={handleOpenForm}
              className="flex items-center w-full text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Agregar
            </button>
            {portfolios.length > 0 && ( // Solo muestra la línea si hay portafolios
              <hr className="border-gray-700 my-2" />
            )}
            {/* Renderizado dinámico de portafolios en móvil */}
            {portfolios.map((portfolio) => (
              <Link
                key={`mobile-${portfolio.slug}`} // Clave única para el menú móvil
                href={`/portafolio/${portfolio.slug}`}
                className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
                onClick={closeAllMenus}
              >
                {portfolio.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      {/* Pasa el callback `onPortfolioAdded` al formulario */}
      {isFormOpen && (
        <AddPortfolioForm
          onClose={handleCloseForm}
          onPortfolioAdded={handlePortfolioAdded}
        />
      )}
    </>
  );
}
