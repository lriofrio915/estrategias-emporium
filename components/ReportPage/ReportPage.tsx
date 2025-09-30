// components/ReportPage/ReportPage.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { ApiAssetItem } from "@/types/api";
import CompanyOverview from "../CompanyOverview/CompanyOverview";
import PerformanceChart from "../PerformanceChart/PerformanceChart";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorDisplay from "../Shared/ErrorDisplay";
import ScrollToTopButton from "@/components/ScrollToTopButton/ScrollToTopButton";
import GeminiAnalysis from "../GeminiAnalysis/GeminiAnalysis";
interface ReportPageProps {
  ticker: string;
}

export default function ReportPage({ ticker }: ReportPageProps) {
  const [assetData, setAssetData] = useState<ApiAssetItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const assetResponse = await fetch(
        `/api/stocks?tickers=${ticker}&fullData=true`
      );

      if (!assetResponse.ok)
        throw new Error(`Fallo al obtener los datos de ${ticker}.`);

      const assetApiResponse = await assetResponse.json();
      if (assetApiResponse.success && assetApiResponse.data?.length > 0) {
        setAssetData(assetApiResponse.data[0]);
      } else {
        throw new Error(
          assetApiResponse.message || `No se encontraron datos para ${ticker}.`
        );
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    if (ticker) {
      fetchAllData();
    }
  }, [fetchAllData, ticker]);

  if (loading) return <LoadingSpinner ticker={ticker} />;
  if (error) return <ErrorDisplay error={error} />;

  if (!assetData) {
    return (
      <ErrorDisplay
        error={`No se pudieron cargar los datos necesarios para ${ticker}.`}
      />
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

        <ScrollToTopButton />
        <CompanyOverview assetData={assetData} />
        <PerformanceChart assetData={assetData} />
        <GeminiAnalysis assetData={assetData} />

        <footer className="text-center mt-12 pt-8 border-t border-gray-200">
          <h3 className="font-bold mb-2 text-[#0A2342]">Aviso Legal</h3>
          <p className="text-xs text-[#849E8F] max-w-4xl mx-auto">
            El contenido de este informe es educativo...
          </p>
        </footer>
      </div>
    </div>
  );
}
