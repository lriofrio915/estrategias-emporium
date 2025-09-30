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
import {
  mockCompanyData,
  mockAdvancedAnalysisData,
  mockAiAnalysis,
  mockFundamentalScores,
  mockRiskScores,
  mockDcfValuationResult,
} from "@/lib/stock-scanner/mock-data";

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

    // --- SIMULACIÓN DE LLAMADA A LA API ---
    setTimeout(() => {
      if (ticker.toUpperCase() === "ERROR") {
        setError(
          "No se pudo encontrar el ticker solicitado. Inténtelo de nuevo."
        );
        setIsLoading(false);
        return;
      }

      // Usamos los datos de muestra para poblar el estado
      setCompanyData(mockCompanyData);
      setAdvancedData(mockAdvancedAnalysisData);
      setAiAnalysis(mockAiAnalysis);
      setIsLoading(false);
    }, 3000);
  }, []);

  const fundamentalScores: FundamentalScores | null = useMemo(() => {
    if (!companyData || !advancedData) return null;
    // En una implementación real: return calculateFundamentalScores(companyData, advancedData);
    return mockFundamentalScores;
  }, [companyData, advancedData]);

  const riskAnalysisResult: {
    scores: RiskScores | null;
    error: string | null;
  } = useMemo(() => {
    if (!advancedData) return { scores: null, error: null };
    // En una implementación real: return calculateRiskScores(advancedData);
    return { scores: mockRiskScores, error: null };
  }, [advancedData]);

  useEffect(() => {
    if (advancedData && companyData) {
      // En una implementación real: const valuation = calculateDcfValuation(...);
      setDcfResult({ valuation: mockDcfValuationResult, error: null });
    }
  }, [advancedData, companyData]);

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
        Estamos recopilando y procesando los datos. Esto puede tardar un
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
                  {/* Header */}
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

                  {/* Key Metrics */}
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

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                      <StockPriceChart data={companyData.historicalPrices} />
                    </div>
                    <div className="lg:col-span-2">
                      <RevenueChart data={companyData.incomeStatement} />
                    </div>
                  </div>

                  {/* AI Analysis & Financial Statements */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AiAnalysis analysis={aiAnalysis} />
                    <FinancialStatementTabs data={companyData} />
                  </div>

                  {/* Advanced Analysis Sections */}
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

// Añadimos una pequeña animación de entrada en globals.css
// Asegúrate de que tu `globals.css` tenga lo siguiente:
/*
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .animate-fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
}
*/
