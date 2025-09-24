// components/GeminiAnalysis/GeminiAnalysis.tsx
"use client";

import { useState } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { generateValueInvestingAnalysis } from "@/app/actions/geminiActions";
import { ApiAssetItem } from "@/types/api";

interface GeminiAnalysisProps {
  assetData: ApiAssetItem;
}

export default function GeminiAnalysis({ assetData }: GeminiAnalysisProps) {
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis("");

    try {
      const result = await generateValueInvestingAnalysis(assetData);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      setError(
        "No se pudo generar el análisis. La API puede estar ocupada o la configuración necesita revisión."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12 border-2 border-transparent border-dashed hover:border-blue-400 transition-all duration-300">
      <div className="text-center">
        <SparklesIcon className="h-12 w-12 mx-auto text-yellow-500" />
        <h2 className="text-3xl font-bold text-[#0A2342] mt-4 mb-2">
          Análisis Fundamental con IA
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Obtén un análisis de inversión de valor, inspirado en las estrategias
          de Warren Buffett, Peter Lynch y Charlie Munger, generado por Gemini
          AI.
        </p>
      </div>

      {/* Botón para generar el análisis si aún no se ha generado */}
      {!analysis && !isLoading && (
        <div className="text-center">
          <button
            onClick={handleGenerateAnalysis}
            disabled={isLoading}
            className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out cursor-pointer"
          >
            <SparklesIcon className="h-5 w-5 mr-2" />
            {isLoading ? "Analizando..." : "Generar Análisis de Valor"}
          </button>
        </div>
      )}

      {/* Estado de Carga */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-700 font-semibold">
            Contactando a nuestro analista de IA... por favor espera.
          </p>
        </div>
      )}

      {/* Muestra de Error */}
      {error && (
        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Muestra del resultado del análisis */}
      {analysis && !isLoading && (
        <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-[#0A2342] mb-4">
            Veredicto del Inversor (IA):
          </h3>
          {/* Usamos 'whitespace-pre-wrap' para respetar los saltos de línea y párrafos de la IA */}
          <div
            className="text-gray-800 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: analysis.replace(/\n/g, "<br />"),
            }}
          />
        </div>
      )}
    </section>
  );
}
