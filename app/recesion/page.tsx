"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/RecessionDashboard/Sidebar";
import { KpiCard } from "@/components/RecessionDashboard/KpiCard";
import { DetailedTable } from "@/components/RecessionDashboard/DetailedTable";
import { IndicatorChart } from "@/components/RecessionDashboard/IndicatorChart";
import { generateGeminiBrief } from "@/app/actions/geminiActions";
import { fetchAllFredSeries } from "../../app/actions/fredActions"; // <-- Importamos la nueva Server Action
import type { ProcessedIndicator } from "../../lib/reccesion/types";

export default function RecessionDashboardPage() {
  const [processedData, setProcessedData] = useState<ProcessedIndicator[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [geminiBrief, setGeminiBrief] = useState<string>("");
  const [geminiLoading, setGeminiLoading] = useState<boolean>(false);
  const [geminiError, setGeminiError] = useState<string>("");
  const [showCharts, setShowCharts] = useState<boolean>(true);
  const [showTable, setShowTable] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Llamamos a la Server Action para obtener todos los datos
      const results = await fetchAllFredSeries();
      if (results.error) {
        throw new Error(results.error);
      }
      setProcessedData(results.data || []);
    } catch (error) {
      console.error("Error al obtener o procesar datos:", error);
      setError(
        error instanceof Error ? error.message : "Un error desconocido ocurrió."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerateBrief = async () => {
    if (!processedData.length) return;
    setGeminiLoading(true);
    setGeminiError("");
    setGeminiBrief("");
    try {
      const summaryData = processedData.map((d) => ({
        Indicador: d.name,
        Tipo: d.kind,
        Ticker: d.id,
        Fecha: d.latest_date,
        Último: isNaN(d.latest_value)
          ? null
          : parseFloat(d.latest_value.toFixed(2)),
        YoY: isNaN(d.yoy) ? null : parseFloat(d.yoy.toFixed(2)),
        Secuencial: isNaN(d.mom) ? null : parseFloat(d.mom.toFixed(2)),
        "Aceleración YoY": isNaN(d.accel)
          ? null
          : parseFloat(d.accel.toFixed(2)),
        Fase: d.phase,
        FRED: d.fred_url,
      }));
      const brief = await generateGeminiBrief(summaryData);
      setGeminiBrief(brief);
    } catch (error) {
      console.error("Error al generar el resumen de Gemini:", error);
      setGeminiError(
        error instanceof Error ? error.message : "Ocurrió un error desconocido."
      );
    } finally {
      setGeminiLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-900">
      <Sidebar
        showCharts={showCharts}
        setShowCharts={setShowCharts}
        showTable={showTable}
        setShowTable={setShowTable}
        onGenerateBrief={handleGenerateBrief}
        isGenerating={geminiLoading}
      />
      <main className="flex-1 p-4 md:p-8 space-y-8">
        <header>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            📊 Dashboard del Ciclo Económico de EE.UU.
          </h1>
          <p className="text-gray-400 mt-2">
            Fuentes oficiales de FRED. La Fase 4 incluye 🟠 (débil pero
            mejorando).
          </p>
        </header>

        {loading && (
          <div className="text-center text-white py-10">
            Cargando datos de FRED...
          </div>
        )}

        {error && (
          <div className="bg-red-800/50 text-red-300 p-4 rounded-lg text-center">
            <p className="font-bold">Error al cargar los datos:</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <section
              id="kpi-board"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
            >
              {processedData.map((indicator) => (
                <KpiCard key={indicator.id} indicator={indicator} />
              ))}
            </section>

            {showTable && (
              <section id="details">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Detalles
                </h2>
                <DetailedTable data={processedData} />
              </section>
            )}

            {showCharts && (
              <section id="charts">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Series (Últimos ~10 Años)
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {processedData.map((indicator) => (
                    <IndicatorChart key={indicator.id} indicator={indicator} />
                  ))}
                </div>
              </section>
            )}

            <section id="gemini-brief">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Resumen Automatizado (IA)
              </h2>
              <div className="bg-gray-800 rounded-lg p-6 min-h-[150px]">
                {geminiLoading && (
                  <p className="text-gray-400 animate-pulse">
                    La IA está analizando los datos...
                  </p>
                )}
                {geminiError && (
                  <p className="text-red-400">Error: {geminiError}</p>
                )}
                {geminiBrief && (
                  <p className="text-gray-200 whitespace-pre-wrap">
                    {geminiBrief}
                  </p>
                )}
                {!geminiLoading && !geminiBrief && !geminiError && (
                  <p className="text-gray-500">
                    Haz clic en "Generar Resumen con IA" en la barra lateral
                    para obtener un análisis.
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
