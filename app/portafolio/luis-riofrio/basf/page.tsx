"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Interfaz actualizada para datos históricos
interface HistoricalData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
}

// Interfaz para la estructura esperada del dato de un activo de la API
interface ApiAssetItem {
  ticker: string;
  data: {
    price?: {
      longName?: string;
      currency?: string;
      currencySymbol?: string;
      regularMarketPrice?: number;
      regularMarketChange?: number;
      regularMarketChangePercent?: number;
      regularMarketTime?: number; // Timestamp
      exchangeName?: string;
      quoteSourceName?: string;
      marketCap?: number;
    };
    assetProfile?: {
      longBusinessSummary?: string;
      sector?: string;
      industry?: string;
      website?: string;
      phone?: string;
      address1?: string;
      city?: string;
      zip?: string;
      country?: string;
      fullTimeEmployees?: number;
      companyOfficers?: Array<{
        name: string;
        title: string;
        totalPay?: number;
      }>;
      overallRisk?: number;
      auditRisk?: number;
      boardRisk?: number;
      compensationRisk?: number;
      shareHolderRightsRisk?: number;
    };
    summaryDetail?: {
      previousClose?: number;
      dayLow?: number;
      dayHigh?: number;
      fiftyTwoWeekLow?: number;
      fiftyTwoWeekHigh?: number;
      volume?: number;
      averageVolume?: number;
      dividendRate?: number;
      dividendYield?: number;
      exDividendDate?: number; // Timestamp
      payoutRatio?: number;
      fiveYearAvgDividendYield?: number;
      beta?: number;
      trailingPE?: number;
      forwardPE?: number;
      priceToSalesTrailing12Months?: number;
      priceToBook?: number;
    };
    defaultKeyStatistics?: {
      enterpriseValue?: number;
      forwardPE?: number;
      profitMargins?: number;
      sharesOutstanding?: number;
      heldPercentInsiders?: number;
      heldPercentInstitutions?: number;
      shortRatio?: number;
      bookValue?: number;
      priceToBook?: number;
      lastFiscalYearEnd?: number; // Timestamp
      nextFiscalYearEnd?: number; // Timestamp
      mostRecentQuarter?: number; // Timestamp
      earningsQuarterlyGrowth?: number;
      netIncomeToCommon?: number;
      trailingEps?: number;
      forwardEps?: number;
      lastSplitFactor?: string;
      lastSplitDate?: number; // Timestamp
      enterpriseToRevenue?: number;
      enterpriseToEbitda?: number;
      "52WeekChange"?: number;
      SandP52WeekChange?: number;
      lastDividendValue?: number;
      lastDividendDate?: number; // Timestamp
    };
    financialData?: {
      currentPrice?: number;
      targetHighPrice?: number;
      targetLowPrice?: number;
      targetMeanPrice?: number;
      targetMedianPrice?: number;
      recommendationMean?: number;
      recommendationKey?: string;
      numberOfAnalystOpinions?: number;
      totalCash?: number;
      totalCashPerShare?: number;
      ebitda?: number;
      totalDebt?: number;
      quickRatio?: number;
      currentRatio?: number;
      totalRevenue?: number;
      debtToEquity?: number;
      revenuePerShare?: number;
      returnOnAssets?: number;
      returnOnEquity?: number;
      grossProfits?: number;
      freeCashflow?: number;
      operatingCashflow?: number;
      earningsGrowth?: number;
      revenueGrowth?: number;
      grossMargins?: number;
      ebitdaMargins?: number;
      operatingMargins?: number;
      profitMargins?: number;
    };
    historical?: HistoricalData[];
  };
}

