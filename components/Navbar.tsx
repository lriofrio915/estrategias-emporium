"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const navbarRef = useRef<HTMLDivElement>(null);

  // Usamos un solo estado para manejar qué menú desplegable está abierto.
  // Esto simplifica la lógica de cierre y evita conflictos.
  const toggleDropdown = (dropdownName: string) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
    // Aseguramos que el menú móvil se cierre al interactuar con un dropdown de escritorio
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  // Cierra los menús si el usuario hace clic fuera del navbar
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
  }, []);

  // Controla el scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <nav
      ref={navbarRef}
      className="fixed top-0 left-0 w-full bg-[#0A2342] py-4 text-white shadow-lg z-50"
    >
      <div className="container mx-auto flex justify-between items-center px-4 md:px-6">
        {/* Logo */}
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

        {/* Botón de Hamburguesa para Móvil */}
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

        {/* Enlaces de Navegación para Escritorio */}
        <div className="hidden md:flex space-x-6 items-center">
          {/* Menú desplegable de Operativa */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("operativa")}
              className="flex items-center text-white hover:text-gray-300 transition-colors duration-200 px-3 py-2 rounded-md font-medium focus:outline-none cursor-pointer"
            >
              Operativas
              {openDropdown === "operativa" ? (
                <ChevronUpIcon className="ml-1 h-4 w-4" />
              ) : (
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              )}
            </button>
            {openDropdown === "operativa" && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A3A5E] rounded-md shadow-lg py-1 z-10">
                <Link
                  href="/operativas/aluisa-diego"
                  className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                  onClick={closeAllMenus}
                >
                  Aluisa Diego
                </Link>
                <Link
                  href="/operativas/riofrio-luis"
                  className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                  onClick={closeAllMenus}
                >
                  Riofrío Luis
                </Link>
                <Link
                  href="/operativas/saa-mateo"
                  className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                  onClick={closeAllMenus}
                >
                  Saa Mateo
                </Link>
                <Link
                  href="/operativas/tenesaca-jose"
                  className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                  onClick={closeAllMenus}
                >
                  Tenesaca Jose
                </Link>
              </div>
            )}
          </div>

          {/* Menú desplegable de Estrategias */}
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
                  href="/manuales/Nasdaq"
                  className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                  onClick={closeAllMenus}
                >
                  Estrategia NQ
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

          {/* Menú desplegable de Informes */}
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

          {/* Menú desplegable de Sesgo Diario */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("sesgoDiario")}
              className="flex items-center text-white hover:text-gray-300 transition-colors duration-200 px-3 py-2 rounded-md font-medium focus:outline-none cursor-pointer"
            >
              Sesgo Diario
              {openDropdown === "sesgoDiario" ? (
                <ChevronUpIcon className="ml-1 h-4 w-4" />
              ) : (
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              )}
            </button>
            {openDropdown === "sesgoDiario" && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A3A5E] rounded-md shadow-lg py-1 z-10">
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
                <Link
                  href="/sentimiento-macro/USDJPY"
                  className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                  onClick={closeAllMenus}
                >
                  USDJPY
                </Link>
                <Link
                  href="/sentimiento-macro/USDCHF"
                  className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                  onClick={closeAllMenus}
                >
                  USDCHF
                </Link>
                <Link
                  href="/sentimiento-macro/USDCAD"
                  className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                  onClick={closeAllMenus}
                >
                  USDCAD
                </Link>
                <Link
                  href="/sentimiento-macro/EURUSD"
                  className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                  onClick={closeAllMenus}
                >
                  EURUSD
                </Link>
              </div>
            )}
          </div>

          {/* Menú desplegable de Herramientas */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("herramientas")}
              className="flex items-center text-white hover:text-gray-300 transition-colors duration-200 px-3 py-2 rounded-md font-medium focus:outline-none cursor-pointer"
            >
              Herramientas
              {openDropdown === "herramientas" ? (
                <ChevronUpIcon className="ml-1 h-4 w-4" />
              ) : (
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              )}
            </button>
            {openDropdown === "herramientas" && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A3A5E] rounded-md shadow-lg py-1 z-10">
                <Link
                  href="/cot-informatico"
                  className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                  onClick={closeAllMenus}
                >
                  Cot Informático
                </Link>
                <Link
                  href="/sentimiento-retail"
                  className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                  onClick={closeAllMenus}
                >
                  Sentimiento Retail
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menú Desplegable para Móvil */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-[#0A2342] ${
          isMobileMenuOpen ? "block" : "hidden"
        } max-h-[calc(100vh-64px)] overflow-y-auto pb-4 px-2 transition-all duration-300 ease-in-out`}
      >
        <div className="space-y-3 pt-2">
          {/* Operativa */}
          <span className="block text-gray-400 text-sm font-semibold px-3 py-2">
            Operativas:
          </span>
          <Link
            href="/operativas/aluisa-diego"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
            onClick={closeAllMenus}
          >
            Aluisa Diego
          </Link>
          <Link
            href="/operativas/riofrio-luis"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
            onClick={closeAllMenus}
          >
            Riofrío Luis
          </Link>
          <Link
            href="/operativas/saa-mateo"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
            onClick={closeAllMenus}
          >
            Saa Mateo
          </Link>
          <Link
            href="/operativas/tenesaca-jose"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
            onClick={closeAllMenus}
          >
            Tenesaca Jose
          </Link>

          <hr className="border-gray-700 my-2" />

          {/* Estrategias */}
          <span className="block text-gray-400 text-sm font-semibold px-3 py-2">
            Estrategias:
          </span>
          <Link
            href="/manuales/Nasdaq"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
            onClick={closeAllMenus}
          >
            Estrategia NQ
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

          {/* Informes */}
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

          {/* Sesgo Diario */}
          <span className="block text-gray-400 text-sm font-semibold px-3 py-2">
            Sesgo Diario:
          </span>
          <Link
            href="/sentimiento-macro/NQ"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
            onClick={closeAllMenus}
          >
            Nasdaq
          </Link>
          <Link
            href="/sentimiento-macro/ES"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
            onClick={closeAllMenus}
          >
            S&P 500
          </Link>
          <Link
            href="/sentimiento-macro/USDJPY"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
            onClick={closeAllMenus}
          >
            USDJPY
          </Link>
          <Link
            href="/sentimiento-macro/USDCHF"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
            onClick={closeAllMenus}
          >
            USDCHF
          </Link>
          <Link
            href="/sentimiento-macro/USDCAD"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
            onClick={closeAllMenus}
          >
            USDCAD
          </Link>
          <Link
            href="/sentimiento-macro/EURUSD"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
            onClick={closeAllMenus}
          >
            EURUSD
          </Link>

          <hr className="border-gray-700 my-2" />

          {/* Nuevo Menú de Herramientas para móvil */}
          <span className="block text-gray-400 text-sm font-semibold px-3 py-2">
            Herramientas:
          </span>
          <Link
            href="/cot-informatico"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
            onClick={closeAllMenus}
          >
            Cot Informático
          </Link>
          <Link
            href="/sentimiento-retail"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
            onClick={closeAllMenus}
          >
            Sentimiento Retail
          </Link>
        </div>
      </div>
    </nav>
  );
}
