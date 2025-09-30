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
} from "@heroicons/react/24/outline";

// Interfaz para la estructura del portafolio (debe coincidir con tu modelo de DB)
interface Portfolio {
  _id: string; // MongoDB usa _id
  name: string;
  slug: string;
}

// Interfaz para las props del Navbar
interface NavbarProps {
  portfolios: Portfolio[];
}

export default function Navbar({ portfolios }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);
  const navbarRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = (dropdownName: string) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
    setOpenSubDropdown(null);
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeAllMenus]);

  return (
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

        {/* --- Botón de Menú Móvil --- */}
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

        {/* --- Menú de Escritorio --- */}
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
                  href="/operativas/tenesaca-gabriel"
                  className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                  onClick={closeAllMenus}
                >
                  Tenesaca Gabriel
                </Link>
              </div>
            )}
          </div>

          {/* Menú de Commodities */}
          <button className="flex items-center text-white hover:text-gray-300 transition-colors duration-200 px-3 py-2 rounded-md font-medium focus:outline-none cursor-pointer">
            Commodities
          </button>

          {/* Menú de Acciones */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("acciones")}
              className="flex items-center text-white hover:text-gray-300 transition-colors duration-200 px-3 py-2 rounded-md font-medium focus:outline-none cursor-pointer"
            >
              Acciones
              {openDropdown === "acciones" ? (
                <ChevronUpIcon className="ml-1 h-4 w-4" />
              ) : (
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              )}
            </button>
            {openDropdown === "acciones" && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-[#1A3A5E] rounded-md shadow-lg py-1 z-10">
                <div className="relative group">
                  <button
                    className="flex justify-between items-center px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200 w-full text-left"
                    onClick={() => toggleSubDropdown("portafolios")}
                  >
                    <span>Portafolios</span>
                    {openSubDropdown === "portafolios" ? (
                      <ChevronUpIcon className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="ml-1 h-4 w-4" />
                    )}
                  </button>
                  {openSubDropdown === "portafolios" && (
                    <div className="absolute right-full top-0 mt-0 mr-1 w-48 bg-[#1A3A5E] rounded-md shadow-lg py-1 z-20">
                      <Link
                        href="/portafolio"
                        onClick={closeAllMenus}
                        className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200 cursor-pointer"
                      >
                        <PlusCircleIcon className="h-5 w-5 mr-2" />
                        Gestionar
                      </Link>
                      {portfolios.length > 0 && (
                        <hr className="border-gray-700 my-1" />
                      )}
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
                <Link
                  href="/recomendaciones"
                  className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                  onClick={closeAllMenus}
                >
                  Recomendaciones
                </Link>
                <Link
                  href="/stock-scanner"
                  className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                  onClick={closeAllMenus}
                >
                  Stock Scanner
                </Link>
                <Link
                  href="/recession-scanner-stocks"
                  className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                  onClick={closeAllMenus}
                >
                  Recession Scanner
                </Link>
                <Link
                  href="/performance-sector"
                  className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                  onClick={closeAllMenus}
                >
                  Performance Sector
                </Link>
              </div>
            )}
          </div>

          {/* Menú de Macro */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("macro")}
              className="flex items-center text-white hover:text-gray-300 transition-colors duration-200 px-3 py-2 rounded-md font-medium focus:outline-none cursor-pointer"
            >
              Macro
              {openDropdown === "macro" ? (
                <ChevronUpIcon className="ml-1 h-4 w-4" />
              ) : (
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              )}
            </button>
            {openDropdown === "macro" && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-[#1A3A5E] rounded-md shadow-lg py-1 z-10">
                <div className="relative group">
                  <button
                    className="flex justify-between items-center px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200 w-full text-left"
                    onClick={() => toggleSubDropdown("estrategiasMacro")}
                  >
                    <span>Estrategias</span>
                    {openSubDropdown === "estrategiasMacro" ? (
                      <ChevronUpIcon className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="ml-1 h-4 w-4" />
                    )}
                  </button>
                  {openSubDropdown === "estrategiasMacro" && (
                    <div className="absolute right-full top-0 mt-0 mr-1 w-48 bg-[#1A3A5E] rounded-md shadow-lg py-1 z-20">
                      <Link
                        href="/manuales/Nasdaq-1"
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
                    <div className="absolute right-full top-0 mt-0 mr-1 w-48 bg-[#1A3A5E] rounded-md shadow-lg py-1 z-20">
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
                  href="/recesion"
                  className="block px-4 py-2 text-sm text-white hover:bg-[#2A4A7E] transition-colors duration-200"
                  onClick={closeAllMenus}
                >
                  Recession Scanner
                </Link>
              </div>
            )}
          </div>

          {/* Menú de Riesgos */}
          <button className="flex items-center text-white hover:text-gray-300 transition-colors duration-200 px-3 py-2 rounded-md font-medium focus:outline-none cursor-pointer">
            Riesgos
          </button>
        </div>
      </div>

      {/* --- Menú para Móvil (Completo) --- */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-[#0A2342] ${
          isMobileMenuOpen ? "block" : "hidden"
        } max-h-[calc(100vh-64px)] overflow-y-auto pb-4 px-2 transition-all duration-300 ease-in-out`}
      >
        <div className="space-y-3 pt-2">
          {/* Track Record */}
          <span className="block text-gray-400 text-sm font-semibold px-3 py-2">
            Track Record:
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
            href="/operativas/tenesaca-gabriel"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
            onClick={closeAllMenus}
          >
            Tenesaca Gabriel
          </Link>
          <hr className="border-gray-700 my-2" />

          {/* Commodities */}
          <a
            href="#"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium"
          >
            Commodities
          </a>
          <hr className="border-gray-700 my-2" />

          {/* Acciones */}
          <span className="block text-gray-400 text-sm font-semibold px-3 py-2">
            Acciones:
          </span>
          <span className="block text-white text-sm font-medium py-1 pl-6">
            Portafolios
          </span>
          <Link
            href="/portafolio"
            onClick={closeAllMenus}
            className="flex items-center w-full text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-9"
          >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Gestionar
          </Link>
          {portfolios.map((portfolio) => (
            <Link
              key={`mobile-${portfolio.slug}`}
              href={`/portafolio/${portfolio.slug}`}
              className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-9"
              onClick={closeAllMenus}
            >
              {portfolio.name}
            </Link>
          ))}
          <Link
            href="/recomendaciones"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
            onClick={closeAllMenus}
          >
            Recomendaciones
          </Link>
          <Link
            href="/stock-scanner"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
            onClick={closeAllMenus}
          >
            Stock Scanner
          </Link>
          <Link
            href="/recession-scanner-stocks"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
            onClick={closeAllMenus}
          >
            Recession Scanner
          </Link>
          <Link
            href="/performance-sector"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
            onClick={closeAllMenus}
          >
            Performance Sector
          </Link>
          <hr className="border-gray-700 my-2" />

          {/* Macro */}
          <span className="block text-gray-400 text-sm font-semibold px-3 py-2">
            Macro:
          </span>
          <span className="block text-white text-sm font-medium py-1 pl-6">
            Estrategias
          </span>
          <Link
            href="/manuales/Nasdaq-1"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-9"
            onClick={closeAllMenus}
          >
            Estrategia MNQ
          </Link>
          <Link
            href="/manuales/SP500-1"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-9"
            onClick={closeAllMenus}
          >
            Estrategia MES
          </Link>
          <span className="block text-white text-sm font-medium py-1 pl-6">
            Sesgo Diario
          </span>
          <Link
            href="/sentimiento-macro/NQ"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-9"
            onClick={closeAllMenus}
          >
            Nasdaq
          </Link>
          <Link
            href="/sentimiento-macro/ES"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-9"
            onClick={closeAllMenus}
          >
            S&P 500
          </Link>
          <Link
            href="/recesion"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium pl-6"
            onClick={closeAllMenus}
          >
            Recession Scanner
          </Link>
          <hr className="border-gray-700 my-2" />

          {/* Riesgos */}
          <a
            href="#"
            className="block text-white hover:text-gray-300 px-3 py-2 rounded-md text-base font-medium"
          >
            Riesgos
          </a>
        </div>
      </div>
    </nav>
  );
}
