"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";

// Definición de tipos para los datos de la tabla
interface MacroEconomicData {
  category: string;
  variable: string;
  // Datos para EE. UU.
  usActualValue: number | string | null;
  usForecastValue: number | null | undefined;
  usUnit: string;
  usSource: string;
  usScore: number | null; // Puntuación del impacto en USD
  // Datos para Japón
  jpActualValue: number | string | null;
  jpForecastValue: number | null | undefined;
  jpUnit: string;
  jpSource: string;
  jpScore: number | null; // Puntuación del impacto en JPY
  // Sesgo combinado para el par USDJPY
  pairBias: number | null;
}

// Interfaz para la respuesta esperada de la API /api/scrape-cot-data
interface PositionData {
  long: number;
  longChange: number;
  short: number;
  shortChange: number;
}

interface OpenInterestData {
  value: number;
  changePercent: number;
}

interface AssetData {
  assetName: string;
  priceChange: number;
  largeSpeculators: PositionData;
  smallTraders: PositionData;
  openInterest: OpenInterestData;
}

interface CategoryData {
  [category: string]: AssetData[];
}

interface CotApiResponse {
  reportDate: string; // Nueva propiedad para la fecha del reporte
  data: CategoryData;
  error?: string;
}

// Interfaz para la respuesta de fetchData
interface ScrapedData {
  variable: string;
  actualValue: number | null;
  forecastValue: number | null | undefined;
}

// Props para el componente TableRow
interface TableRowProps {
  data: MacroEconomicData;
  dailyChartManualInput: "Alcista" | "Neutro" | "Bajista" | null;
  setDailyChartManualInput: React.Dispatch<
    React.SetStateAction<"Alcista" | "Neutro" | "Bajista" | null>
  >;
  onManualInputChange: (score: number) => void;
  isFirstInCategory: boolean;
  rowSpan: number;
}

// Interfaz para los datos de posición del COT para un país
interface CotCountryData {
  largeLongs: number | null;
  largeShorts: number | null;
  smallLongs: number | null;
  smallShorts: number | null;
}

// Componente para el tooltip con dirección personalizable
const Tooltip: React.FC<{
  content: string;
  children: React.ReactNode;
  direction?: "top" | "bottom";
}> = ({ content, children, direction = "top" }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        className="cursor-help border-b border-dotted border-gray-400"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={`absolute z-50 left-1/2 transform -translate-x-1/2 ${
            direction === "top" ? "bottom-full mb-2" : "top-full mt-2"
          } w-72 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl`}
        >
          {content}
          <div
            className={`absolute left-1/2 transform -translate-x-1/2 ${
              direction === "top" ? "-bottom-1 rotate-45" : "-top-1 rotate-45"
            } w-4 h-4 bg-gray-900`}
          ></div>
        </div>
      )}
    </div>
  );
};

