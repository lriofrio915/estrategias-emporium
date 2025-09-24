// components/ReportPage/ReportPage.tsx
"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { ApiAssetItem, YahooFinanceRawValue } from "@/types/api";
import {
  ValuationMetrics,
  ValuationResult,
  ValuationResults,
} from "@/types/valuation";
import {
  getValuationMultiples,
  getFinancialAverages,
  calculateIntrinsicValue,
} from "@/app/actions/valuationActions";
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
import ValuationDashboard from "../ValuationDashboard/ValuationDashboard";
import ScrollToTopButton from "../ScrollToTopButton/ScrollToTopButton";
import GeminiAnalysis from "../GeminiAnalysis/GeminiAnalysis";

interface FinancialAverages {
  salesGrowth: string;
  ebitMargin: string;
  taxRate: string;
  sharesIncrease: string;
}

interface ReportPageProps {
  ticker: string;
}

const getRawValue = (
  value: number | YahooFinanceRawValue | undefined | null
): number => {
  if (typeof value === "object" && value !== null && "raw" in value) {
    return typeof value.raw === "number" ? value.raw : 0;
  }
  return typeof value === "number" ? value : 0;
};

export default function ReportPage({ ticker }: ReportPageProps) {
  const [assetData, setAssetData] = useState<ApiAssetItem | null>(null);
  const [financialAverages, setFinancialAverages] =
    useState<FinancialAverages | null>(null);
  const [valuationMultiples, setValuationMultiples] =
    useState<ValuationMetrics | null>(null);
  const [valuationResults, setValuationResults] =
    useState<ValuationResults | null>(null);
  const [marginOfSafety, setMarginOfSafety] = useState<string | null>(null);
  const [cagr, setCagr] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [targets, setTargets] = useState({
    per: 20,
    ev_ebitda: 16,
    ev_ebit: 16,
    ev_fcf: 20,
  });
  const [estimates, setEstimates] = useState({
    salesGrowth: 12,
    ebitMargin: 28,
    taxRate: 21,
    sharesIncrease: 0.05,
  });
  const [isCalculating, startTransition] = useTransition();

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [assetResponse, multiplesResult, averagesResult] =
        await Promise.all([
          fetch(`/api/stocks?tickers=${ticker}&fullData=true`),
          getValuationMultiples(ticker),
          getFinancialAverages(ticker),
        ]);

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

      if (multiplesResult.success) {
        setValuationMultiples(multiplesResult.data);
      } else {
        throw new Error(multiplesResult.error);
      }

      if (averagesResult.success) {
        setFinancialAverages(averagesResult.averages);
      } else {
        throw new Error(averagesResult.error);
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

  const handleCalculation = () => {
    if (!ticker || !assetData) return;
    setError(null);
    startTransition(async () => {
      const response = await calculateIntrinsicValue({
        ticker,
        targets,
        estimates,
      });
      if (response.success) {
        setValuationResults(response.results);
        const finalYear = Object.keys(response.results).pop()!;
        const finalResults: ValuationResult = response.results[finalYear];
        const finalAvgPrice =
          Object.values(finalResults).reduce((s, v) => s + v, 0) / 4;
        const currentPrice = getRawValue(
          assetData.data.price?.regularMarketPrice
        );
        if (currentPrice > 0) {
          const mos = ((finalAvgPrice - currentPrice) / currentPrice) * 100;
          setMarginOfSafety(mos.toFixed(2));
          const cagrValue =
            (Math.pow(finalAvgPrice / currentPrice, 5) - 1) * 100; // Corregido a 5 años
          setCagr(cagrValue);
        }
      } else {
        setError(response.error);
      }
    });
  };

  if (loading) return <LoadingSpinner ticker={ticker} />;
  if (error) return <ErrorDisplay error={error} />;
  if (!assetData || !valuationMultiples || !financialAverages) {
    return (
      <ErrorDisplay
        error={`No se pudieron cargar todos los datos necesarios para ${ticker}.`}
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

        <ValuationDashboard
          ticker={ticker}
          apiData={assetData.data}
          valuationMultiples={valuationMultiples}
          loadingMultiples={loading}
          financialAverages={financialAverages}
          estimates={estimates}
          setEstimates={setEstimates}
          targets={targets}
          setTargets={setTargets}
          handleCalculation={handleCalculation}
          isCalculating={isCalculating}
          valuationResults={valuationResults}
          marginOfSafety={marginOfSafety}
          cagr={cagr}
        />

        <CompanyOverview assetData={assetData} />
        <MarketAnalysis assetData={assetData} />
        <PerformanceChart assetData={assetData} />
        <DividendsSection assetData={assetData} />
        <FinancialHealth assetData={assetData} />
        <Profitability assetData={assetData} />
        <AnalystPerspectives assetData={assetData} />
        <Conclusion assetData={assetData} />
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
