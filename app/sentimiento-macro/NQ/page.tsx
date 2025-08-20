"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image"; // Importado el componente Image de Next.js para optimización

// Definición de tipos para los datos de la tabla
interface MacroEconomicData {
  category: string;
  variable: string;
  actualValue: number | null;
  forecastValue: number | null | undefined;
  unit: string;
  source: string;
  isNegativeForNasdaq: boolean;
}

// Definición de tipos para la respuesta general de la API
// Puede incluir forecastValue opcionalmente
interface ApiResponseData {
  variable: string;
  actualValue: number | null;
  forecastValue?: number | null; // Hacer forecastValue opcional
  error?: string;
  // Propiedades adicionales para COT que no tienen forecastValue
  longChange?: number | null;
  shortChange?: number | null;
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
const TableRow: React.FC<{
  data: MacroEconomicData;
  calculateScore: (data: MacroEconomicData) => number;
  dailyChartManualInput: "Alcista" | "Neutro" | "Bajista" | null;
  setDailyChartManualInput: React.Dispatch<
    React.SetStateAction<"Alcista" | "Neutro" | "Bajista" | null>
  >;
  isFirstInCategory: boolean;
  rowSpan: number;
  setMacroEconomicData: React.Dispatch<
    React.SetStateAction<MacroEconomicData[]>
  >; // Added this prop
}> = ({
  data,
  calculateScore,
  dailyChartManualInput,
  setDailyChartManualInput,
  isFirstInCategory,
  rowSpan,
  setMacroEconomicData, // Destructure the new prop
}) => {
  const score = useMemo(() => calculateScore(data), [data, calculateScore]);

  // Determina el color de la puntuación
  const scoreColorClass = useMemo(() => {
    if (score === 1)
      return "bg-green-100 text-green-800 border border-green-200";
    if (score === -1) return "bg-red-100 text-red-800 border border-red-200";
    return "bg-gray-100 text-gray-800 border border-gray-200";
  }, [score]);

  // Descripciones para cada variable
  const variableDescriptions: Record<string, string> = {
    "Crecimiento del PIB":
      "Mide el cambio en el valor de todos los bienes y servicios producidos en la economía. Un crecimiento fuerte generalmente es positivo para el Nasdaq, ya que indica una economía saludable y mayor gasto en tecnología.",
    "PMI Manufacturero":
      "Índice de Gerentes de Compras para el sector manufacturero. Valores por encima de 50 indican expansión, lo que suele ser positivo para las acciones tecnológicas.",
    "PMI de Servicios":
      "Índice de Gerentes de Compras para el sector servicios. Como la mayoría de la economía estadounidense es de servicios, este indicador es crucial para el sentimiento del mercado.",
    "Ventas Minoristas":
      "Mide el gasto de los consumidores en retail. Un aumento sugiere confianza del consumidor, lo que beneficia a las acciones de consumo discrecional y tecnología.",
    Inflación:
      "Aumento general de precios. Alta inflación es negativa para el Nasdaq porque puede llevar a la Fed a subir tasas de interés, lo que reduce el valor presente de los flujos futuros de las empresas tecnológicas.",
    "Tasa de Desempleo":
      "Porcentaje de la fuerza laboral desempleada. Un desempleo bajo generalmente es positivo, pero demasiado bajo puede generar presiones inflacionarias.",
    "Tasa de Interés":
      "Tasa establecida por la Fed. Tasas bajas benefician al Nasdaq porque hacen que las acciones de crecimiento (como las tecnológicas) sean más atractivas frente a los bonos.",
    "Sentimiento COT Large Speculators":
      "Posicionamiento de los grandes especuladores en futuros del Nasdaq. Un valor positivo alto sugiere expectativas alcistas por parte de actores institucionales.",
    "Sentimiento COT Small Traders":
      "Posicionamiento de pequeños traders en futuros del Nasdaq. Suele ser un indicador contrario: cuando los pequeños traders son muy alcistas, puede ser señal de mercado sobrecomprado.",
    "Sentimiento de las 7 Magníficas":
      "Análisis de precio de las 7 acciones tecnológicas más grandes (Apple, Microsoft, Amazon, etc.). Representa la salud del sector tecnológico.",
    Estacionalidad:
      "Tendencia histórica del Nasdaq durante el mes actual. Basado en datos de los últimos 10 años.",
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

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200">
      {isFirstInCategory && (
        <td
          className="py-3 px-4 text-sm font-medium text-gray-900 text-center align-middle"
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
      {/* Lógica para unificar celdas de Valor Actual y Previsión para Sentimiento COT, 7 Magníficas y Estacionalidad */}
      {data.variable === "Sentimiento COT Large Speculators" ||
      data.variable === "Sentimiento COT Small Traders" ||
      data.variable === "Sentimiento de las 7 Magníficas" ||
      data.variable === "Estacionalidad" ||
      data.variable === "Gráfica Diaria" ? (
        <td className="py-3 px-4 text-sm text-gray-700 text-center" colSpan={2}>
          {/* Renderizar el select para Gráfica Diaria */}
          {data.variable === "Gráfica Diaria" ? (
            <select
              id="dailyChartSentiment"
              className="p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-full bg-white shadow-sm"
              value={dailyChartManualInput || ""}
              onChange={(e) => {
                setDailyChartManualInput(
                  e.target.value as "Alcista" | "Neutro" | "Bajista"
                );
                // Actualiza inmediatamente el valor de la gráfica diaria en los datos de la tabla
                const scoreValue =
                  e.target.value === "Alcista"
                    ? 1
                    : e.target.value === "Neutro"
                    ? 0
                    : e.target.value === "Bajista"
                    ? -1
                    : null;

                // Llamar a setMacroEconomicData para actualizar solo esta fila
                setMacroEconomicData((prevData: MacroEconomicData[]) =>
                  prevData.map((item: MacroEconomicData) =>
                    item.variable === "Gráfica Diaria"
                      ? { ...item, actualValue: scoreValue }
                      : item
                  )
                );
              }}
            >
              <option value="" disabled>
                Selecciona...
              </option>
              <option value="Alcista">Alcista</option>
              <option value="Neutro">Neutro</option>
              <option value="Bajista">Bajista</option>
            </select>
          ) : // Renderizado normal para otras variables unificadas
          data.actualValue !== null ? (
            `${data.actualValue}${data.unit}`
          ) : (
            <span className="text-gray-400">Cargando...</span>
          )}
        </td>
      ) : (
        <>
          <td className="py-3 px-4 text-sm text-gray-700">
            {data.actualValue !== null ? (
              `${data.actualValue}${data.unit}`
            ) : (
              <span className="text-gray-400">Cargando...</span>
            )}
          </td>
          <td className="py-3 px-4 text-sm text-gray-700">
            {data.forecastValue !== null && data.forecastValue !== undefined
              ? `${data.forecastValue}${data.unit}`
              : "N/A"}
          </td>
        </>
      )}
      <td
        className={`py-3 px-4 text-sm font-bold text-center rounded-md ${scoreColorClass}`}
      >
        {data.actualValue !== null &&
        ((data.forecastValue !== null && data.forecastValue !== undefined) ||
          data.variable === "Sentimiento COT Large Speculators" ||
          data.variable === "Sentimiento COT Small Traders" ||
          data.variable === "Sentimiento de las 7 Magníficas" ||
          data.variable === "Estacionalidad" ||
          data.variable === "Gráfica Diaria")
          ? score
          : "-"}
      </td>
      <td className="py-3 px-4 text-sm text-blue-600 hover:text-blue-800 transition-colors">
        <a
          href={data.source}
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
    </tr>
  );
};

// Componente principal de la tabla
const NasdaqSentimentTable: React.FC = () => {
  // Datos de estacionalidad harcodeados basados en la imagen "image_438b23.png" para NASDAQ
  const seasonalityData = useMemo(
    () => ({
      Jan: 2,
      Feb: 3,
      Mar: 2,
      Apr: 1,
      May: 0,
      Jun: 0,
      Jul: 3,
      Aug: -1,
      Sep: 1,
      Oct: 2,
      Nov: 2,
      Dec: 0,
    }),
    []
  );

  // Función para obtener el valor de estacionalidad del mes actual
  const getSeasonalityForCurrentMonth = useCallback(() => {
    const currentMonth = new Date().toLocaleString("en-us", { month: "short" }); // Ej: 'Aug'
    const monthKey =
      currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1); // Ej: 'Aug'
    // Los datos de la tabla son porcentajes, por lo que los usamos directamente.
    // El 0.59 que tenías era probablemente el valor promedio de Agosto, pero la tabla solo muestra enteros.
    // Si la tabla original tenía valores decimales, ajusta `seasonalityData` acorde.
    return seasonalityData[monthKey as keyof typeof seasonalityData] || 0;
  }, [seasonalityData]);

  // Definición de los datos iniciales de la tabla.
  // Usamos useMemo para asegurar que este array solo se cree una vez.
  const initialMacroEconomicData: MacroEconomicData[] = useMemo(
    () => [
      {
        category: "MACRO",
        variable: "Crecimiento del PIB",
        actualValue: null, // Valor temporal, se actualizará
        forecastValue: null, // Valor temporal, se actualizará
        unit: "%",
        source: "https://tradingeconomics.com/united-states/gdp-growth",
        isNegativeForNasdaq: false,
      },
      {
        category: "MACRO",
        variable: "PMI Manufacturero",
        actualValue: null, // Valor temporal, se actualizará
        forecastValue: null, // Valor temporal, se actualizará
        unit: "",
        source: "https://tradingeconomics.com/united-states/manufacturing-pmi",
        isNegativeForNasdaq: false,
      },
      {
        category: "MACRO",
        variable: "PMI de Servicios",
        actualValue: null, // Valor temporal, se actualizará
        forecastValue: null, // Valor temporal, se actualizará
        unit: "",
        source: "https://tradingeconomics.com/united-states/services-pmi",
        isNegativeForNasdaq: false,
      },
      {
        category: "MACRO",
        variable: "Ventas Minoristas",
        actualValue: null, // Valor temporal, se actualizará
        forecastValue: null, // Valor temporal, se actualizará
        unit: "%",
        source: "https://tradingeconomics.com/united-states/retail-sales",
        isNegativeForNasdaq: false,
      },
      {
        category: "MACRO",
        variable: "Inflación",
        actualValue: null, // Valor temporal, se actualizará
        forecastValue: null, // Valor temporal, se actualizará
        unit: "%",
        source: "https://tradingeconomics.com/united-states/inflation-cpi",
        isNegativeForNasdaq: true, // Inflación alta es negativa para el Nasdaq
      },
      {
        category: "MACRO",
        variable: "Tasa de Desempleo",
        actualValue: null, // Valor temporal, se actualizará
        forecastValue: null, // Valor temporal, se actualizará
        unit: "%",
        source: "https://tradingeconomics.com/united-states/unemployment-rate",
        isNegativeForNasdaq: true, // Desempleo alto es negativo para el Nasdaq
      },
      {
        category: "MACRO",
        variable: "Tasa de Interés",
        actualValue: null, // Valor temporal, se actualizará
        forecastValue: null, // Valor temporal, se actualizará
        unit: "%",
        source: "https://tradingeconomics.com/united-states/interest-rate",
        isNegativeForNasdaq: false,
      },
      // Datos de Sentimiento
      {
        category: "SENTIMIENTO",
        variable: "Sentimiento COT Large Speculators",
        actualValue: null, // Ahora se obtiene de la API
        forecastValue: undefined,
        unit: "%",
        source: "https://insider-week.com/en/cot/", // Fuente estática
        isNegativeForNasdaq: false,
      },
      {
        category: "SENTIMIENTO",
        variable: "Sentimiento COT Small Traders",
        actualValue: null, // Ahora se obtiene de la API
        forecastValue: undefined,
        unit: "%",
        source: "https://insider-week.com/en/cot/", // Fuente estática
        isNegativeForNasdaq: false,
      },
      {
        category: "SENTIMIENTO",
        variable: "Sentimiento de las 7 Magníficas",
        actualValue: null, // Valor temporal, se actualizará con el score total
        forecastValue: undefined, // No hay previsión
        unit: "%", // Es un score, no un porcentaje
        source: "Consolidado de Yahoo Finance",
        isNegativeForNasdaq: false, // El score ya indica el sesgo
      },
      // Datos Técnicos
      {
        category: "TÉCNICOS",
        variable: "Estacionalidad",
        actualValue: null, // Se llenará con el valor del mes actual
        forecastValue: undefined, // No hay previsión
        unit: "%", // Es un porcentaje
        source: "https://wegcapital.cl/noticia/estacionalidad", // Fuente actualizada
        isNegativeForNasdaq: false, // Positivo si el rendimiento es positivo
      },
      {
        category: "TÉCNICOS",
        variable: "Gráfica Diaria",
        actualValue: null, // Valor inicial null, se llenará con la entrada manual
        forecastValue: undefined, // No hay previsión
        unit: "", // No hay unidad, es un texto/score
        source: "Entrada Manual", // Fuente de entrada manual
        isNegativeForNasdaq: false, // El score ya indica el sesgo
      },
    ],
    []
  );

  const [macroEconomicData, setMacroEconomicData] = useState<
    MacroEconomicData[]
  >(initialMacroEconomicData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Nuevo estado para la entrada manual de Gráfica Diaria
  const [dailyChartManualInput, setDailyChartManualInput] = useState<
    "Alcista" | "Neutro" | "Bajista" | null
  >(null);
  // Nuevo estado para indicar que el sesgo total se está calculando
  // Este estado solo se usará para la carga inicial de APIs.
  const [isCalculatingBias, setIsCalculatingBias] = useState(false);

  // Función para calcular la puntuación de una variable
  const calculateScore = useCallback((data: MacroEconomicData): number => {
    // Lógica especial para Sentimiento COT (Large Speculators)
    if (data.variable === "Sentimiento COT Large Speculators") {
      if (data.actualValue === null) return 0;
      if (data.actualValue > 10) return 1;
      if (data.actualValue < -10) return -1;
      return 0;
    }

    // Lógica especial para Sentimiento COT Small Traders
    if (data.variable === "Sentimiento COT Small Traders") {
      if (data.actualValue === null) return 0;
      // Tus criterios: 1 si < -10%, -1 si > 10%, 0 si entre -10% y +10%
      if (data.actualValue < -10) return 1; // Bajista Small Traders -> Alcista para índice (contrario)
      if (data.actualValue > 10) return -1; // Alcista Small Traders -> Bajista para índice (contrario)
      return 0; // Neutral
    }

    // Lógica especial para Sentimiento de las 7 Magníficas
    if (data.variable === "Sentimiento de las 7 Magníficas") {
      if (data.actualValue === null) return 0;
      // La puntuación se basa en el valor original de -7 to 7
      if (data.actualValue > 0) return 1; // Alcista si el score total es positivo
      if (data.actualValue < 0) return -1; // Bajista si el score total es negativo
      return 0; // Neutral si el score total es cero
    }

    // Lógica especial para Estacionalidad
    if (data.variable === "Estacionalidad") {
      if (data.actualValue === null) return 0;
      if (data.actualValue > 0) return 1; // Positivo si el rendimiento promedio es positivo
      if (data.actualValue < 0) return -1; // Negativo si el rendimiento promedio es negativo
      return 0; // Neutral si es cero
    }

    // Lógica especial para Gráfica Diaria (entrada manual)
    if (data.variable === "Gráfica Diaria") {
      if (data.actualValue === null) return 0; // Si no hay valor, es 0
      if (data.actualValue === 1) return 1; // Alcista
      if (data.actualValue === -1) return -1; // Bajista
      if (data.actualValue === 0) return 0; // Neutro
      return 0; // Fallback
    }

    // Para otras variables que requieren forecastValue
    if (
      data.actualValue === null ||
      data.forecastValue === null ||
      data.forecastValue === undefined
    ) {
      return 0;
    }

    const { actualValue, forecastValue, isNegativeForNasdaq } = data;

    // Lógica estándar para otras variables
    if (actualValue > forecastValue) {
      return isNegativeForNasdaq ? -1 : 1;
    } else if (actualValue < forecastValue) {
      return isNegativeForNasdaq ? 1 : -1;
    } else {
      return 0; // Neutral
    }
  }, []);

  // Función para cargar los datos de una API Route específica
  const fetchData = useCallback(
    async (apiPath: string, variableName: string) => {
      try {
        const response = await fetch(apiPath);
        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage =
            typeof errorData.error === "string"
              ? errorData.error
              : `Error desconocido al obtener datos de ${variableName}`;
          throw new Error(errorMessage);
        }
        const data: ApiResponseData = await response.json(); // Ahora usa ApiResponseData
        return data;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Error fetching ${variableName} data:`, errorMessage);
        setError((prev) => (prev ? `${prev}\n${errorMessage}` : errorMessage));
        return null;
      }
    },
    []
  );

  // Efecto para cargar los datos al montar el componente
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      setError(null); // Resetear errores al inicio de una nueva carga
      setIsCalculatingBias(true); // Iniciar el mensaje de "calculando" para la carga inicial

      const currentDataMap = new Map(
        initialMacroEconomicData.map((item) => [item.variable, { ...item }])
      );

      const apiCalls = [
        fetchData("/api/scrape-gdp", "Crecimiento del PIB"),
        fetchData("/api/scrape-pmi-manufacturing", "PMI Manufacturero"),
        fetchData("/api/scrape-pmi-services", "PMI de Servicios"),
        fetchData("/api/scrape-retail-sales", "Ventas Minoristas"),
        fetchData("/api/scrape-inflation", "Inflación"),
        fetchData("/api/scrape-unemployment-rate", "Tasa de Desempleo"),
        fetchData("/api/scrape-interest-rate", "Tasa de Interés"),
        fetchData(
          "/api/scrape-cot-nasdaq",
          "Sentimiento COT Large Speculators"
        ),
        fetchData(
          "/api/scrape-cot-nasdaq-small-traders",
          "Sentimiento COT Small Traders"
        ),
        fetchData(
          "/api/scrape-magnificent7-sentiment",
          "Sentimiento de las 7 Magníficas"
        ),
      ];

      const results = await Promise.allSettled(apiCalls);

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          const { variable, actualValue, forecastValue } = result.value;

          let targetVariable = variable;

          if (variable === "Sentimiento COT del Nasdaq") {
            targetVariable = "Sentimiento COT Large Speculators";
          } else if (variable === "Sentimiento COT Small Traders") {
            targetVariable = "Sentimiento COT Small Traders";
          }

          let finalActualValue = actualValue;
          if (
            targetVariable === "Sentimiento de las 7 Magníficas" &&
            actualValue !== null
          ) {
            finalActualValue = parseFloat(((actualValue / 7) * 100).toFixed(2));
          }

          if (currentDataMap.has(targetVariable)) {
            const existingData = currentDataMap.get(targetVariable)!;
            currentDataMap.set(targetVariable, {
              ...existingData,
              actualValue: finalActualValue,
              forecastValue:
                forecastValue !== undefined
                  ? forecastValue
                  : existingData.forecastValue,
            });
          }
        } else if (result.status === "rejected") {
          console.error(
            `Una API call falló en Promise.allSettled: ${result.reason}`
          );
        }
      });

      // Actualizar los valores hardcodeados directamente en el mapa
      // Estacionalidad
      if (currentDataMap.has("Estacionalidad")) {
        currentDataMap.set("Estacionalidad", {
          ...currentDataMap.get("Estacionalidad")!,
          actualValue: getSeasonalityForCurrentMonth(),
          forecastValue: undefined,
        });
      }

      // 3. Actualizar el estado una sola vez al final
      setMacroEconomicData(Array.from(currentDataMap.values()));
      setIsLoading(false);
      setIsCalculatingBias(false); // Finalizar el mensaje de "calculando" una vez que todos los datos iniciales estén cargados
    };

    loadAllData();
  }, [fetchData, initialMacroEconomicData, getSeasonalityForCurrentMonth]);

  // Se ELIMINA el useEffect anterior para dailyChartManualInput,
  // ya que la actualización de `macroEconomicData` en TableRow
  // es suficiente para que `totalScore` y `bias` se recalculen
  // debido a sus dependencias en useMemo.
  // La gestión de `isCalculatingBias` ahora es solo para la carga inicial.

  // Calcula el total de la puntuación
  const totalScore = useMemo(() => {
    return macroEconomicData.reduce((sum, data) => {
      // Para Sentimiento COT Large Speculators, Sentimiento COT Small Traders, Sentimiento de las 7 Magníficas, Estacionalidad y Gráfica Diaria, usa la lógica de puntuación especial
      if (
        data.variable === "Sentimiento COT Large Speculators" ||
        data.variable === "Sentimiento COT Small Traders" ||
        data.variable === "Sentimiento de las 7 Magníficas" ||
        data.variable === "Estacionalidad" ||
        data.variable === "Gráfica Diaria"
      ) {
        if (data.actualValue !== null) {
          // La puntuación para las 7 Magníficas se calcula antes de la conversión a porcentaje
          const originalScoreForMagnificent7 =
            data.variable === "Sentimiento de las 7 Magníficas" &&
            data.actualValue !== null
              ? Math.round((data.actualValue / 100) * 7)
              : data.actualValue;

          const tempMagnificent7Data = {
            ...data,
            actualValue: originalScoreForMagnificent7,
          };

          return sum + calculateScore(tempMagnificent7Data);
        }
        return sum;
      }

      // Para otras variables, se requiere actualValue y forecastValue
      if (
        data.actualValue !== null &&
        data.forecastValue !== null &&
        data.forecastValue !== undefined
      ) {
        return sum + calculateScore(data);
      }
      return sum;
    }, 0);
  }, [macroEconomicData, calculateScore]);

  // Determina el sesgo basado en la puntuación total
  const bias = useMemo(() => {
    if (totalScore >= 4 && totalScore <= 12) {
      return "Alcista";
    } else if (totalScore >= -3 && totalScore <= 3) {
      return "Neutro";
    } else if (totalScore >= -12 && totalScore <= -4) {
      return "Bajista";
    }
    return "Indefinido";
  }, [totalScore]);

  // Genera el análisis del sesgo de forma profesional
  const generateProfessionalAnalysis = useCallback(() => {
    const scoresMap: { [key: string]: number | null } = {};
    // Solo consideramos los factores macro, de sentimiento y técnicos para el análisis.
    const relevantVariables = macroEconomicData.filter(
      (item) =>
        item.category === "MACRO" ||
        item.category === "SENTIMIENTO" ||
        item.category === "TÉCNICOS"
    );

    relevantVariables.forEach((item) => {
      if (item.actualValue !== null) {
        // Para las 7 Magníficas, revertir el porcentaje a score original para el análisis
        if (item.variable === "Sentimiento de las 7 Magníficas") {
          scoresMap[item.variable] = Math.round((item.actualValue / 100) * 7);
        } else {
          // Para las demás, usar su puntuación calculada
          scoresMap[item.variable] = calculateScore(item);
        }
      }
    });

    const positiveFactors = relevantVariables
      .filter((item) => scoresMap[item.variable] === 1)
      .map((item) => item.variable);
    const negativeFactors = relevantVariables
      .filter((item) => scoresMap[item.variable] === -1)
      .map((item) => item.variable);
    const neutralFactors = relevantVariables
      .filter((item) => scoresMap[item.variable] === 0)
      .map((item) => item.variable);

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
      analysisText = `El sesgo macro-fundamental para el Nasdaq se posiciona en <span class="font-bold text-green-600">Alcista</span> ${emoji}. Este posicionamiento se sustenta en la fortaleza observada en ${contributingFactors}. ${actionMessage}`;
    } else if (bias === "Bajista") {
      emoji = "📉";
      actionMessage =
        "Se recomienda <strong>procurar tomar ventas o gestionar el riesgo</strong>🔴.";
      const contributingFactors =
        negativeFactors.length > 0
          ? negativeFactors.length === relevantVariables.length
            ? "todos los indicadores"
            : negativeFactors.join(", ")
          : "múltiples indicadores críticos";
      analysisText = `El sesgo macro-fundamental para el Nasdaq se inclina hacia <span class="font-bold text-red-600">Bajista</span> ${emoji}. Esta perspectiva se fundamenta en la debilidad evidenciada en ${contributingFactors}. ${actionMessage}`;
    } else if (bias === "Neutro") {
      emoji = "⚖️";
      actionMessage =
        "La prudencia aconseja <strong>abstenerse de operar o esperar una mayor definición en las tendencias del mercado.</strong> 🟡";
      const contributingFactors =
        neutralFactors.length > 0
          ? neutralFactors.join(", ")
          : "varios indicadores clave";
      analysisText = `El sesgo macro-fundamental para el Nasdaq se mantiene <span class="font-bold text-gray-600">Neutro</span> ${emoji}. Esta neutralidad refleja un equilibrio de fuerzas en el mercado, donde ${contributingFactors} no muestran una dirección definida. ${actionMessage}`;
    } else {
      analysisText =
        "Análisis del sesgo no disponible debido a datos insuficientes o indefinidos.";
      actionMessage = "";
    }
    return <span dangerouslySetInnerHTML={{ __html: analysisText }} />;
  }, [bias, macroEconomicData, calculateScore]);

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
      <div className="max-w-6xl mx-auto">
        {/* Header con logo y título */}
        <div className="flex flex-col items-center mb-8 bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-md mr-4 overflow-hidden">
              {/* Uso del componente Image de next/image para optimización */}
              <Image
                src="https://i.ibb.co/20RsFG5H/emporium-logo-1.jpg"
                alt="Emporium Quality Funds"
                width={64}
                height={64}
                className="object-cover"
                priority // Carga esta imagen con alta prioridad
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">
              SENTIMIENTO MACRO-FUNDAMENTAL{" "}
              <span className="text-blue-600">NASDAQ</span>
            </h1>
          </div>
          <p className="text-gray-600 text-center max-w-2xl">
            Análisis integral de indicadores económicos y técnicos para
            determinar la dirección del mercado
          </p>
        </div>

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
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <tr>
                  <th className="py-4 px-4 text-center text-sm font-semibold uppercase tracking-wider">
                    Datos
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Variables
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Valor Actual
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Previsión
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Puntuación
                  </th>
                  <th className="py-4 px-4 text-left text-sm font-semibold uppercase tracking-wider">
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
                        calculateScore={calculateScore}
                        dailyChartManualInput={dailyChartManualInput}
                        setDailyChartManualInput={setDailyChartManualInput}
                        isFirstInCategory={index === 0}
                        rowSpan={items.length}
                        setMacroEconomicData={setMacroEconomicData} // Pass the setter here
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
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Puntuación Total
            </h3>
            <div className="text-3xl font-bold text-blue-600 text-center py-4 bg-blue-50 rounded-lg">
              {isCalculatingBias ? (
                <span className="text-gray-500">Calculando...</span>
              ) : (
                totalScore
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              Sesgo del Mercado
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
              {isCalculatingBias ? (
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
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Rangos de Sesgo
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                <div>
                  <span className="font-medium text-green-800">Alcista:</span>
                  <span className="text-green-700 ml-2">De +4 a +12 📈</span>
                </div>
              </li>
              <li className="flex items-center p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
                <div>
                  <span className="font-medium text-yellow-800">Neutro:</span>
                  <span className="text-yellow-700 ml-2">Entre -3 y +3 ⚖️</span>
                </div>
              </li>
              <li className="flex items-center p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                <div>
                  <span className="font-medium text-red-800">Bajista:</span>
                  <span className="text-red-700 ml-2">De -12 a -4 📉</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
              Análisis del Sesgo del Nasdaq
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-gray-700 leading-relaxed">
                {isCalculatingBias ? (
                  <span className="text-gray-500">Calculando análisis...</span>
                ) : (
                  generateProfessionalAnalysis()
                )}
              </p>
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
  return <NasdaqSentimentTable />;
};

export default Page;
