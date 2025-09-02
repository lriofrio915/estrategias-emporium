"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";

// Definición de tipos
interface MacroEconomicData {
  category: string;
  variable: string;
  actualValue: number | null;
  forecastValue: number | null | undefined;
  unit: string;
  source: string;
  isNegativeForNasdaq: boolean;
}

interface ApiResponseData {
  variable: string;
  actualValue: number | null;
  forecastValue?: number | null;
  error?: string;
  longChange?: number | null;
  shortChange?: number | null;
}

// Componente Tooltip
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

// Componente TableRow
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
  >;
}> = ({
  data,
  calculateScore,
  dailyChartManualInput,
  setDailyChartManualInput,
  isFirstInCategory,
  rowSpan,
  setMacroEconomicData,
}) => {
  const score = useMemo(() => calculateScore(data), [data, calculateScore]);

  // Determina el color de la puntuación individual
  const scoreColorClass = useMemo(() => {
    if (score > 0)
      return "bg-green-100 text-green-800 border border-green-200";
    if (score < 0) return "bg-red-100 text-red-800 border border-red-200";
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
      {/* Lógica para unificar celdas de Valor Actual y Previsión para Sentimiento de las 7 Magníficas, Estacionalidad y Gráfica Diaria */}
      {data.variable === "Sentimiento de las 7 Magníficas" ||
      data.variable === "Estacionalidad" ||
      data.variable === "Gráfica Diaria" ? (
        <td className="py-3 px-4 text-sm text-gray-700 text-center" colSpan={2}>
          {data.variable === "Gráfica Diaria" ? (
            <select
              id="dailyChartSentiment"
              className="p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-full bg-white shadow-sm"
              value={dailyChartManualInput || ""}
              onChange={(e) => {
                setDailyChartManualInput(
                  e.target.value as "Alcista" | "Neutro" | "Bajista"
                );
                const scoreValue =
                  e.target.value === "Alcista"
                    ? 1
                    : e.target.value === "Neutro"
                    ? 0
                    : e.target.value === "Bajista"
                    ? -1
                    : null;
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
          ) : data.variable === "Sentimiento de las 7 Magníficas" ? (
            // Si es "Sentimiento de las 7 Magníficas", se muestra un espacio vacío
            // El valor numérico (e.g., -7 a 7) se obtiene de calculateScore para la columna de Puntuación
            <span className="text-gray-400"></span> // Espacio vacío
          ) : data.actualValue !== null ? (
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
  // Datos de estacionalidad harcodeados
  const seasonalityData = useMemo(
    () => ({
      Jan: 2.5,
      Feb: 0.5,
      Mar: 0.7,
      Apr: 1.3,
      May: 1.3,
      Jun: 1.1,
      Jul: 0.9,
      Aug: 0.3,
      Sep: -0.9,
      Oct: 0.7,
      Nov: 2.1,
      Dec: 1.5,
    }),
    []
  );

  // Función para obtener el valor de estacionalidad del mes actual
  const getSeasonalityForCurrentMonth = useCallback(() => {
    const currentMonth = new Date().toLocaleString("en-us", { month: "short" });
    const monthKey =
      currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);
    return seasonalityData[monthKey as keyof typeof seasonalityData] || 0;
  }, [seasonalityData]);

  // Definición de los datos iniciales de la tabla.
  const initialMacroEconomicData: MacroEconomicData[] = useMemo(
    () => [
      {
        category: "MACRO",
        variable: "Crecimiento del PIB",
        actualValue: null,
        forecastValue: null,
        unit: "%",
        source: "https://tradingeconomics.com/united-states/gdp-growth",
        isNegativeForNasdaq: false,
      },
      {
        category: "MACRO",
        variable: "PMI Manufacturero",
        actualValue: null,
        forecastValue: null,
        unit: "",
        source: "https://tradingeconomics.com/united-states/manufacturing-pmi",
        isNegativeForNasdaq: false,
      },
      {
        category: "MACRO",
        variable: "PMI de Servicios",
        actualValue: null,
        forecastValue: null,
        unit: "",
        source: "https://tradingeconomics.com/united-states/services-pmi",
        isNegativeForNasdaq: false,
      },
      {
        category: "MACRO",
        variable: "Ventas Minoristas",
        actualValue: null,
        forecastValue: null,
        unit: "%",
        source: "https://tradingeconomics.com/united-states/retail-sales",
        isNegativeForNasdaq: false,
      },
      {
        category: "MACRO",
        variable: "Inflación",
        actualValue: null,
        forecastValue: null,
        unit: "%",
        source: "https://tradingeconomics.com/united-states/inflation-cpi",
        isNegativeForNasdaq: true,
      },
      {
        category: "MACRO",
        variable: "Tasa de Desempleo",
        actualValue: null,
        forecastValue: null,
        unit: "%",
        source: "https://tradingeconomics.com/united-states/unemployment-rate",
        isNegativeForNasdaq: true,
      },
      {
        category: "MACRO",
        variable: "Tasa de Interés",
        actualValue: null,
        forecastValue: null,
        unit: "%",
        source: "https://tradingeconomics.com/united-states/interest-rate",
        isNegativeForNasdaq: false,
      },
      // Datos de Sentimiento
      {
        category: "SENTIMIENTO",
        variable: "Sentimiento de las 7 Magníficas",
        actualValue: null, // Valor numérico directo de -7 a 7
        forecastValue: undefined,
        unit: "", // Unidad vacía para mostrar solo el número
        source: "Consolidado de Yahoo Finance",
        isNegativeForNasdaq: false,
      },
      // Datos Técnicos
      {
        category: "TÉCNICOS",
        variable: "Estacionalidad",
        actualValue: null, // Se llenará con el valor del mes actual
        forecastValue: undefined,
        unit: "%",
        source: "https://wegcapital.cl/noticia/estacionalidad",
        isNegativeForNasdaq: false,
      },
      {
        category: "TÉCNICOS",
        variable: "Gráfica Diaria",
        actualValue: null, // Valor inicial null, se llenará con la entrada manual
        forecastValue: undefined,
        unit: "",
        source: "Entrada Manual",
        isNegativeForNasdaq: false,
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
  const [isCalculatingBias, setIsCalculatingBias] = useState(false);

  // Función para calcular la puntuación de una variable
  const calculateScore = useCallback((data: MacroEconomicData): number => {
    // Lógica especial para Sentimiento de las 7 Magníficas
    if (data.variable === "Sentimiento de las 7 Magníficas") {
      if (data.actualValue === null) return 0;
      // Retornar directamente el valor numérico de la API (-7 a 7)
      return data.actualValue;
    }

    // Lógica especial para Estacionalidad
    if (data.variable === "Estacionalidad") {
      if (data.actualValue === null) return 0;
      if (data.actualValue > 0) return 1;
      if (data.actualValue < 0) return -1;
      return 0;
    }

    // Lógica especial para Gráfica Diaria (entrada manual)
    if (data.variable === "Gráfica Diaria") {
      if (data.actualValue === null) return 0;
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
        const data: ApiResponseData = await response.json();
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
          "/api/scrape-magnificent7-sentiment",
          "Sentimiento de las 7 Magníficas"
        ),
      ];

      const results = await Promise.allSettled(apiCalls);

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          const { variable, actualValue, forecastValue } = result.value;

          const targetVariable = variable;

          // Para Sentimiento de las 7 Magníficas, el actualValue ya es el score de -7 a 7
          const finalActualValue = actualValue;

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

  // Calcula el total de la puntuación
  const totalScore = useMemo(() => {
    return macroEconomicData.reduce((sum, data) => {
      // Usa la lógica de puntuación para cada variable
      return sum + calculateScore(data);
    }, 0);
  }, [macroEconomicData, calculateScore]);

  // Determina el sesgo basado en la puntuación total
  // Rangos actualizados para un score total de -16 a 16, con neutro en [-3, 3]
  const bias = useMemo(() => {
    if (totalScore >= 4) {
      return "Alcista";
    } else if (totalScore <= -4) {
      return "Bajista";
    } else { // totalScore está entre -3 y 3 (inclusive)
      return "Neutro";
    }
  }, [totalScore]);

  // Determina el color del texto de la puntuación total
  const totalScoreTextColorClass = useMemo(() => {
    if (bias === "Alcista") {
      return "text-green-700";
    } else if (bias === "Bajista") {
      return "text-red-700";
    } else if (bias === "Neutro") {
      return "text-yellow-700";
    }
    return "text-gray-500"; // Para "Calculando..." o "Indefinido"
  }, [bias]);


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
        scoresMap[item.variable] = calculateScore(item);
      }
    });

    const positiveFactors = relevantVariables
      .filter(
        (item) =>
          scoresMap[item.variable] !== null &&
          scoresMap[item.variable] !== undefined &&
          (scoresMap[item.variable] as number) > 0
      )
      .map((item) => item.variable);
    const negativeFactors = relevantVariables
      .filter(
        (item) =>
          scoresMap[item.variable] !== null &&
          scoresMap[item.variable] !== undefined &&
          (scoresMap[item.variable] as number) < 0
      )
      .map((item) => item.variable);
    const neutralFactors = relevantVariables
      .filter(
        (item) =>
          scoresMap[item.variable] !== null &&
          scoresMap[item.variable] !== undefined &&
          scoresMap[item.variable] === 0
      )
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

  // Agrupar datos por categoría
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
              <span className="text-blue-600">NASDAQ</span>
            </h1>
          </div>
          <p className="text-gray-600 text-center max-w-2xl">
            Análisis integral de indicadores económicos y técnicos para
            determinar la dirección del mercado
          </p>
        </div>

        {/* Indicador de carga y errores */}
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
                        setMacroEconomicData={setMacroEconomicData}
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
            {/* Aplicar el color del texto basado en el sesgo */}
            <div className={`text-3xl font-bold text-center py-4 bg-blue-50 rounded-lg ${totalScoreTextColorClass}`}>
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
                  <span className="text-green-700 ml-2">De +4 a +16 📈</span>
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
                  <span className="text-red-700 ml-2">De -16 a -4 📉</span>
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