// Componente para una fila de la tabla
const TableRow: React.FC<TableRowProps> = ({
  data,
  dailyChartManualInput,
  setDailyChartManualInput,
  onManualInputChange,
  isFirstInCategory,
  rowSpan,
}) => {
  // Determina el color de la puntuación individual de EE. UU.
  const usScoreColorClass = useMemo(() => {
    if (data.usScore === 1)
      return "bg-green-100 text-green-800 border border-green-200";
    if (data.usScore === -1)
      return "bg-red-100 text-red-800 border border-red-200";
    return "bg-gray-100 text-gray-800 border border-gray-200";
  }, [data.usScore]);

  // Determina el color de la puntuación individual de Japón
  const jpScoreColorClass = useMemo(() => {
    if (data.jpScore === 1)
      return "bg-green-100 text-green-800 border border-green-200";
    if (data.jpScore === -1)
      return "bg-red-100 text-red-800 border border-red-200";
    return "bg-gray-100 text-gray-800 border border-gray-200";
  }, [data.jpScore]);

  // Determina el color del sesgo del par
  const pairBiasColorClass = useMemo(() => {
    if (data.pairBias === 1)
      return "bg-green-100 text-green-800 border border-green-200";
    if (data.pairBias === -1)
      return "bg-red-100 text-red-800 border border-red-200";
    return "bg-gray-100 text-gray-800 border border-gray-200";
  }, [data.pairBias]);

  // Descripciones para cada variable
  const variableDescriptions: Record<string, string> = {
    "Crecimiento del PIB":
      "Mide el cambio en el valor de todos los bienes y servicios producidos en la economía. Un crecimiento fuerte del PIB de EE.UU. fortalece el USD, y un crecimiento fuerte del PIB de Japón fortalece el JPY.",
    "PMI Manufacturero":
      "Índice de Gerentes de Compras para el sector manufacturero. Valores por encima de 50 indican expansión económica. Un PMI fuerte de EE.UU. beneficia al USD; uno fuerte de Japón beneficia al JPY.",
    "PMI de Servicios":
      "Índice de Gerentes de Compras para el sector servicios, el más grande en ambas economías. Un valor alto fortalece la moneda correspondiente.",
    "Ventas Minoristas":
      "Mide el gasto de los consumidores. Un aumento sugiere confianza, lo que apoya la moneda local. Un valor mejor de lo esperado en EE.UU. fortalece el USD; en Japón, fortalece el JPY.",
    Inflación:
      "Un aumento de precios. Si la inflación de EE.UU. es mayor a la esperada, podría llevar a una subida de tasas de interés de la Fed, fortaleciendo el USD. Si la inflación de Japón es mayor a la esperada, puede fortalecer el JPY.",
    "Tasa de Desempleo":
      "Porcentaje de la fuerza laboral desempleada. Una tasa de desempleo baja (mejor a lo esperado) sugiere una economía fuerte, lo que fortalece la moneda. Una tasa alta (peor a lo esperado) debilita la moneda.",
    "Tasa de Interés":
      "Tasa establecida por los bancos centrales. Una subida de la Fed fortalece el USD. Un cambio en la tasa de interés del Banco de Japón fortalece el JPY.",
    "Sentimiento COT":
      "Posicionamiento de los grandes especuladores en futuros de USD y JPY. Un valor positivo alto en USD sugiere expectativas alcistas en el dólar, y en JPY sugiere expectativas alcistas en el yen.",
    "Sentimiento Retail":
      "Posicionamiento de pequeños traders en futuros de USD y JPY. Suele ser un indicador contrario: cuando los pequeños traders son muy alcistas, puede ser señal de un mercado sobrecomprado, por lo que se considera un factor bajista para la moneda.",
    Estacionalidad:
      "Tendencia histórica del par USDJPY durante el mes actual. Basado en datos de los últimos años. Un valor positivo sugiere que el par históricamente sube en este mes.",
    "Gráfica Diaria":
      "Si el precio actual en gráfica de 1 día está arriba de la EMA de 20, 50 y 200 entonces es tendencia alcista. Si está el precio en medio de las EMAs es tendencia neutra. Si el precio actual está por debajo de las 3 EMAs es tendencia bajista.",
  };

  // Determinar la dirección del tooltip según la variable
  const getTooltipDirection = (variable: string) => {
    if (
      variable === "Crecimiento del PIB" ||
      variable === "PMI Manufacturero"
    ) {
      return "bottom";
    }
    return "top";
  };

  const isTechnicalRow =
    data.variable === "Estacionalidad" || data.variable === "Gráfica Diaria";

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200">
      {isFirstInCategory && (
        <td
          className="py-3 px-4 text-sm font-medium text-gray-900 text-center align-top"
          rowSpan={rowSpan}
        >
          {data.category}
        </td>
      )}
      <td className="py-3 px-4 text-sm text-gray-700">
        <Tooltip
          content={
            variableDescriptions[data.variable] || "Información no disponible"
          }
          direction={getTooltipDirection(data.variable)}
        >
          {data.variable}
        </Tooltip>
      </td>

      {/* Columnas para datos no técnicos */}
      {!isTechnicalRow && (
        <>
          <td className="py-3 px-4 text-sm text-gray-700">
            {data.usActualValue !== null ? (
              `${data.usActualValue}${data.usUnit}`
            ) : (
              <span className="text-gray-400">Cargando...</span>
            )}
          </td>
          <td className="py-3 px-4 text-sm text-gray-700">
            {data.usForecastValue !== null && data.usForecastValue !== undefined
              ? `${data.usForecastValue}${data.usUnit}`
              : "N/A"}
          </td>
          <td
            className={`py-3 px-4 text-sm font-bold text-center rounded-md ${usScoreColorClass}`}
          >
            {data.usScore !== null ? data.usScore : "-"}
          </td>
          <td className="py-3 px-4 text-sm text-blue-600 hover:text-blue-800 transition-colors">
            <a
              href={data.usSource}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <span>Fuente</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </td>
          <td className="py-3 px-4 text-sm text-gray-700">
            {data.jpActualValue !== null ? (
              `${data.jpActualValue}${data.jpUnit}`
            ) : (
              <span className="text-gray-400">Cargando...</span>
            )}
          </td>
          <td className="py-3 px-4 text-sm text-gray-700">
            {data.jpForecastValue !== null && data.jpForecastValue !== undefined
              ? `${data.jpForecastValue}${data.jpUnit}`
              : "N/A"}
          </td>
          <td
            className={`py-3 px-4 text-sm font-bold text-center rounded-md ${jpScoreColorClass}`}
          >
            {data.jpScore !== null ? data.jpScore : "-"}
          </td>
          <td className="py-3 px-4 text-sm text-blue-600 hover:text-blue-800 transition-colors">
            <a
              href={data.jpSource}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <span>Fuente</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </td>
        </>
      )}

      {/* Columnas especiales para datos técnicos */}
      {isTechnicalRow && (
        <>
          {/*
           * Celda para el valor del dato técnico que abarca todas las columnas de EEUU y Previsión de Japón,
           * incluyendo el espacio de las puntuaciones que se eliminaron. Se añade la clase text-center para centrar el contenido.
           */}
          <td
            className="py-3 px-4 text-sm text-gray-700 text-center"
            colSpan={7}
          >
            {data.variable === "Estacionalidad" ? (
              data.usActualValue !== null ? (
                `${data.usActualValue}${data.usUnit}`
              ) : (
                <span className="text-gray-400">Cargando...</span>
              )
            ) : data.variable === "Gráfica Diaria" ? (
              <select
                id="dailyChartSentiment"
                className="p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-full md:w-auto bg-white shadow-sm"
                value={dailyChartManualInput || ""}
                onChange={(e) => {
                  const newValue = e.target.value as
                    | "Alcista"
                    | "Neutro"
                    | "Bajista";
                  setDailyChartManualInput(newValue);
                  const newScore =
                    newValue === "Alcista"
                      ? 1
                      : newValue === "Bajista"
                      ? -1
                      : 0;
                  onManualInputChange(newScore);
                }}
              >
                <option value="" disabled>
                  Selecciona...
                </option>
                <option value="Alcista">Alcista</option>
                <option value="Neutro">Neutro</option>
                <option value="Bajista">Bajista</option>
              </select>
            ) : null}
          </td>
          {/* Celda para la fuente, ahora alineada con la columna de fuente de Japón */}
          <td className="py-3 px-4 text-sm text-blue-600 hover:text-blue-800 transition-colors">
            <a
              href={data.usSource}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <span>Fuente</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </td>
        </>
      )}

      {/* Columna de Sesgo del Par. Asegura que siempre esté presente y alineada */}
      <td
        className={`py-3 px-4 text-sm font-bold text-center rounded-md ${pairBiasColorClass}`}
      >
        {data.pairBias !== null ? data.pairBias : "-"}
      </td>
    </tr>
  );
};

