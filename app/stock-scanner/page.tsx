// app/stock-scanner/page.tsx
"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  CompanyData,
  AdvancedAnalysisData,
  FundamentalScores,
  RiskScores,
  DcfValuationResult,
} from "@/types/stock-scanner";
import {
  calculateFundamentalScores,
  calculateRiskScores,
  calculateDcfValuation,
} from "@/lib/utils/financialCalculations";

// Importación de componentes de UI
import SearchBar from "@/components/stock-scanner/SearchBar";
import MetricCard from "@/components/stock-scanner/MetricCard";
import StockPriceChart from "@/components/stock-scanner/StockPriceChart";
import RevenueChart from "@/components/stock-scanner/RevenueChart";
import AiAnalysis from "@/components/stock-scanner/AiAnalysis";
import FinancialStatementTabs from "@/components/stock-scanner/FinancialStatementTabs";
import FundamentalAnalysis from "@/components/stock-scanner/FundamentalAnalysis";
import RiskAnalysis from "@/components/stock-scanner/RiskAnalysis";
import DcfAnalysis from "@/components/stock-scanner/DcfAnalysis";
import {
  LoaderIcon,
  BarChartIcon,
  DollarSignIcon,
  BriefcaseIcon,
  FileTextIcon,
  ActivityIcon,
  TrendingUpIcon,
  BuildingIcon,
  ScalesIcon,
} from "@/components/stock-scanner/Icons";

