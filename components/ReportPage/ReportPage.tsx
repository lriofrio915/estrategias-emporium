"use client";

import { useState, useEffect, useCallback } from "react";
import { ApiAssetItem, RawYahooFinanceIncomeStatementItem } from "@/types/api";
import {
  ValuationDashboardData,
  processApiDataForDashboard,
} from "@/types/valuation";
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
      const mainApiUrl = `/api/${ticker}`;
      const mainResponse = await fetch(mainApiUrl);
      if (!mainResponse.ok)
        throw new Error(`Fallo al obtener los datos principales de ${ticker}.`);

      const mainApiResponse = await mainResponse.json();
      if (mainApiResponse.success === false)
        throw new Error(
          mainApiResponse.message || "Error desconocido al obtener datos."
        );
      if (!mainApiResponse.assetData || mainApiResponse.assetData.length === 0)
        throw new Error(`No se encontraron datos para ${ticker}.`);

      const rawAssetData: ApiAssetItem = mainApiResponse.assetData[0];

      const incomeStatementScraperUrl = `/api/income-statement?ticker=${ticker}`;
      const incomeScraperResponse = await fetch(incomeStatementScraperUrl);

      if (incomeScraperResponse.ok) {
        const scrapedIncomeData = await incomeScraperResponse.json();

        console.log(
          "DATOS CRUDOS DEL SCRAPER (/api/income-statement):",
          scrapedIncomeData
        );

        if (scrapedIncomeData && scrapedIncomeData.metrics) {
          console.log(
            "Éxito: Datos del Income Statement obtenidos vía scraping. Fusionando..."
          );

          const transformedHistory: RawYahooFinanceIncomeStatementItem[] = [];
          // ***** INICIO DE LA CORRECCIÓN *****
          // Se elimina .slice(1) para procesar TODOS los datos del scraper, incluyendo TTM.
          const headers = scrapedIncomeData.headers;
          // ***** FIN DE LA CORRECCIÓN *****

          for (let i = 0; i < headers.length; i++) {
            const item: RawYahooFinanceIncomeStatementItem = {
              maxAge: 1,
              endDate: { fmt: headers[i], raw: 0 },
              basicAverageShares: {
                raw: scrapedIncomeData.metrics.basicAverageShares?.[i] || 0,
              },
              dilutedAverageShares: {
                raw: scrapedIncomeData.metrics.dilutedAverageShares?.[i] || 0,
              },
              totalRevenue: {
                raw: scrapedIncomeData.metrics.totalRevenue?.[i] || 0,
              },
              ebit: { raw: scrapedIncomeData.metrics.ebit?.[i] || 0 },
              netIncome: { raw: scrapedIncomeData.metrics.netIncome?.[i] || 0 },
              incomeTaxExpense: {
                raw:
                  scrapedIncomeData.metrics.taxEffectOfUnusualItems?.[i] || 0,
              },
              incomeBeforeTax: {
                raw: scrapedIncomeData.metrics.pretaxIncome?.[i] || 0,
              },
            };
            transformedHistory.push(item);
          }

          if (rawAssetData.data.incomeStatementHistory) {
            rawAssetData.data.incomeStatementHistory.incomeStatements =
              transformedHistory;
          } else {
            rawAssetData.data.incomeStatementHistory = {
              incomeStatements: transformedHistory,
              maxAge: 1,
            };
          }
        }
      } else {
        console.warn(
          "La API de scraping del Income Statement falló. Se usarán los datos por defecto."
        );
      }

      setAssetData(rawAssetData);
      const processedData = processApiDataForDashboard(rawAssetData);
      setValuationData(processedData);
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

  // ... (El resto del componente es idéntico)
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
