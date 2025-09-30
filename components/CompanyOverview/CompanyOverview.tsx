// components/CompanyOverview/CompanyOverview.tsx
"use client";

import { ApiAssetItem } from "@/types/api";
import NetIncomeChart from "../NetIncomeChart/NetIncomeChart";
import TotalRevenueChart from "../TotalRevenueChart/TotalRevenueChart";

interface CompanyOverviewProps {
  assetData: ApiAssetItem;
}

export default function CompanyOverview({ assetData }: CompanyOverviewProps) {
  const { price, assetProfile } = assetData.data;

  if (!assetProfile && !price) {
    return (
      <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
        <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
          Visión General de la Empresa
        </h2>
        <p className="text-center text-gray-500">Información no disponible</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
      <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
        Visión General de la Empresa
      </h2>

      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <TotalRevenueChart assetData={assetData} />
          </div>
          <div>
            <NetIncomeChart assetData={assetData} />
          </div>
        </div>
      </div>
    </section>
  );
}