// Componente para formatear números a moneda
const formatCurrency = (
  value: number | null | undefined,
  currencySymbol: string = "€"
) => {
  if (value === null || value === undefined) return ""; // Retorna cadena vacía si no hay valor
  return `${currencySymbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Componente para formatear porcentajes
const formatPercentage = (value: number | null | undefined) => {
  if (value === null || value === undefined) return ""; // Retorna cadena vacía si no hay valor
  return `${(value * 100).toFixed(2)}%`;
};

// Componente para formatear fechas de timestamp
const formatDate = (timestamp: number | null | undefined) => {
  if (timestamp === null || timestamp === undefined) return ""; // Retorna cadena vacía si no hay valor
  // Asumimos que los timestamps pueden venir en segundos o milisegundos.
  // Si el timestamp es pequeño (ej. < 10^12), es probable que esté en segundos.
  const dateValue = timestamp < 1000000000000 ? timestamp * 1000 : timestamp;
  const date = new Date(dateValue);
  // Verificamos si la fecha es válida
  if (isNaN(date.getTime())) {
    return ""; // Retorna cadena vacía si la fecha es inválida
  }
  return date.toLocaleDateString();
};

// Función para formatear objetos Date
const formatDateObject = (date: Date | null | undefined) => {
  if (!date) return "";
  return date.toLocaleDateString();
};

const getChangeColorClass = (change: number | null | undefined) => {
  if (change === null || change === undefined) return "text-gray-600";
  return change > 0
    ? "text-green-600"
    : change < 0
    ? "text-red-600"
    : "text-gray-600";
};

// Función helper para convertir diferentes formatos de fecha a objeto Date
const parseFinanceDate = (dateValue: any): Date => {
  if (dateValue instanceof Date) {
    return dateValue;
  }

  if (typeof dateValue === "number") {
    // Timestamp - determinar si está en segundos o milisegundos
    return new Date(dateValue < 1000000000000 ? dateValue * 1000 : dateValue);
  }

  if (typeof dateValue === "string") {
    // Intentar parsear como string de fecha
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  console.warn("No se pudo parsear la fecha:", dateValue);
  return new Date(); // Fallback a fecha actual
};

// Tipos de períodos disponibles
type TimePeriod = "1W" | "1M" | "3M" | "1Y" | "5Y";

export default function BasfReportPage() {
  const ticker = "BAS.DE";
  const [assetData, setAssetData] = useState<ApiAssetItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("1M");

  const fetchBasfData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Construye la URL de la API de forma absoluta
      const apiUrl = `${window.location.origin}/api/portfolio-luis-riofrio?tickers=${ticker}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Fallo al obtener los datos de BASF SE.");
      }
      const apiResponse = await response.json();

      if (apiResponse.success === false) {
        setError(apiResponse.message || "Error desconocido al obtener datos.");
        setLoading(false);
        return;
      }

      if (apiResponse.data && apiResponse.data.length > 0) {
        setAssetData(apiResponse.data[0]);
      } else {
        setError("No se encontraron datos para BASF SE.");
      }
    } catch (err: unknown) {
      console.error("Error al obtener datos de BASF SE:", err);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los datos de BASF SE. Por favor, inténtalo de nuevo más tarde."
      );
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    fetchBasfData();
  }, [fetchBasfData]);

  // Filtrar datos históricos según el período seleccionado
  const filteredHistoricalData = useMemo(() => {
    if (
      !assetData?.data?.historical ||
      assetData.data.historical.length === 0
    ) {
      return [];
    }

    const now = new Date();
    let cutoffDate: Date;

    switch (selectedPeriod) {
      case "1W":
        cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "1M":
        cutoffDate = new Date(now);
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "3M":
        cutoffDate = new Date(now);
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case "1Y":
        cutoffDate = new Date(now);
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case "5Y":
        cutoffDate = new Date(now);
        cutoffDate.setFullYear(now.getFullYear() - 5);
        break;
    }

    return assetData.data.historical.filter((item) => {
      const itemDate = parseFinanceDate(item.date);
      return itemDate >= cutoffDate;
    });
  }, [assetData, selectedPeriod]);

  // Prepara los datos para el gráfico de rendimiento general
  const performanceChartData = useMemo(() => {
    // Solo procesamos si hay datos filtrados disponibles
    if (filteredHistoricalData.length === 0) {
      return null;
    }

    const labels = filteredHistoricalData.map((item) => {
      const date = parseFinanceDate(item.date);
      return date.toLocaleDateString();
    });

    const data = filteredHistoricalData.map((item) => item.close);

    return {
      labels: labels,
      datasets: [
        {
          label: "Precio de Cierre",
          data: data,
          fill: false,
          borderColor: "#0A2342",
          backgroundColor: "rgba(10, 35, 66, 0.1)",
          tension: 0.1,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: "#0A2342",
        },
      ],
    };
  }, [filteredHistoricalData]);

  const performanceChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Rendimiento Histórico (${selectedPeriod})`,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: function (context: any) {
            return `Precio: ${formatCurrency(
              context.parsed.y,
              assetData?.data?.price?.currencySymbol || "€"
            )}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Fecha",
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        title: {
          display: true,
          text: `Precio (${assetData?.data?.price?.currencySymbol || "€"})`,
        },
      },
    },
    maintainAspectRatio: false,
  };

  // Botones de selección de período
  const periodButtons = [
    { key: "1W" as TimePeriod, label: "1 Semana" },
    { key: "1M" as TimePeriod, label: "1 Mes" },
    { key: "3M" as TimePeriod, label: "3 Meses" },
    { key: "1Y" as TimePeriod, label: "1 Año" },
    { key: "5Y" as TimePeriod, label: "5 Años" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center text-gray-700">
          <svg
            className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4"
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
          <p className="text-xl font-semibold">
            Cargando informe financiero...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      </div>
    );
  }

  if (!assetData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center text-gray-700">
          <p className="text-xl font-semibold">
            No se pudieron cargar los datos del activo {ticker}.
          </p>
        </div>
      </div>
    );
  }

  const {
    price,
    assetProfile,
    summaryDetail,
    defaultKeyStatistics,
    financialData,
  } = assetData.data;

  // Datos principales a mostrar
  const companyName = price?.longName || "BASF SE";
  const currentPrice = price?.regularMarketPrice;
  const currency = price?.currency || "EUR";
  const currencySymbol = price?.currencySymbol || "€";
  const regularMarketChange = price?.regularMarketChange;
  const regularMarketChangePercent = price?.regularMarketChangePercent;

  // Función para renderizar un elemento de lista si el valor no es nulo o indefinido
  const renderListItem = (
    label: string,
    value: string | number | undefined | null,
    format: "currency" | "percentage" | "number" | "date" | "text" = "text",
    highlight = true
  ) => {
    if (value === null || value === undefined || value === "") return null;

    let formattedValue = value;

    switch (format) {
      case "currency":
        formattedValue =
          typeof value === "number"
            ? formatCurrency(value, currencySymbol)
            : "";
        break;
      case "percentage":
        formattedValue =
          typeof value === "number" ? formatPercentage(value) : "";
        break;
      case "number":
        formattedValue =
          typeof value === "number" ? value.toLocaleString() : value;
        break;
      case "date":
        formattedValue = typeof value === "number" ? formatDate(value) : "";
        break;
      case "text":
      default:
        formattedValue = String(value);
        break;
    }

    if (formattedValue === "") return null;

    return (
      <li className="mb-1">
        <span className="font-semibold">{label}:</span>{" "}
        {highlight ? (
          <span className="highlight-api">{formattedValue}</span>
        ) : (
          <span>{formattedValue}</span>
        )}
      </li>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pt-2 font-inter">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        {/* Título del Informe */}
        <header className="text-center mb-12 mt-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A2342] mb-4">
            Informe de Portafolio - {companyName} ({ticker})
          </h1>
          <p className="text-lg md:text-xl text-[#849E8F]">
            Análisis detallado para inversores de BASF SE, líder global en la
            industria química.
          </p>
        </header>

        {/* --- Visión General de la Empresa --- */}
        <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
            1. Visión General de la Empresa
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-semibold text-[#0A2342] mb-4">
                Acerca de {companyName}
              </h3>
              {assetProfile?.longBusinessSummary && (
                <p className="text-gray-700 leading-relaxed mb-4">
                  <span className="font-semibold">Descripción:</span>{" "}
                  <span className="highlight-api">
                    {assetProfile.longBusinessSummary}
                  </span>
                </p>
              )}
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {renderListItem("Sector", assetProfile?.sector, "text")}
                {renderListItem("Industria", assetProfile?.industry, "text")}
                {assetProfile?.website && (
                  <li>
                    <span className="font-semibold">Sitio Web:</span>{" "}
                    <a
                      href={assetProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline highlight-api"
                    >
                      {assetProfile.website}
                    </a>
                  </li>
                )}
                {renderListItem(
                  "Empleados a tiempo completo",
                  assetProfile?.fullTimeEmployees,
                  "number"
                )}
                {(assetProfile?.address1 ||
                  assetProfile?.city ||
                  assetProfile?.country) && (
                  <li>
                    <span className="font-semibold">Ubicación:</span>{" "}
                    <span className="highlight-api">{`${
                      assetProfile?.address1 || ""
                    }, ${assetProfile?.city || ""}, ${
                      assetProfile?.country || ""
                    }`}</span>
                  </li>
                )}
              </ul>
            </div>
            <div className="space-y-4">
              <img
                src="https://i.ibb.co/HDk635Bn/basf-1.jpg"
                alt="Imagen Corporativa BASF"
                className="rounded-lg shadow-md w-full h-auto object-cover"
                onError={(e) =>
                  (e.currentTarget.src =
                    "https://i.ibb.co/HDk635Bn/basf-1.jpg")
                }
              />
              <img
                src="https://i.ibb.co/Txp3Mwqr/basf-2.jpg"
                alt="Productos BASF"
                className="rounded-lg shadow-md w-full h-auto object-cover"
                onError={(e) =>
                  (e.currentTarget.src =
                    "https://i.ibb.co/Txp3Mwqr/basf-2.jpg")
                }
              />
            </div>
          </div>
        </section>

        {/* --- Análisis de Mercado y Precios --- */}
        <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
            2. Análisis de Mercado y Precios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-700">
            <div>
              <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
                Rendimiento Actual
              </h3>
              <ul className="space-y-2">
                {renderListItem("Bolsa", price?.exchangeName, "text")}
                {renderListItem("Precio Actual", currentPrice, "currency")}
                {renderListItem(
                  "Cambio Diario",
                  regularMarketChange,
                  "currency"
                )}
                {renderListItem(
                  "Cambio %",
                  regularMarketChangePercent,
                  "percentage"
                )}
                {renderListItem(
                  "Última Actualización",
                  price?.regularMarketTime,
                  "date"
                )}
                {renderListItem(
                  "Cierre Anterior",
                  summaryDetail?.previousClose,
                  "currency"
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
                Rangos y Volumen
              </h3>
              <ul className="space-y-2">
                {renderListItem(
                  "Mínimo Diario",
                  summaryDetail?.dayLow,
                  "currency"
                )}
                {renderListItem(
                  "Máximo Diario",
                  summaryDetail?.dayHigh,
                  "currency"
                )}
                {renderListItem(
                  "Mínimo 52 Semanas",
                  summaryDetail?.fiftyTwoWeekLow,
                  "currency"
                )}
                {renderListItem(
                  "Máximo 52 Semanas",
                  summaryDetail?.fiftyTwoWeekHigh,
                  "currency"
                )}
                {renderListItem("Volumen", summaryDetail?.volume, "number")}
                {renderListItem(
                  "Volumen Promedio",
                  summaryDetail?.averageVolume,
                  "number"
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
                Ratios de Valoración
              </h3>
              <ul className="space-y-2">
                {renderListItem("Capitalización", price?.marketCap, "currency")}
                {renderListItem(
                  "P/E (Trailing)",
                  summaryDetail?.trailingPE,
                  "number"
                )}
                {renderListItem(
                  "P/E (Forward)",
                  summaryDetail?.forwardPE,
                  "number"
                )}
                {renderListItem(
                  "P/S (TTM)",
                  summaryDetail?.priceToSalesTrailing12Months,
                  "number"
                )}
                {renderListItem("P/B", summaryDetail?.priceToBook, "number")}
                {renderListItem("Beta", summaryDetail?.beta, "number")}
              </ul>
            </div>
          </div>
        </section>

        {/* --- Gráfico de Rendimiento --- */}
        {performanceChartData && (
          <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
            <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
              Rendimiento Histórico
            </h2>

            {/* Selector de período */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {periodButtons.map((period) => (
                <button
                  key={period.key}
                  onClick={() => setSelectedPeriod(period.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedPeriod === period.key
                      ? "bg-[#0A2342] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>

            <div className="relative h-96">
              <Line
                options={performanceChartOptions}
                data={performanceChartData}
              />
            </div>
          </section>
        )}

        {/* --- Rendimiento y Dividendos --- */}
        <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
            3. Rendimiento y Dividendos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div>
              <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
                Dividendos
              </h3>
              <ul className="space-y-2">
                {renderListItem(
                  "Tasa de Dividendo",
                  summaryDetail?.dividendRate,
                  "currency"
                )}
                {renderListItem(
                  "Rendimiento de Dividendo",
                  summaryDetail?.dividendYield,
                  "percentage"
                )}
                {renderListItem(
                  "Fecha Ex-Dividendo",
                  summaryDetail?.exDividendDate,
                  "date"
                )}
                {renderListItem(
                  "Payout Ratio",
                  summaryDetail?.payoutRatio,
                  "percentage"
                )}
                {renderListItem(
                  "Rendimiento Prom. 5 Años",
                  summaryDetail?.fiveYearAvgDividendYield,
                  "percentage"
                )}
                {renderListItem(
                  "Último Valor de Dividendo",
                  defaultKeyStatistics?.lastDividendValue,
                  "currency"
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
                Volatilidad y Riesgo
              </h3>
              <ul className="space-y-2">
                {renderListItem("Beta", summaryDetail?.beta, "number")}
                {renderListItem(
                  "Cambio vs. S&P 500 (52 Semanas)",
                  defaultKeyStatistics?.["52WeekChange"],
                  "percentage"
                )}
              </ul>
            </div>
          </div>
        </section>

        {/* --- Salud Financiera (Balance y Flujos de Efectivo) --- */}
        {(financialData?.totalCash !== undefined ||
          financialData?.totalDebt !== undefined ||
          financialData?.quickRatio !== undefined ||
          financialData?.currentRatio !== undefined ||
          financialData?.debtToEquity !== undefined ||
          financialData?.operatingCashflow !== undefined ||
          financialData?.freeCashflow !== undefined) && (
          <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
            <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
              4. Salud Financiera
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
                  Liquidez y Endeudamiento
                </h3>
                <ul className="space-y-2">
                  {renderListItem(
                    "Efectivo Total",
                    financialData?.totalCash,
                    "currency"
                  )}
                  {renderListItem(
                    "Efectivo por Acción",
                    financialData?.totalCashPerShare,
                    "currency"
                  )}
                  {renderListItem(
                    "Deuda Total",
                    financialData?.totalDebt,
                    "currency"
                  )}
                  {renderListItem(
                    "Quick Ratio",
                    financialData?.quickRatio,
                    "number"
                  )}
                  {renderListItem(
                    "Current Ratio",
                    financialData?.currentRatio,
                    "number"
                  )}
                  {renderListItem(
                    "Deuda/Patrimonio",
                    financialData?.debtToEquity,
                    "number"
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
                  Flujos de Efectivo
                </h3>
                <ul className="space-y-2">
                  {renderListItem(
                    "Flujo de Caja Operativo",
                    financialData?.operatingCashflow,
                    "currency"
                  )}
                  {renderListItem(
                    "Flujo de Caja Libre",
                    financialData?.freeCashflow,
                    "currency"
                  )}
                </ul>
                <p className="mt-4 text-sm text-gray-600">
                  Un flujo de caja libre positivo es crucial para la inversión
                  en crecimiento y el pago de dividendos.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* --- Rentabilidad y Crecimiento --- */}
        {(financialData?.totalRevenue !== undefined ||
          financialData?.revenuePerShare !== undefined ||
          financialData?.revenueGrowth !== undefined ||
          financialData?.grossProfits !== undefined ||
          financialData?.grossMargins !== undefined ||
          financialData?.ebitdaMargins !== undefined ||
          financialData?.operatingMargins !== undefined ||
          financialData?.profitMargins !== undefined ||
          defaultKeyStatistics?.trailingEps !== undefined ||
          defaultKeyStatistics?.forwardEps !== undefined ||
          defaultKeyStatistics?.earningsQuarterlyGrowth !== undefined ||
          financialData?.returnOnAssets !== undefined ||
          financialData?.returnOnEquity !== undefined) && (
          <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
            <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
              5. Rentabilidad y Crecimiento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
                  Ingresos y Márgenes
                </h3>
                <ul className="space-y-2">
                  {renderListItem(
                    "Ingresos Totales",
                    financialData?.totalRevenue,
                    "currency"
                  )}
                  {renderListItem(
                    "Ingresos por Acción",
                    financialData?.revenuePerShare,
                    "currency"
                  )}
                  {renderListItem(
                    "Crecimiento de Ingresos",
                    financialData?.revenueGrowth,
                    "percentage"
                  )}
                  {renderListItem(
                    "Beneficios Brutos",
                    financialData?.grossProfits,
                    "currency"
                  )}
                  {renderListItem(
                    "Márgenes Brutos",
                    financialData?.grossMargins,
                    "percentage"
                  )}
                  {renderListItem(
                    "Márgenes EBITDA",
                    financialData?.ebitdaMargins,
                    "percentage"
                  )}
                  {renderListItem(
                    "Márgenes Operativos",
                    financialData?.operatingMargins,
                    "percentage"
                  )}
                  {renderListItem(
                    "Márgenes de Beneficio",
                    financialData?.profitMargins,
                    "percentage"
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
                  Ganancias y Retorno
                </h3>
                <ul className="space-y-2">
                  {renderListItem(
                    "EPS (Trailing)",
                    defaultKeyStatistics?.trailingEps,
                    "number"
                  )}
                  {renderListItem(
                    "EPS (Forward)",
                    defaultKeyStatistics?.forwardEps,
                    "number"
                  )}
                  {renderListItem(
                    "Crecimiento de Ganancias Trimestrales",
                    defaultKeyStatistics?.earningsQuarterlyGrowth,
                    "percentage"
                  )}
                  {renderListItem(
                    "Retorno sobre Activos (ROA)",
                    financialData?.returnOnAssets,
                    "percentage"
                  )}
                  {renderListItem(
                    "Retorno sobre Patrimonio (ROE)",
                    financialData?.returnOnEquity,
                    "percentage"
                  )}
                </ul>
                <p className="mt-4 text-sm text-gray-600">
                  Los márgenes y retornos son indicadores clave de la eficiencia
                  operativa y la creación de valor para los accionistas.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* --- Perspectivas de Analistas y Riesgos --- */}
        {(financialData?.recommendationKey !== undefined ||
          financialData?.numberOfAnalystOpinions !== undefined ||
          financialData?.targetHighPrice !== undefined ||
          financialData?.targetLowPrice !== undefined ||
          financialData?.targetMeanPrice !== undefined ||
          assetProfile?.overallRisk !== undefined) && (
          <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
            <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
              6. Perspectivas de Analistas y Riesgos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
                  Recomendaciones de Analistas
                </h3>
                <ul className="space-y-2">
                  {renderListItem(
                    "Recomendación Media",
                    financialData?.recommendationKey,
                    "text"
                  )}
                  {financialData?.recommendationMean !== null &&
                    financialData?.recommendationMean !== undefined && (
                      <li>
                        <span className="font-semibold">Puntuación Media:</span>{" "}
                        <span className="highlight-api">
                          {financialData.recommendationMean.toFixed(2)}
                        </span>{" "}
                        de 5
                      </li>
                    )}
                  {renderListItem(
                    "Número de Analistas",
                    financialData?.numberOfAnalystOpinions,
                    "number"
                  )}
                  {renderListItem(
                    "Precio Objetivo Alto",
                    financialData?.targetHighPrice,
                    "currency"
                  )}
                  {renderListItem(
                    "Precio Objetivo Bajo",
                    financialData?.targetLowPrice,
                    "currency"
                  )}
                  {renderListItem(
                    "Precio Objetivo Medio",
                    financialData?.targetMeanPrice,
                    "currency"
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
                  Riesgos de Gobierno Corporativo
                </h3>
                <ul className="space-y-2">
                  {renderListItem(
                    "Riesgo General",
                    assetProfile?.overallRisk,
                    "number"
                  )}
                  {renderListItem(
                    "Riesgo de Auditoría",
                    assetProfile?.auditRisk,
                    "number"
                  )}
                  {renderListItem(
                    "Riesgo de Junta Directiva",
                    assetProfile?.boardRisk,
                    "number"
                  )}
                  {renderListItem(
                    "Riesgo de Compensación",
                    assetProfile?.compensationRisk,
                    "number"
                  )}
                  {renderListItem(
                    "Riesgo de Derechos de Accionistas",
                    assetProfile?.shareHolderRightsRisk,
                    "number"
                  )}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* --- Conclusión --- */}
        <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
            7. Conclusión del Informe
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            BASF SE se posiciona como un actor clave en la industria química
            global, con una fuerte presencia en diversos segmentos. Su
            capitalización de mercado de aproximadamente{" "}
            <span className="highlight-api">
              {formatCurrency(price?.marketCap, currencySymbol)}
            </span>{" "}
            y su diversificada cartera de productos sugieren una empresa con una
            base sólida.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Desde la perspectiva financiera, observamos que los precios
            objetivos de los analistas varían, pero la recomendación media de{" "}
            <span className="highlight-api">
              {financialData?.recommendationKey?.toUpperCase() || ""}
            </span>{" "}
            sugiere una perspectiva generalmente positiva. Sin embargo, el{" "}
            {summaryDetail?.payoutRatio !== undefined && (
              <span>
                <span className="font-semibold">Payout Ratio</span> de{" "}
                <span className="highlight-api">
                  {formatPercentage(summaryDetail?.payoutRatio)}
                </span>
              </span>
            )}{" "}
            y el{" "}
            {defaultKeyStatistics?.earningsQuarterlyGrowth !== undefined && (
              <span>
                <span className="font-semibold">
                  Crecimiento de Ganancias Trimestrales:
                </span>{" "}
                <span className="highlight-api">
                  {formatPercentage(
                    defaultKeyStatistics?.earningsQuarterlyGrowth
                  )}
                </span>
              </span>
            )}{" "}
            son puntos clave a monitorear.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Considerando su posición en el mercado, el rendimiento de dividendos
            de{" "}
            {summaryDetail?.dividendYield !== undefined && (
              <span className="highlight-api">
                {formatPercentage(summaryDetail?.dividendYield)}
              </span>
            )}{" "}
            y los ratios de valoración, BASF SE podría representar una
            oportunidad interesante para inversores con un horizonte a largo
            plazo, siempre considerando los riesgos inherentes al mercado y las
            particularidades del sector de materiales básicos.
          </p>
        </section>

        {/* Pie de página con aviso legal */}
        <footer className="text-center mt-12 pt-8 border-t border-gray-200">
          <h3 className="font-bold mb-2 text-[#0A2342]">Aviso Legal</h3>
          <p className="text-xs text-[#849E8F] max-w-4xl mx-auto">
            El contenido de este informe tiene fines puramente educativos e
            informativos y no constituye en ningún caso asesoramiento de
            inversión. La operativa con activos financieros implica un alto
            grado de riesgo y puede no ser adecuada para todos los inversores.
            Existe la posibilidad de que se incurra en pérdidas que superen la
            inversión inicial. Los resultados pasados no son indicativos de
            resultados futuros.
          </p>
        </footer>
      </div>
      {/* Estilos para resaltar los datos de la API */}
      <style jsx>{`
        .highlight-api {
          font-weight: 600;
          color: #0a2342;
          background-color: #e0f2f7;
          padding: 2px 4px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
