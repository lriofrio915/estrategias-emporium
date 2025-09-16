// /app/recession/page.tsx
import React from "react";
import IndicatorCard from "../../components/IndicatorCard/IndicatorCard";
import OverallStatus from "../../components/OverallStatus/OverallStatus";
import RecessionChart from "../../components/RecessionChart/RecessionChart";
import SahmChart from "../../components/SahmChart/SahmChart";
import MarketIndexChart from "../../components/MarketIndexChart/MarketIndexChart";

// Definimos los tipos de bandera para asegurar la consistencia
type FlagColor = "green" | "yellow" | "red" | "orange";

// Simulación de los datos obtenidos de una API (por ejemplo, desde FRED)
const fetchEconomicData = async () => {
  // En un proyecto real, aquí harías un 'fetch' a tu API de backend
  // que a su vez obtendría los datos de FRED.
  const data = {
    lei: { value: -2.5, type: "Adelantado", unit: "%" },
    oecdCli: { value: 99.5, type: "Adelantado", unit: "" },
    sp500: { value: -5.0, type: "Mercado", unit: "%" },
    corporateProfits: { value: 1.2, type: "Coincidente", unit: "%" },
    industrialProduction: { value: -1.0, type: "Coincidente", unit: "%" },
  };
  return data;
};

// Función para determinar la bandera de color según las reglas de la matriz
const getFlag = (indicator: string, value: number): FlagColor => {
  switch (indicator) {
    case "lei":
      if (value > 0) return "green";
      if (value >= -3.0) return "yellow";
      return "red";
    case "oecdCli":
      if (value >= 100) return "green";
      if (value >= 99) return "yellow";
      return "red";
    case "sp500":
      if (value > 0) return "green";
      if (value >= -10) return "yellow";
      return "red";
    case "corporateProfits":
    case "industrialProduction":
      if (value > 1.5) return "green";
      if (value >= 0) return "yellow";
      if (value < 0 && value >= -2) return "orange";
      return "red";
    default:
      return "red";
  }
};

// Lógica para determinar la fase del ciclo económico a partir de las banderas
const getOverallStatus = (flags: {
  lei: FlagColor;
  oecdCli: FlagColor;
  sp500: FlagColor;
  corporateProfits: FlagColor;
  industrialProduction: FlagColor;
}) => {
  const { lei, oecdCli, sp500, corporateProfits, industrialProduction } = flags;

  // Fase 1: Expansión (Todos Verdes)
  if (
    lei === "green" &&
    oecdCli === "green" &&
    sp500 === "green" &&
    corporateProfits === "green" &&
    industrialProduction === "green"
  ) {
    return "Expansión";
  }

  // Fase 2: Pico / Desaceleración (Adelantados y/o Mercado en amarillo)
  if (
    (lei === "yellow" || oecdCli === "yellow" || sp500 === "yellow") &&
    (corporateProfits === "green" || corporateProfits === "yellow") &&
    (industrialProduction === "green" || industrialProduction === "yellow")
  ) {
    return "Pico / Desaceleración";
  }

  // Fase 3: Contracción (La mayoría en rojo)
  if (
    (lei === "red" && oecdCli === "red") ||
    (corporateProfits === "red" && industrialProduction === "red")
  ) {
    return "Contracción";
  }

  // Fase 4: Suelo / Recuperación (Indicadores de mercado y adelantados mejoran, coincidentes aún débiles)
  if (
    (sp500 === "green" || sp500 === "yellow") &&
    (lei === "yellow" || oecdCli === "yellow") &&
    (corporateProfits === "orange" || industrialProduction === "orange")
  ) {
    return "Suelo / Recuperación";
  }

  // Diagnóstico por defecto si no coincide con los patrones anteriores
  return "No se puede determinar";
};