export default function StockScannerPage() {
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [advancedData, setAdvancedData] = useState<AdvancedAnalysisData | null>(
    null
  );
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTicker, setCurrentTicker] = useState<string>("");
  const [dcfResult, setDcfResult] = useState<{
    valuation: DcfValuationResult | null;
    error: string | null;
  }>({ valuation: null, error: null });
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (ticker: string) => {
    if (!ticker) return;
    setIsLoading(true);
    setError(null);
    setCompanyData(null);
    setAdvancedData(null);
    setAiAnalysis("");
    setDcfResult({ valuation: null, error: null });
    setCurrentTicker(ticker.toUpperCase());
    setHasSearched(true);

    try {
      const response = await fetch(`/api/stock-analysis/${ticker}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Error ${response.status} al contactar la API.`
        );
      }
      const data = await response.json();

      setCompanyData(data.companyData);
      setAdvancedData(data.advancedData);
      setAiAnalysis(data.aiAnalysis);
    } catch (e: unknown) {
      // CORRECCIÓN 1: de 'any' a 'unknown'
      // Verificamos si el error es una instancia de Error para acceder a 'message'
      if (e instanceof Error) {
        setError(
          e.message || "Ocurrió un error inesperado al obtener los datos."
        );
      } else {
        setError("Ocurrió un error inesperado al obtener los datos.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fundamentalScores: FundamentalScores | null = useMemo(() => {
    if (!companyData || !advancedData) return null;
    try {
      return calculateFundamentalScores(companyData, advancedData);
    } catch (e) {
      console.error("Error calculating fundamental scores:", e);
      return null;
    }
  }, [companyData, advancedData]);

  const riskAnalysisResult: {
    scores: RiskScores | null;
    error: string | null;
  } = useMemo(() => {
    if (!advancedData) return { scores: null, error: null };
    try {
      const scores = calculateRiskScores(advancedData);
      return { scores, error: null };
    } catch (e: unknown) {
      // CORRECCIÓN 2: de 'any' a 'unknown'
      let errorMessage =
        "Un error desconocido ocurrió al calcular las puntuaciones de riesgo.";
      // Verificamos si el error es una instancia de Error
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      console.error("Error calculating risk scores:", errorMessage);
      return { scores: null, error: errorMessage };
    }
  }, [advancedData]);

  useEffect(() => {
    if (advancedData && companyData) {
      try {
        if (advancedData.historicalFcf.length < 2) {
          throw new Error(
            "No hay suficientes datos históricos de Flujo de Caja Libre para una proyección fiable."
          );
        }
        const valuation = calculateDcfValuation(
          advancedData,
          companyData.keyMetrics.currentPrice,
          companyData
        );
        setDcfResult({ valuation, error: null });
      } catch (e: unknown) {
        // CORRECCIÓN 3: de 'any' a 'unknown'
        console.error("Error calculating DCF:", e);
        // Verificamos si el error es una instancia de Error
        const errorMessage =
          e instanceof Error
            ? e.message
            : "No se pudo calcular la valoración DCF.";
        setDcfResult({
          valuation: null,
          error: errorMessage,
        });
      }
    }
  }, [advancedData, companyData]);

  // Las funciones renderWelcomeState, renderLoadingState, y renderErrorState se mantienen igual

  const renderWelcomeState = () => (
    <div className="text-center py-20 px-6">
      <BarChartIcon className="mx-auto h-16 w-16 text-slate-500" />
      <h2 className="mt-6 text-2xl font-bold text-slate-100">
        Dashboard de Análisis Financiero
      </h2>
      <p className="mt-2 text-lg text-slate-400">
        Introduzca un ticker de acción (ej. AAPL, MSFT, GOOGL) para generar un
        análisis financiero completo.
      </p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="text-center py-20 px-6">
      <LoaderIcon className="mx-auto h-16 w-16 text-cyan-500 animate-spin" />
      <h2 className="mt-6 text-2xl font-bold text-slate-100">
        Generando Informe Financiero...
      </h2>
      <p className="mt-2 text-lg text-slate-400">
        La IA está recopilando y procesando los datos. Esto puede tardar un
        momento.
      </p>
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-20 px-6 bg-red-900/20 rounded-lg border border-red-500/30">
      <h2 className="text-2xl font-bold text-red-400">Falló el Análisis</h2>
      <p className="mt-2 text-lg text-red-400 max-w-2xl mx-auto">{error}</p>
    </div>
  );

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-24">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        <div className="mt-8">
          {!hasSearched
            ? renderWelcomeState()
            : isLoading
            ? renderLoadingState()
            : error
            ? renderErrorState()
            : companyData && (
                <div className="space-y-8 animate-fade-in">
                  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <h2 className="text-3xl font-bold text-slate-100">
                      {companyData.profile.name} ({companyData.profile.ticker})
                    </h2>
                    <p className="text-slate-400 mt-1">
                      {companyData.profile.exchange} |{" "}
                      {companyData.profile.sector}
                    </p>
                    <p className="mt-4 text-slate-300">
                      {companyData.profile.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard
                      title="Precio Actual"
                      value={companyData.keyMetrics.currentPrice}
                      format="currency_full"
                      icon={<TrendingUpIcon className="w-6 h-6" />}
                    />
                    <MetricCard
                      title="Cap. de Mercado"
                      value={companyData.keyMetrics.marketCap}
                      format="currency"
                      icon={<BriefcaseIcon className="w-6 h-6" />}
                    />
                    <MetricCard
                      title="Valor Empresa (EV)"
                      value={companyData.keyMetrics.enterpriseValue}
                      format="currency"
                      icon={<BuildingIcon className="w-6 h-6" />}
                    />
                    <MetricCard
                      title="Rent. por Dividendo"
                      value={companyData.keyMetrics.dividendYield}
                      format="percentage"
                      icon={<DollarSignIcon className="w-6 h-6" />}
                    />
                    <MetricCard
                      title="Ratio P/E"
                      value={companyData.keyMetrics.peRatio}
                      format="number"
                      icon={<ScalesIcon className="w-6 h-6" />}
                    />
                    <MetricCard
                      title="Ratio EV/EBITDA"
                      value={companyData.keyMetrics.evToEbitda}
                      format="number"
                      icon={<ScalesIcon className="w-6 h-6" />}
                    />
                    <MetricCard
                      title="BPA (EPS)"
                      value={companyData.keyMetrics.eps}
                      format="currency"
                      icon={<FileTextIcon className="w-6 h-6" />}
                    />
                    <MetricCard
                      title="Beta"
                      value={companyData.keyMetrics.beta}
                      format="number"
                      icon={<ActivityIcon className="w-6 h-6" />}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                      <StockPriceChart data={companyData.historicalPrices} />
                    </div>
                    <div className="lg:col-span-2">
                      <RevenueChart data={companyData.incomeStatement} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AiAnalysis analysis={aiAnalysis} />
                    <FinancialStatementTabs data={companyData} />
                  </div>

                  <div className="space-y-8 pt-8 border-t-2 border-slate-700/50">
                    {fundamentalScores ? (
                      <FundamentalAnalysis
                        scores={fundamentalScores}
                        ticker={currentTicker}
                      />
                    ) : (
                      <div className="text-center py-10 px-6 bg-slate-800 rounded-lg">
                        <h3 className="text-xl font-bold text-slate-100">
                          Análisis Fundamental No Disponible
                        </h3>
                        <p className="mt-2 text-slate-400">
                          No se pudieron calcular las puntuaciones
                          fundamentales.
                        </p>
                      </div>
                    )}

                    {riskAnalysisResult.scores ? (
                      <RiskAnalysis
                        scores={riskAnalysisResult.scores}
                        ticker={currentTicker}
                      />
                    ) : (
                      <div className="text-center py-10 px-6 bg-slate-800 rounded-lg">
                        <h3 className="text-xl font-bold text-slate-100">
                          Análisis de Riesgo No Disponible
                        </h3>
                        <p className="mt-2 text-slate-400">
                          {riskAnalysisResult.error ||
                            "No se pudieron calcular las puntuaciones de riesgo."}
                        </p>
                      </div>
                    )}

                    {dcfResult.valuation ? (
                      <DcfAnalysis
                        result={dcfResult.valuation}
                        currentPrice={companyData.keyMetrics.currentPrice}
                      />
                    ) : dcfResult.error ? (
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg text-center">
                        <h3 className="text-2xl font-bold text-slate-100 mb-2">
                          Valoración DCF No Disponible
                        </h3>
                        <p className="text-slate-400 max-w-md mx-auto">
                          {dcfResult.error}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
        </div>
      </div>
    </div>
  );
}
