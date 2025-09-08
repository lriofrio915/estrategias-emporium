"use client";

import { useState, useEffect } from "react";
import { ApiAssetItem } from "@/types/api";
import DataListItem from "../Shared/DataListItem";
import { translateText } from "@/app/actions/translateActions";
import NetIncomeChart from "../NetIncomeChart/NetIncomeChart";
import TotalRevenueChart from "../TotalRevenueChart/TotalRevenueChart";

interface CompanyOverviewProps {
  assetData: ApiAssetItem;
}

export default function CompanyOverview({ assetData }: CompanyOverviewProps) {
  const { price, assetProfile } = assetData.data;
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
            {/* Reintegración de Empleados */}
            <DataListItem
              label="Empleados a tiempo completo"
              value={assetProfile?.fullTimeEmployees}
              format="number"
            />
            {/* Reintegración de Ubicación */}
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

        {/* Sección de logo de Emporium */}
        <div>
          <TotalRevenueChart assetData={assetData} />
          <NetIncomeChart assetData={assetData} />
        </div>
      </div>
    </section>
  );
}