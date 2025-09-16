"use client";

import { useState, useEffect, useCallback } from "react";
import { ApiAssetItem } from "@/types/api";
import CompanyOverview from "../CompanyOverview/CompanyOverview";
import MarketAnalysis from "../MarketAnalysis/MarketAnalysis";
import PerformanceChart from "../PerformanceChart/PerformanceChart";
import DividendsSection from "../DividendsSection/DividendsSection";
import FinancialHealth from "../FinancialHealth/FinancialHealth";
import Profitability from "../Profitability/Profitability";
import AnalystPerspectives from "../AnalystPerspectives/AnalystPerspectives";
import Conclusion from "../Conclusion/Conclusion";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorDisplay from "../Shared/ErrorDisplay";
import ValuationDashboard, {
  ValuationDashboardData,
} from "../ValuationDashboard/ValuationDashboard";
import FutureFinancialTable, {
  FinancialData,
} from "../FutureFinancialTable/FutureFinancialTable";

interface ReportPageProps {
  ticker: string;
}

export default function ReportPage({ ticker }: ReportPageProps) {
  const [assetData, setAssetData] = useState<ApiAssetItem | null>(null);
  const [futureFinancials, setFutureFinancials] =
    useState<FinancialData | null>(null);
  const [valuationDashboardData, setValuationDashboardData] =
    useState<ValuationDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        assetResponse,
        incomeResponse,
        balanceResponse,
        cashFlowResponse,
        keyStatisticsResponse,
      ] = await Promise.all([
        fetch(`${window.location.origin}/api/${ticker}`),
        fetch(`/api/income-statement?ticker=${ticker}`),
        fetch(`/api/balance-sheet?ticker=${ticker}`),
        fetch(`/api/free-cash-flow?ticker=${ticker}`),
        fetch(`/api/key-statistics?ticker=${ticker}`),
      ]);

      // --- 1. PROCESAR RESPUESTA DEL INFORME PRINCIPAL ---
      if (!assetResponse.ok) {
        throw new Error(`Fallo al obtener los datos principales de ${ticker}.`);
      }
      const apiAssetResponse = await assetResponse.json();

      if (apiAssetResponse.success === false) {
        throw new Error(
          apiAssetResponse.message || "Error desconocido al obtener datos."
        );
      }

      if (apiAssetResponse.assetData && apiAssetResponse.assetData.length > 0) {
        setAssetData(apiAssetResponse.assetData[0]);
      } else {
        throw new Error(`No se encontraron datos para ${ticker}.`);
      }

      // --- 2. PROCESAR DATOS PARA TABLAS FINANCIERAS (Future & Valuation) ---
      if (
        !incomeResponse.ok ||
        !balanceResponse.ok ||
        !cashFlowResponse.ok ||
        !keyStatisticsResponse.ok
      ) {
        throw new Error(
          "No se pudieron obtener todos los datos financieros históricos y de valoración."
        );
      }

      const incomeData = await incomeResponse.json();
      const balanceData = await balanceResponse.json();
      const cashFlowData = await cashFlowResponse.json();
      const keyStatisticsData = await keyStatisticsResponse.json();

      // Combinar datos para FutureFinancialTable
      const combinedFutureData: FinancialData = {
        headers: incomeData.headers,
        metrics: {
          ...incomeData.metrics,
          ...balanceData.metrics,
          ...cashFlowData.metrics,
          enterpriseValue:
            keyStatisticsData.metrics.enterpriseValue?.map((v: number) =>
              v !== 0 ? v : "N/A"
            ) || [],
        },
      };
      setFutureFinancials(combinedFutureData);

      // Combinar datos para ValuationDashboard
      const valuationDataForDashboard: ValuationDashboardData = {
        projectionsData: {
          totalRevenue: incomeData.metrics.totalRevenue,
          ebit: incomeData.metrics.ebit,
          taxRateForCalcs: incomeData.metrics.taxRateForCalcs,
          basicAverageShares: incomeData.metrics.basicAverageShares,
          pretaxIncome: incomeData.metrics.pretaxIncome,
        },
        multiplesData: {
          trailingPE: keyStatisticsData.metrics.trailingPE?.[0],
          enterpriseValue: keyStatisticsData.metrics.enterpriseValue?.[0],
          ebitda: incomeData.metrics.ebitda?.[0],
          ebit: incomeData.metrics.ebit?.[0],
          freeCashFlow: cashFlowData.metrics.freeCashFlow?.[0],
        },
        currentPrice:
          apiAssetResponse.assetData[0]?.data.price?.regularMarketPrice || null,
      };
      setValuationDashboardData(valuationDataForDashboard);
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
    fetchAllData();
  }, [fetchAllData]);

  if (loading) return <LoadingSpinner ticker={ticker} />;
  if (error) return <ErrorDisplay error={error} />;
  if (!assetData)
    return <ErrorDisplay error={`No se encontraron datos para ${ticker}.`} />;

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

        <ValuationDashboard ticker={ticker} data={valuationDashboardData} />
        <CompanyOverview assetData={assetData} />
        <MarketAnalysis assetData={assetData} />
        <PerformanceChart assetData={assetData} />
        <DividendsSection assetData={assetData} />
        <FinancialHealth assetData={assetData} />
        <Profitability assetData={assetData} />
        <AnalystPerspectives assetData={assetData} />
        <Conclusion assetData={assetData} />
        <FutureFinancialTable ticker={ticker} data={futureFinancials} />

        <footer className="text-center mt-12 pt-8 border-t border-gray-200">
          <h3 className="font-bold mb-2 text-[#0A2342]">Aviso Legal</h3>
          <p className="text-xs text-[#849E8F] max-w-4xl mx-auto">
            El contenido de este informe tiene fines puramente educativos e
            informativos y no constituye en ningún caso asesoramiento de
            inversión.
          </p>
        </footer>
      </div>
    </div>
  );
}