// Componente principal de la tabla de sentimiento USDJPY
const USDJPYSentimentTable: React.FC = () => {
  // Datos de estacionalidad hardcodeados para el par USDJPY
  const seasonalityData = useMemo(
    () => ({
      usdjpy: {
        Jan: -0.4,
        Feb: 0.6,
        Mar: 0.9,
        Apr: 0.3,
        May: 0.4,
        Jun: 0.5,
        Jul: -1.2,
        Aug: -0.1,
        Sep: 0.5,
        Oct: 0.7,
        Nov: 0.4,
        Dec: 0.1,
      },
    }),
    []
  );

  // Función para obtener el valor de estacionalidad del mes actual para el par USDJPY
  const getSeasonalityForCurrentMonth = useCallback(() => {
    const currentMonth = new Date().toLocaleString("en-us", { month: "short" });
    const monthKey =
      currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);
    return (
      seasonalityData.usdjpy?.[
        monthKey as keyof typeof seasonalityData.usdjpy
      ] || 0
    );
  }, [seasonalityData]);

  // Definición de los datos iniciales de la tabla.
  const initialMacroEconomicData: MacroEconomicData[] = useMemo(
    () => [
      {
        category: "MACROECONÓMICOS",
        variable: "Crecimiento del PIB",
        usActualValue: null,
        usForecastValue: null,
        usUnit: "%",
        usSource: "https://tradingeconomics.com/united-states/gdp-growth",
        usScore: null,
        jpActualValue: null,
        jpForecastValue: null,
        jpUnit: "%",
        jpSource: "https://tradingeconomics.com/japan/gdp-growth",
        jpScore: null,
        pairBias: null,
      },
      {
        category: "MACROECONÓMICOS",
        variable: "PMI Manufacturero",
        usActualValue: null,
        usForecastValue: null,
        usUnit: "",
        usSource:
          "https://tradingeconomics.com/united-states/manufacturing-pmi",
        usScore: null,
        jpActualValue: null,
        jpForecastValue: null,
        jpUnit: "",
        jpSource: "https://tradingeconomics.com/japan/manufacturing-pmi",
        jpScore: null,
        pairBias: null,
      },
      {
        category: "MACROECONÓMICOS",
        variable: "PMI de Servicios",
        usActualValue: null,
        usForecastValue: null,
        usUnit: "",
        usSource: "https://tradingeconomics.com/united-states/services-pmi",
        usScore: null,
        jpActualValue: null,
        jpForecastValue: null,
        jpUnit: "",
        jpSource: "https://tradingeconomics.com/japan/services-pmi",
        jpScore: null,
        pairBias: null,
      },
      {
        category: "MACROECONÓMICOS",
        variable: "Ventas Minoristas",
        usActualValue: null,
        usForecastValue: null,
        usUnit: "%",
        usSource: "https://tradingeconomics.com/united-states/retail-sales",
        usScore: null,
        jpActualValue: null,
        jpForecastValue: null,
        jpUnit: "%",
        jpSource: "https://tradingeconomics.com/japan/retail-sales",
        jpScore: null,
        pairBias: null,
      },
      {
        category: "MACROECONÓMICOS",
        variable: "Inflación",
        usActualValue: null,
        usForecastValue: null,
        usUnit: "%",
        usSource: "https://tradingeconomics.com/united-states/inflation-cpi",
        usScore: null,
        jpActualValue: null,
        jpForecastValue: null,
        jpUnit: "%",
        jpSource: "https://tradingeconomics.com/japan/inflation-cpi",
        jpScore: null,
        pairBias: null,
      },
      {
        category: "MACROECONÓMICOS",
        variable: "Tasa de Desempleo",
        usActualValue: null,
        usForecastValue: null,
        usUnit: "%",
        usSource:
          "https://tradingeconomics.com/united-states/unemployment-rate",
        usScore: null,
        jpActualValue: null,
        jpForecastValue: null,
        jpUnit: "%",
        jpSource: "https://tradingeconomics.com/japan/unemployment-rate",
        jpScore: null,
        pairBias: null,
      },
      {
        category: "MACROECONÓMICOS",
        variable: "Tasa de Interés",
        usActualValue: null,
        usForecastValue: null,
        usUnit: "%",
        usSource: "https://tradingeconomics.com/united-states/interest-rate",
        usScore: null,
        jpActualValue: null,
        jpForecastValue: null,
        jpUnit: "%",
        jpSource: "https://tradingeconomics.com/japan/interest-rate",
        jpScore: null,
        pairBias: null,
      },
      // Datos de Sentimiento
      {
        category: "SENTIMIENTO",
        variable: "Sentimiento COT",
        usActualValue: null,
        usForecastValue: undefined,
        usUnit: "%",
        usSource: "https://www.insider-week.com/",
        usScore: null,
        jpActualValue: null,
        jpForecastValue: undefined,
        jpUnit: "%",
        jpSource: "https://www.insider-week.com/",
        jpScore: null,
        pairBias: null,
      },
      {
        category: "SENTIMIENTO",
        variable: "Sentimiento Retail",
        usActualValue: null,
        usForecastValue: undefined,
        usUnit: "%",
        usSource: "https://www.forex.com/en-us/markets/sentiment/",
        usScore: null,
        jpActualValue: null,
        jpForecastValue: undefined,
        jpUnit: "%",
        jpSource: "https://www.forex.com/en-us/markets/sentiment/",
        jpScore: null,
        pairBias: null,
      },
      // Datos Técnicos
      {
        category: "TÉCNICOS",
        variable: "Estacionalidad",
        usActualValue: null,
        usForecastValue: undefined,
        usUnit: "%",
        usSource: "https://www.investing.com/technical/forex-seasonality",
        usScore: null,
        jpActualValue: null,
        jpForecastValue: undefined,
        jpUnit: "%",
        jpSource: "https://www.investing.com/technical/forex-seasonality",
        jpScore: null,
        pairBias: null,
      },
      {
        category: "TÉCNICOS",
        variable: "Gráfica Diaria",
        usActualValue: null,
        usForecastValue: undefined,
        usUnit: "",
        usSource: "https://tradingview.com/",
        usScore: null,
        jpActualValue: null,
        jpForecastValue: undefined,
        jpUnit: "",
        jpSource: "https://tradingview.com/",
        jpScore: null,
        pairBias: null,
      },
    ],
    []
  );

  const [macroEconomicData, setMacroEconomicData] = useState<
    MacroEconomicData[]
  >(initialMacroEconomicData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyChartManualInput, setDailyChartManualInput] = useState<
    "Alcista" | "Neutro" | "Bajista" | null
  >(null);

  // Función para calcular la puntuación individual de un dato (1, 0, -1)
  const calculateIndividualScore = useCallback(
    (
      actual: number | string | null,
      forecast: number | null | undefined,
      variableName: string,
      country: "US" | "JP"
    ): number => {
      if (actual === null) return 0;

      // Lógica especial para Sentimiento COT
      if (variableName === "Sentimiento COT") {
        if (typeof actual !== "number") return 0;
        if (actual > 10) return 1;
        if (actual < -10) return -1;
        return 0;
      }

      // Lógica especial para Sentimiento Retail (contrario al índice)
      if (variableName === "Sentimiento Retail") {
        if (typeof actual !== "number") return 0;
        if (actual < -10) return 1;
        if (actual > 10) return -1;
        return 0;
      }

      // Lógica especial para Estacionalidad
      if (variableName.includes("Estacionalidad")) {
        if (typeof actual !== "number") return 0;
        if (actual > 0) return 1;
        if (actual < 0) return -1;
        return 0;
      }

      // Lógica especial para Gráfica Diaria (entrada manual)
      if (variableName === "Gráfica Diaria") {
        if (typeof actual !== "number") return 0;
        return actual;
      }

      // Para variables que requieren comparación actual vs. forecast
      if (typeof actual !== "number" || typeof forecast !== "number") return 0;

      // Lógica para Inflación, Tasa de Interés y Tasa de Desempleo (Inversa para JPY)
      const isNegativeForUS =
        variableName === "Inflación" ||
        variableName === "Tasa de Interés" ||
        variableName === "Tasa de Desempleo";
      const isNegativeForJP =
        variableName === "Inflación" ||
        variableName === "Tasa de Interés" ||
        variableName === "Tasa de Desempleo";

      if (actual > forecast) {
        if (isNegativeForUS && country === "US") return -1;
        if (isNegativeForJP && country === "JP") return 1;
        return 1;
      } else if (actual < forecast) {
        if (isNegativeForUS && country === "US") return 1;
        if (isNegativeForJP && country === "JP") return -1;
        return -1;
      } else {
        return 0;
      }
    },
    []
  );

  // Función para calcular el sesgo del par USDJPY
  const calculatePairBias = useCallback(
    (usScore: number | null, jpScore: number | null): number | null => {
      if (usScore === null || jpScore === null) return null;

      // Un factor alcista para USD y bajista para JPY (o viceversa) resulta en un sesgo fuerte para el par
      if (usScore === 1 && jpScore === -1) return 1;
      if (usScore === -1 && jpScore === 1) return -1;

      // Factores con el mismo sesgo se anulan o se potencian
      if (usScore === 1 && jpScore === 1) return 0;
      if (usScore === -1 && jpScore === -1) return 0;

      // Un factor neutral con un factor alcista/bajista toma el sesgo del factor fuerte
      if (usScore === 0) return jpScore * -1; // JP score invertido
      if (jpScore === 0) return usScore;

      return 0;
    },
    []
  );

  // Función para cargar los datos de una API Route específica
  const fetchData = useCallback(
    async (
      apiPath: string,
      variableName: string
    ): Promise<ScrapedData | null> => {
      try {
        const urlToFetch = new URL(apiPath, window.location.origin).toString();
        const response = await fetch(urlToFetch);

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(
            `La API '${apiPath}' no devolvió JSON. Content-Type: ${contentType}. Respuesta: ${text.substring(
              0,
              100
            )}...`
          );
        }

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage =
            typeof errorData.error === "string"
              ? errorData.error
              : `Error desconocido al obtener datos de ${variableName}`;
          throw new Error(errorMessage);
        }
        const data = await response.json();
        return {
          variable: variableName,
          actualValue: data.actualValue,
          forecastValue: data.forecastValue,
        };
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Error fetching ${variableName} data:`, errorMessage);
        setError((prev) => (prev ? `${prev}\n${errorMessage}` : errorMessage));
        return null;
      }
    },
    []
  );

  // Función para cargar datos COT
  const fetchCotData = useCallback(async (): Promise<{
    us: CotCountryData;
    jp: CotCountryData;
  } | null> => {
    try {
      const urlToFetch = new URL(
        "/api/scrape-cot-data",
        window.location.origin
      ).toString();
      const response = await fetch(urlToFetch);

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(
          `La API '/api/scrape-cot-data' no devolvió JSON. Content-Type: ${contentType}. Respuesta: ${text.substring(
            0,
            100
          )}...`
        );
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener datos COT");
      }
      const apiData: CotApiResponse = await response.json();
      console.log("Respuesta completa de la API COT:", apiData);

      let usLargeSpeculatorsLongs: number | null = null;
      let usLargeSpeculatorsShorts: number | null = null;
      let usSmallTradersLongs: number | null = null;
      let usSmallTradersShorts: number | null = null;
      let jpLargeSpeculatorsLongs: number | null = null;
      let jpLargeSpeculatorsShorts: number | null = null;
      let jpSmallTradersLongs: number | null = null;
      let jpSmallTradersShorts: number | null = null;

      for (const category in apiData.data) {
        if (Object.prototype.hasOwnProperty.call(apiData.data, category)) {
          for (const asset of apiData.data[category]) {
            const normalizedAssetName = asset.assetName.trim().toUpperCase();
            console.log(
              `Verificando activo: '${asset.assetName}' (Normalizado: '${normalizedAssetName}')`
            );

            if (normalizedAssetName.includes("DOLLAR INDEX")) {
              usLargeSpeculatorsLongs = asset.largeSpeculators.long;
              usLargeSpeculatorsShorts = asset.largeSpeculators.short;
              usSmallTradersLongs = asset.smallTraders.long;
              usSmallTradersShorts = asset.smallTraders.short;
              console.log(
                `USD COT - Nombre de activo encontrado: '${asset.assetName}', Large Longs: ${usLargeSpeculatorsLongs}, Large Shorts: ${usLargeSpeculatorsShorts}, Small Longs: ${usSmallTradersLongs}, Small Shorts: ${usSmallTradersShorts}`
              );
            } else if (normalizedAssetName.includes("JAPANESE YEN")) {
              jpLargeSpeculatorsLongs = asset.largeSpeculators.long;
              jpLargeSpeculatorsShorts = asset.largeSpeculators.short;
              jpSmallTradersLongs = asset.smallTraders.long;
              jpSmallTradersShorts = asset.smallTraders.short;
              console.log(
                `JPY COT - Nombre de activo encontrado: '${asset.assetName}', Large Longs: ${jpLargeSpeculatorsLongs}, Large Shorts: ${jpLargeSpeculatorsShorts}, Small Longs: ${jpSmallTradersLongs}, Small Shorts: ${jpSmallTradersShorts}`
              );
            }
            if (
              usLargeSpeculatorsLongs !== null &&
              usLargeSpeculatorsShorts !== null &&
              jpLargeSpeculatorsLongs !== null &&
              jpLargeSpeculatorsShorts !== null &&
              usSmallTradersLongs !== null &&
              usSmallTradersShorts !== null &&
              jpSmallTradersLongs !== null &&
              jpSmallTradersShorts !== null
            ) {
              break;
            }
          }
        }
        if (
          usLargeSpeculatorsLongs !== null &&
          usLargeSpeculatorsShorts !== null &&
          jpLargeSpeculatorsLongs !== null &&
          jpLargeSpeculatorsShorts !== null &&
          usSmallTradersLongs !== null &&
          usSmallTradersShorts !== null &&
          jpSmallTradersLongs !== null &&
          jpSmallTradersShorts !== null
        ) {
          break;
        }
      }

      if (
        usLargeSpeculatorsLongs === null ||
        usLargeSpeculatorsShorts === null
      ) {
        console.warn(
          "Advertencia: No se encontraron los datos de Large Speculators Longs/Shorts para 'DOLLAR INDEX' en la respuesta de la API COT."
        );
      }
      if (usSmallTradersLongs === null || usSmallTradersShorts === null) {
        console.warn(
          "Advertencia: No se encontraron los datos de Small Traders Longs/Shorts para 'DOLLAR INDEX' en la respuesta de la API COT."
        );
      }

      return {
        us: {
          largeLongs: usLargeSpeculatorsLongs,
          largeShorts: usLargeSpeculatorsShorts,
          smallLongs: usSmallTradersLongs,
          smallShorts: usSmallTradersShorts,
        },
        jp: {
          largeLongs: jpLargeSpeculatorsLongs,
          largeShorts: jpLargeSpeculatorsShorts,
          smallLongs: jpSmallTradersLongs,
          smallShorts: jpSmallTradersShorts,
        },
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Error fetching COT data:`, errorMessage);
      setError((prev) => (prev ? `${prev}\n${errorMessage}` : errorMessage));
      return null;
    }
  }, []);

  // Función para manejar el cambio manual en la Gráfica Diaria
  const handleDailyChartManualInputChange = useCallback((newScore: number) => {
    setMacroEconomicData((prevData) => {
      return prevData.map((item) => {
        if (item.variable === "Gráfica Diaria") {
          const pairBias = newScore;
          return {
            ...item,
            usActualValue: newScore,
            usScore: newScore,
            jpScore: 0, // Se mantiene en 0
            pairBias,
          };
        }
        return item;
      });
    });
  }, []);

  // Efecto para cargar todos los datos al montar el componente
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      setError(null);

      const currentDataMap = new Map(
        initialMacroEconomicData.map((item) => [item.variable, { ...item }])
      );

      // Definir todas las llamadas a la API para datos macroeconómicos
      const apiCallsUS = [
        { path: "/api/scrape-gdp", name: "Crecimiento del PIB" },
        { path: "/api/scrape-pmi-manufacturing", name: "PMI Manufacturero" },
        { path: "/api/scrape-pmi-services", name: "PMI de Servicios" },
        { path: "/api/scrape-retail-sales", name: "Ventas Minoristas" },
        { path: "/api/scrape-inflation", name: "Inflación" },
        { path: "/api/scrape-unemployment-rate", name: "Tasa de Desempleo" },
        { path: "/api/scrape-interest-rate", name: "Tasa de Interés" },
      ];

      const apiCallsJP = [
        { path: "/api/scrape-gdp-japan", name: "Crecimiento del PIB" },
        {
          path: "/api/scrape-pmi-manufacturing-japan",
          name: "PMI Manufacturero",
        },
        { path: "/api/scrape-pmi-services-japan", name: "PMI de Servicios" },
        { path: "/api/scrape-retail-sales-japan", name: "Ventas Minoristas" },
        { path: "/api/scrape-inflation-japan", name: "Inflación" },
        {
          path: "/api/scrape-unemployment-rate-japan",
          name: "Tasa de Desempleo",
        },
        { path: "/api/scrape-interest-rate-japan", name: "Tasa de Interés" },
      ];

      // Ejecutar todas las llamadas a la API en paralelo
      const [resultsUS, resultsJP] = await Promise.allSettled([
        Promise.all(apiCallsUS.map((call) => fetchData(call.path, call.name))),
        Promise.all(apiCallsJP.map((call) => fetchData(call.path, call.name))),
      ]);

      // Procesar resultados de EE. UU.
      if (resultsUS.status === "fulfilled") {
        resultsUS.value.forEach((result: ScrapedData | null) => {
          if (result) {
            const { variable, actualValue, forecastValue } = result;
            if (currentDataMap.has(variable)) {
              currentDataMap.set(variable, {
                ...currentDataMap.get(variable)!,
                usActualValue: actualValue,
                usForecastValue: forecastValue,
              });
            }
          }
        });
      }

      // Procesar resultados de Japón
      if (resultsJP.status === "fulfilled") {
        resultsJP.value.forEach((result: ScrapedData | null) => {
          if (result) {
            const { variable, actualValue, forecastValue } = result;
            if (currentDataMap.has(variable)) {
              currentDataMap.set(variable, {
                ...currentDataMap.get(variable)!,
                jpActualValue: actualValue,
                jpForecastValue: forecastValue,
              });
            }
          }
        });
      }

      // Obtener y calcular el Sentimiento COT y Sentimiento Retail
      const cotDataResult = await fetchCotData();
      if (cotDataResult && cotDataResult.us && cotDataResult.jp) {
        // Calcular Sentimiento COT (Large Speculators)
        let usCotSentiment: number | null = null;
        if (
          cotDataResult.us.largeLongs !== null &&
          cotDataResult.us.largeShorts !== null
        ) {
          const sum =
            cotDataResult.us.largeLongs + cotDataResult.us.largeShorts;
          if (sum !== 0) {
            usCotSentiment =
              ((cotDataResult.us.largeLongs - cotDataResult.us.largeShorts) /
                sum) *
              100;
          }
        }
        let jpCotSentiment: number | null = null;
        if (
          cotDataResult.jp.largeLongs !== null &&
          cotDataResult.jp.largeShorts !== null
        ) {
          const sum =
            cotDataResult.jp.largeLongs + cotDataResult.jp.largeShorts;
          if (sum !== 0) {
            jpCotSentiment =
              ((cotDataResult.jp.largeLongs - cotDataResult.jp.largeShorts) /
                sum) *
              100;
          }
        }
        if (currentDataMap.has("Sentimiento COT")) {
          currentDataMap.set("Sentimiento COT", {
            ...currentDataMap.get("Sentimiento COT")!,
            usActualValue:
              usCotSentiment !== null
                ? parseFloat(usCotSentiment.toFixed(2))
                : null,
            jpActualValue:
              jpCotSentiment !== null
                ? parseFloat(jpCotSentiment.toFixed(2))
                : null,
          });
        }

        // Calcular Sentimiento Retail (Small Traders)
        let usRetailSentiment: number | null = null;
        if (
          cotDataResult.us.smallLongs !== null &&
          cotDataResult.us.smallShorts !== null
        ) {
          const sum =
            cotDataResult.us.smallLongs + cotDataResult.us.smallShorts;
          if (sum !== 0) {
            usRetailSentiment =
              ((cotDataResult.us.smallLongs - cotDataResult.us.smallShorts) /
                sum) *
              100;
          }
        }
        let jpRetailSentiment: number | null = null;
        if (
          cotDataResult.jp.smallLongs !== null &&
          cotDataResult.jp.smallShorts !== null
        ) {
          const sum =
            cotDataResult.jp.smallLongs + cotDataResult.jp.smallShorts;
          if (sum !== 0) {
            jpRetailSentiment =
              ((cotDataResult.jp.smallLongs - cotDataResult.jp.smallShorts) /
                sum) *
              100;
          }
        }
        if (currentDataMap.has("Sentimiento Retail")) {
          currentDataMap.set("Sentimiento Retail", {
            ...currentDataMap.get("Sentimiento Retail")!,
            usActualValue:
              usRetailSentiment !== null
                ? parseFloat(usRetailSentiment.toFixed(2))
                : null,
            jpActualValue:
              jpRetailSentiment !== null
                ? parseFloat(jpRetailSentiment.toFixed(2))
                : null,
          });
        }
      }

      // Actualizar los valores hardcodeados
      if (currentDataMap.has("Estacionalidad")) {
        const usdjpySeasonality = getSeasonalityForCurrentMonth();
        currentDataMap.set("Estacionalidad", {
          ...currentDataMap.get("Estacionalidad")!,
          usActualValue: usdjpySeasonality,
          jpActualValue: usdjpySeasonality, // Se usa el mismo valor para ambos lados para el cálculo
        });
      }

      // Aplicar las puntuaciones y sesgos finales
      const finalData = Array.from(currentDataMap.values()).map((item) => {
        const usScore = calculateIndividualScore(
          item.usActualValue,
          item.usForecastValue,
          item.variable,
          "US"
        );
        const jpScore = calculateIndividualScore(
          item.jpActualValue,
          item.jpForecastValue,
          item.variable,
          "JP"
        );

        // Lógica especial para el cálculo del pairBias en filas técnicas
        let pairBias: number | null;
        if (item.variable === "Estacionalidad") {
          pairBias = usScore; // El sesgo del par es el mismo que la puntuación individual de la estacionalidad
        } else if (item.variable === "Gráfica Diaria") {
          pairBias = usScore; // El sesgo del par es el mismo que la puntuación de la entrada manual
        } else {
          pairBias = calculatePairBias(usScore, jpScore);
        }

        return { ...item, usScore, jpScore, pairBias };
      });

      // Asegurar que el pairBias de Gráfica Diaria se mantenga con la entrada manual
      const finalDataWithManualInput = finalData.map((item) => {
        if (item.variable === "Gráfica Diaria") {
          const manualScore =
            dailyChartManualInput === "Alcista"
              ? 1
              : dailyChartManualInput === "Bajista"
              ? -1
              : 0;
          return {
            ...item,
            usActualValue: dailyChartManualInput,
            pairBias: manualScore,
            usScore: manualScore,
            jpScore: 0, // Sincroniza el score de Japón
          };
        }
        return item;
      });

      setMacroEconomicData(finalDataWithManualInput);
      setIsLoading(false);
    };

    loadAllData();
  }, [
    fetchData,
    fetchCotData,
    initialMacroEconomicData,
    getSeasonalityForCurrentMonth,
    dailyChartManualInput,
    calculateIndividualScore,
    calculatePairBias,
    handleDailyChartManualInputChange,
  ]);

  // Calcula el total de la puntuación del par
  const totalPairBiasScore = useMemo(() => {
    return macroEconomicData.reduce((sum, data) => {
      // Excluimos las filas que no tienen un sesgo de par relevante (Estacionalidad, Gráfica Diaria)
      if (
        data.variable === "Estacionalidad" ||
        data.variable === "Gráfica Diaria"
      ) {
        return sum + (data.pairBias !== null ? data.pairBias : 0);
      } else {
        return sum + (data.pairBias !== null ? data.pairBias : 0);
      }
    }, 0);
  }, [macroEconomicData]);

  // Determina el sesgo general basado en la puntuación total del par
  const bias = useMemo(() => {
    // Primero verificamos el rango del total
    if (totalPairBiasScore > 3) {
      return "Alcista";
    } else if (totalPairBiasScore < -3) {
      return "Bajista";
    } else {
      return "Neutro";
    }
  }, [totalPairBiasScore]);

  // Determina el color basado en el valor numérico del total
  const totalScoreColorClass = useMemo(() => {
    if (totalPairBiasScore > 3) return "text-green-600";
    if (totalPairBiasScore < -3) return "text-red-600";
    return "text-yellow-600";
  }, [totalPairBiasScore]);

  // Genera el análisis del sesgo de forma profesional
  const generateProfessionalAnalysis = useCallback(() => {
    const positiveFactors: string[] = [];
    const negativeFactors: string[] = [];
    const neutralFactors: string[] = [];

    macroEconomicData.forEach((item) => {
      if (item.pairBias === 1) {
        positiveFactors.push(item.variable);
      } else if (item.pairBias === -1) {
        negativeFactors.push(item.variable);
      } else {
        neutralFactors.push(item.variable);
      }
    });

    let analysisText = "";
    let actionMessage = "";
    let emoji = "";

    if (bias === "Alcista") {
      emoji = "📈";
      actionMessage =
        "Se sugiere <strong>procurar oportunidades de compra técnica</strong>🟢.";
      const contributingFactors =
        positiveFactors.length > 0
          ? positiveFactors.join(", ")
          : "diversos indicadores clave";
      analysisText = `El sesgo macro-fundamental para el par USDJPY se posiciona en <span class="font-bold text-green-600">Alcista</span> ${emoji}. Este posicionamiento se sustenta en la fortaleza observada en ${contributingFactors}. ${actionMessage}`;
    } else if (bias === "Bajista") {
      emoji = "📉";
      actionMessage =
        "Se recomienda <strong>procurar tomar ventas o gestionar el riesgo</strong>🔴.";
      const contributingFactors =
        negativeFactors.length > 0
          ? negativeFactors.join(", ")
          : "múltiples indicadores críticos";
      analysisText = `El sesgo macro-fundamental para el par USDJPY se inclina hacia <span class="font-bold text-red-600">Bajista</span> ${emoji}. Esta perspectiva se fundamenta en la debilidad evidenciada en ${contributingFactors}. ${actionMessage}`;
    } else if (bias === "Neutro") {
      emoji = "⚖️";
      actionMessage =
        "La prudencia aconseja <strong>abstenerse de operar o esperar una mayor definición en las tendencias del mercado.</strong> 🟡";
      const contributingFactors =
        neutralFactors.length > 0
          ? neutralFactors.join(", ")
          : "varios indicadores clave";
      analysisText = `El sesgo macro-fundamental para el par USDJPY se mantiene en <span class="font-bold text-yellow-600">Neutro</span> ${emoji}. Esta neutralidad refleja un equilibrio de fuerzas en el mercado, donde ${contributingFactors} no muestran una dirección definida. ${actionMessage}`;
    } else {
      analysisText =
        "Análisis del sesgo no disponible debido a datos insuficientes o indefinidos.";
      actionMessage = "";
    }
    return analysisText;
  }, [bias, macroEconomicData]);

  // Agrupar datos por categoría para mostrar "Datos" y "Variables" correctamente
  const groupedData = useMemo(() => {
    const groups: { [key: string]: MacroEconomicData[] } = {};
    macroEconomicData.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [macroEconomicData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 font-inter">
      <div className="max-w-7xl mx-auto">
        {/* Header con logo y título */}
        <div className="flex flex-col items-center mb-8 bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-md mr-4 overflow-hidden">
              <Image
                src="https://i.ibb.co/20RsFG5H/emporium-logo-1.jpg"
                alt="Emporium Quality Funds"
                width={64}
                height={64}
                className="object-cover"
                priority
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">
              SENTIMIENTO MACRO-FUNDAMENTAL{" "}
              <span className="text-blue-600">USDJPY</span>
            </h1>
          </div>
          <p className="text-gray-600 text-center max-w-2xl">
            Análisis integral de indicadores económicos y técnicos para
            determinar la dirección del mercado
          </p>
        </div>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center px-6 py-3 bg-white rounded-lg shadow-md">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-600 font-medium">
                Cargando datos macroeconómicos...
              </span>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Tabla de datos */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <tr>
                  <th
                    rowSpan={2}
                    scope="col"
                    className="py-4 px-4 text-center text-sm font-semibold uppercase tracking-wider align-bottom"
                  >
                    Datos
                  </th>
                  <th
                    rowSpan={2}
                    scope="col"
                    className="py-4 px-4 text-left text-sm font-semibold uppercase tracking-wider align-bottom"
                  >
                    Variables
                  </th>
                  <th
                    colSpan={4}
                    scope="col"
                    className="py-2 px-4 text-center text-sm font-semibold uppercase tracking-wider border-b border-gray-400"
                  >
                    EEUU
                  </th>
                  <th
                    colSpan={4}
                    scope="col"
                    className="py-2 px-4 text-center text-sm font-semibold uppercase tracking-wider border-b border-gray-400"
                  >
                    JAPÓN
                  </th>
                  <th
                    rowSpan={2}
                    scope="col"
                    className="py-4 px-4 text-center text-sm font-semibold uppercase tracking-wider align-bottom"
                  >
                    Sesgo del Par
                  </th>
                </tr>
                <tr>
                  <th className="py-2 px-4 text-left text-xs font-medium uppercase tracking-wider">
                    Actual
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium uppercase tracking-wider">
                    Previsión
                  </th>
                  <th className="py-2 px-4 text-center text-xs font-medium uppercase tracking-wider">
                    Puntuación
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium uppercase tracking-wider">
                    Fuente
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium uppercase tracking-wider">
                    Actual
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium uppercase tracking-wider">
                    Previsión
                  </th>
                  <th className="py-2 px-4 text-center text-xs font-medium uppercase tracking-wider">
                    Puntuación
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium uppercase tracking-wider">
                    Fuente
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedData).map(([category, items]) => (
                  <React.Fragment key={category}>
                    {items.map((data, index) => (
                      <TableRow
                        key={data.variable}
                        data={data}
                        dailyChartManualInput={dailyChartManualInput}
                        setDailyChartManualInput={setDailyChartManualInput}
                        onManualInputChange={handleDailyChartManualInputChange}
                        isFirstInCategory={index === 0}
                        rowSpan={items.length}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen de puntuación y sesgo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v5a1 1 0 102 0V7zm-2.414 4.586a1 1 0 101.414-1.414l-4-4a1 1 0 00-1.414 1.414l4 4z"
                  clipRule="evenodd"
                />
              </svg>
              Puntuación Total
            </h3>
            <div
              className={`text-3xl font-bold text-center py-4 rounded-lg ${
                totalScoreColorClass.includes("green")
                  ? "bg-green-100 text-green-700"
                  : totalScoreColorClass.includes("red")
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {isLoading ? (
                <span className="text-gray-500">Calculando...</span>
              ) : (
                totalPairBiasScore
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-8V6a1 1 0 012 0v2h2a1 1 0 110 2h-2v2a1 1 0 11-2 0v-2H6a1 1 0 110-2h2z"
                  clipRule="evenodd"
                />
              </svg>
              Sesgo del Par USDJPY
            </h3>
            <div
              className={`text-3xl font-bold text-center py-4 rounded-lg ${
                bias === "Alcista"
                  ? "bg-green-100 text-green-700"
                  : bias === "Bajista"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {isLoading ? (
                <span className="text-gray-500">Cargando...</span>
              ) : (
                <>
                  {bias}{" "}
                  {bias === "Alcista" ? "📈" : bias === "Bajista" ? "📉" : "⚖️"}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rangos de Sesgo y Análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zM8 11V9h4v2H8z" />
              </svg>
              Rangos de Sesgo
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                <div>
                  <span className="font-medium text-green-800">Alcista:</span>
                  <span className="text-green-700 ml-2">
                    Total de +4 o más 📈
                  </span>
                </div>
              </li>
              <li className="flex items-center p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
                <div>
                  <span className="font-medium text-yellow-800">Neutro:</span>
                  <span className="text-yellow-700 ml-2">
                    Total entre -3 y +3 ⚖️
                  </span>
                </div>
              </li>
              <li className="flex items-center p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                <div>
                  <span className="font-medium text-red-800">Bajista:</span>
                  <span className="text-red-700 ml-2">
                    Total de -4 o menos 📉
                  </span>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 8a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" />
              </svg>
              Análisis del Sesgo del USDJPY
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: generateProfessionalAnalysis(),
                }}
              ></p>
            </div>
          </div>
        </div>

        {/* Footer con marca Emporium Quality Funds */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            © {new Date().getFullYear()} Emporium Quality Funds - Análisis
            Macro-Fundamental
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente de página principal (Next.js)
const Page: React.FC = () => {
  return <USDJPYSentimentTable />;
};

export default Page;