export default async function RecessionDashboard() {
  const data = await fetchEconomicData();

  const flags = {
    lei: getFlag("lei", data.lei.value),
    oecdCli: getFlag("oecdCli", data.oecdCli.value),
    sp500: getFlag("sp500", data.sp500.value),
    corporateProfits: getFlag("corporateProfits", data.corporateProfits.value),
    industrialProduction: getFlag(
      "industrialProduction",
      data.industrialProduction.value
    ),
  };

  const overallStatus = getOverallStatus(flags);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="container mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-white mb-2">
            Radar Económico
          </h1>
          <p className="text-lg text-gray-400">
            Análisis del ciclo económico para anticipar recesiones.
          </p>
        </header>

        {/* DASHBOARD DE INDICADORES PRIMERO */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center text-white">
            Dashboard de Indicadores
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <IndicatorCard
              name="Conference Board LEI"
              type="Adelantado"
              value={`${data.lei.value.toFixed(1)}${data.lei.unit}`}
              flag={flags.lei}
            />
            <IndicatorCard
              name="OECD CLI"
              type="Adelantado"
              value={`${data.oecdCli.value.toFixed(1)}${data.oecdCli.unit}`}
              flag={flags.oecdCli}
            />
            <IndicatorCard
              name="S&P 500"
              type="Mercado"
              value={`${data.sp500.value.toFixed(1)}${data.sp500.unit}`}
              flag={flags.sp500}
            />
            <IndicatorCard
              name="Beneficios Corporativos"
              type="Coincidente"
              value={`${data.corporateProfits.value.toFixed(1)}${
                data.corporateProfits.unit
              }`}
              flag={flags.corporateProfits}
            />
            <IndicatorCard
              name="Producción Industrial"
              type="Coincidente"
              value={`${data.industrialProduction.value.toFixed(1)}${
                data.industrialProduction.unit
              }`}
              flag={flags.industrialProduction}
            />
          </div>
        </section>

        <hr className="border-t border-gray-700 my-8" />

        {/* Sección principal con dos columnas: Radar Económico y Gráfico de Índices */}
        <section className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna izquierda: Radar Económico */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Radar Económico
            </h2>
            <p className="text-gray-400 mb-4">
              Análisis del ciclo económico para anticipar recesiones.
            </p>

            {/* USO CORRECTO DEL COMPONENTE OverallStatus */}
            <OverallStatus status={overallStatus} />

            <div className="bg-gray-700 p-4 rounded-md mt-4">
              <p className="text-gray-300">
                {overallStatus === "Suelo / Recuperación"
                  ? "La caída se ha obtenido. El mercado y los indicadores adelantados apuntan a una recuperación, aunque la economía real aún se muestra débil."
                  : overallStatus === "Expansión"
                  ? "La economía está en fase de crecimiento, con todos los indicadores mostrando señales positivas."
                  : overallStatus === "Pico / Desaceleración"
                  ? "Algunos indicadores adelantados comienzan a mostrar señales de desaceleración, aunque la economía aún se mantiene positiva."
                  : overallStatus === "Contracción"
                  ? "La mayoría de indicadores muestran señales negativas, indicando una posible recesión económica."
                  : "El estado actual de la economía no puede determinarse con claridad con los datos disponibles."}
              </p>
            </div>
          </div>

          {/* Columna derecha: Gráfico de Rendimiento de Índices */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Rendimiento de los Principales Índices de EE.UU.
            </h2>
            <p className="text-gray-400 mb-4">
              Comparación del S&P 500, Nasdaq y Dow Jones (normalizado para la
              comparación de tendencias).
            </p>
            <MarketIndexChart />
          </div>
        </section>

        <hr className="border-t border-gray-700 my-8" />

        {/* Sección de Gráficos Principales en un diseño de cuadrícula de 2 columnas */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center text-white">
            Análisis Gráfico Detallado
          </h2>

          {/* Primera fila: LEI vs. Tasa de Desempleo e Indicador de Sahm en columnas horizontales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Gráfico 1: LEI vs. Tasa de Desempleo */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-center text-white">
                LEI vs. Tasa de Desempleo (Histórico)
              </h3>
              <RecessionChart />
            </div>

            {/* Gráfico 2: Indicador de la Regla de Sahm */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-center text-white">
                Indicador de la Regla de Sahm
              </h3>
              <p className="text-center text-gray-400 mb-4">
                Una señal de recesión se activa cuando el valor supera 0.5.
              </p>
              <SahmChart />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
