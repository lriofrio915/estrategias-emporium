// components/CompanyOverview/CompanyOverview.tsx
"use client";

import { useState, useEffect } from "react";
import { ApiAssetItem } from "@/types/api";
import DataListItem from "../Shared/DataListItem";
import { translateText } from "@/app/actions/translateActions";

interface CompanyOverviewProps {
  assetData: ApiAssetItem;
}

export default function CompanyOverview({ assetData }: CompanyOverviewProps) {
  const { price, assetProfile, financialHistory } = assetData.data;
  const companyName = price?.longName || assetData.ticker;
  const [translatedSummary, setTranslatedSummary] = useState<string>("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string>("");

  useEffect(() => {
    const translateBusinessSummary = async () => {
      const summaryText = assetProfile?.longBusinessSummary;
      if (summaryText) {
        setIsTranslating(true);
        setTranslationError("");

        const result = await translateText(summaryText, "es");

        if (result.translatedText) {
          setTranslatedSummary(result.translatedText);
        } else {
          console.error("Error traduciendo:", result.error);
          setTranslationError(
            "Error en la traducción. Mostrando texto original."
          );
          setTranslatedSummary(summaryText);
        }
        setIsTranslating(false);
      }
    };

    translateBusinessSummary();
  }, [assetProfile?.longBusinessSummary]);

  // Verificar si hay datos financieros históricos
  const hasFinancialHistory = financialHistory && financialHistory.length > 0;

  if (!assetProfile && !price) {
    return (
      <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
        <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
          1. Visión General de la Empresa
        </h2>
        <p className="text-center text-gray-500">Información no disponible</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
      <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
        1. Visión General de la Empresa
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-2xl font-semibold text-[#0A2342] mb-4">
            Acerca de {companyName}
          </h3>

          {translationError && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
              <p>{translationError}</p>
            </div>
          )}

          {isTranslating ? (
            <div className="animate-pulse space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          ) : translatedSummary ? (
            <p className="text-gray-700 leading-relaxed mb-4">
              <span className="font-semibold">Descripción:</span>{" "}
              <span className="highlight-api">{translatedSummary}</span>
            </p>
          ) : assetProfile?.longBusinessSummary ? (
            <p className="text-gray-700 leading-relaxed mb-4">
              <span className="font-semibold">Descripción:</span>{" "}
              <span className="highlight-api">
                {assetProfile.longBusinessSummary}
              </span>
            </p>
          ) : null}

          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <DataListItem
              label="Sector"
              value={assetProfile?.sector}
              format="text"
            />
            <DataListItem
              label="Industria"
              value={assetProfile?.industry}
              format="text"
            />
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
            <DataListItem
              label="Empleados a tiempo completo"
              value={assetProfile?.fullTimeEmployees}
              format="number"
            />
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
        
        {/* Sección de gráficos financieros */}
        <div className="space-y-6">
          {hasFinancialHistory ? (
            <>
              {/* Información financiera resumida */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-800 mb-3 text-center">
                  Resumen Financiero
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold">Último FCF</p>
                    <p className="text-blue-600 font-bold">
                      ${financialHistory[0]?.freeCashFlow?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Deuda Actual</p>
                    <p className="text-red-600 font-bold">
                      ${financialHistory[0]?.totalDebt?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Patrimonio</p>
                    <p className="text-green-600 font-bold">
                      ${financialHistory[0]?.totalEquity?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">D/E Ratio</p>
                    <p className="text-purple-600 font-bold">
                      {financialHistory[0]?.debtToEquity?.toFixed(1) || 'N/A'}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Mensaje informativo */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  📊 Datos Financieros Disponibles
                </h4>
                <p className="text-sm text-gray-600">
                  Los gráficos detallados de Free Cash Flow y Deuda se muestran 
                  en las secciones inferiores de la página. Aquí puedes ver un 
                  resumen de los últimos datos disponibles.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Período: {financialHistory.length} años históricos
                </p>
              </div>
            </>
          ) : (
            <div className="bg-yellow-50 p-6 rounded-lg text-center">
              <div className="text-yellow-600 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-yellow-800 mb-2">
                Datos Financieros No Disponibles
              </h4>
              <p className="text-sm text-yellow-600 mb-3">
                La información histórica de Free Cash Flow y Deuda no está disponible 
                para esta empresa en este momento.
              </p>
              <p className="text-xs text-yellow-500">
                Esto puede deberse a restricciones de la API o a que la empresa 
                no reporta estos datos públicamente.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sección para gráficos completos (fuera del grid de 2 columnas) */}
      {hasFinancialHistory && (
        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-[#0A2342] mb-6 text-center">
            Análisis Financiero Detallado
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-xl font-semibold text-[#0A2342] mb-4 text-center">
                Free Cash Flow
              </h4>
              <div className="h-80">
                <div className="text-center py-10 text-gray-500">
                  <p>Gráfico de Free Cash Flow (próximamente)</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-xl font-semibold text-[#0A2342] mb-4 text-center">
                Histórico de Deuda
              </h4>
              <div className="h-80">
                <div className="text-center py-10 text-gray-500">
                  <p>Gráfico de Deuda (próximamente)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}