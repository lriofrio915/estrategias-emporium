"use client";

import { ApiAssetItem } from "@/types/api";
import DataListItem from "../Shared/DataListItem";
import NetIncomeChart from "../NetIncomeChart/NetIncomeChart";
import TotalRevenueChart from "../TotalRevenueChart/TotalRevenueChart";

interface CompanyOverviewProps {
  assetData: ApiAssetItem;
}

export default function CompanyOverview({ assetData }: CompanyOverviewProps) {
  const { price, assetProfile } = assetData.data;
  const companyName = price?.longName || assetData.ticker;

  // Si no hay datos de perfil o precio, muestra un mensaje.
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

          {/* Muestra directamente el resumen del negocio si existe */}
          {assetProfile?.longBusinessSummary && (
            <p className="text-gray-700 leading-relaxed mb-4">
              <span className="font-semibold">Descripción:</span>{" "}
              <span className="highlight-api">
                {assetProfile.longBusinessSummary}
              </span>
            </p>
          )}

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

        <div>
          <TotalRevenueChart assetData={assetData} />
          <NetIncomeChart assetData={assetData} />
        </div>
      </div>
    </section>
  );
}
