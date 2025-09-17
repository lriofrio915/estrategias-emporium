"use client";

import { useState, useEffect, useCallback } from "react";
import { ApiAssetItem } from "@/types/api";
import {
  ValuationDashboardData,
  processApiDataForDashboard,
} from "@/types/valuation";
import CompanyOverview from "../CompanyOverview/CompanyOverview";
import MarketAnalysis from "../MarketAnalysis/MarketAnalysis";
// ... (otros imports)
import ValuationDashboard from "../ValuationDashboard/ValuationDashboard";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorDisplay from "../Shared/ErrorDisplay";
import Conclusion from "../Conclusion/Conclusion";
import AnalystPerspectives from "../AnalystPerspectives/AnalystPerspectives";
import Profitability from "../Profitability/Profitability";
import FinancialHealth from "../FinancialHealth/FinancialHealth";
import DividendsSection from "../DividendsSection/DividendsSection";
import PerformanceChart from "../PerformanceChart/PerformanceChart";

interface ReportPageProps {
  ticker: string;
}

export default function ReportPage({ ticker }: ReportPageProps) {
  const [assetData, setAssetData] = useState<ApiAssetItem | null>(null);
  const [valuationData, setValuationData] =
    useState<ValuationDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssetData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = `/api/${ticker}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Fallo al obtener los datos de ${ticker}.`);
      }

      const apiResponse = await response.json();

      // *** AÑADIMOS EL CONSOLE.LOG AQUÍ ***
      console.log("1. Respuesta CRUDA de la API:", apiResponse);

      if (apiResponse.success === false) {
        setError(apiResponse.message || "Error desconocido al obtener datos.");
        return;
      }

      if (apiResponse.assetData && apiResponse.assetData.length > 0) {
        const rawAssetData: ApiAssetItem = apiResponse.assetData[0];
        setAssetData(rawAssetData);

        // *** AÑADIMOS EL CONSOLE.LOG AQUÍ ***
        console.log("2. Datos SIN PROCESAR para el Dashboard:", rawAssetData);

        // Procesamos los datos crudos para el ValuationDashboard
        const processedData = processApiDataForDashboard(rawAssetData);
        setValuationData(processedData);

        // *** AÑADIMOS EL CONSOLE.LOG AQUÍ ***
        console.log("4. Datos PROCESADOS para el Dashboard:", processedData);
      } else {
        setError(`No se encontraron datos para ${ticker}.`);
      }
    } catch (err: unknown) {
      console.error(`Error al obtener datos de ${ticker}:`, err);
      setError(
        err instanceof Error
          ? err.message
          : `No se pudieron cargar los datos de ${ticker}.`
      );
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    fetchAssetData();
  }, [fetchAssetData]);

  if (loading) {
    return <LoadingSpinner ticker={ticker} />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!assetData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-xl font-semibold">
          No se pudieron cargar los datos del activo {ticker}.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pt-2 font-inter">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <header className="text-center mb-12 mt-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A2342] mb-4">
            Informe de Portafolio - {assetData.data.price?.longName || ticker} (
            {ticker})
          </h1>
          <p className="text-lg md:text-xl text-[#849E8F]">
            Análisis detallado para inversores de{" "}
            {assetData.data.price?.longName || ticker}.
          </p>
        </header>

        {/* Pasamos los datos procesados al dashboard */}
        <ValuationDashboard ticker={ticker} data={valuationData} />
        <CompanyOverview assetData={assetData} />
        <MarketAnalysis assetData={assetData} />
        <PerformanceChart assetData={assetData} />
        <DividendsSection assetData={assetData} />
        <FinancialHealth assetData={assetData} />
        <Profitability assetData={assetData} />
        <AnalystPerspectives assetData={assetData} />
        <Conclusion assetData={assetData} />

        <footer className="text-center mt-12 pt-8 border-t border-gray-200">
          <h3 className="font-bold mb-2 text-[#0A2342]">Aviso Legal</h3>
          <p className="text-xs text-[#849E8F] max-w-4xl mx-auto">
            El contenido de este informe tiene fines puramente educativos e
            informativos...
          </p>
        </footer>
      </div>
    </div>
  );
}
