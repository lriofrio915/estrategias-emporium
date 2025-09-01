"use client";

import React from "react";
import PreMarketTable from "../../../components/PreMarketTable/PreMarketTable";
import EconomicIndicatorsTable from "@/components/EconomicIndicatorsTable/EconomicIndicatorsTable";
import YieldCurveChart from "@/components/YieldCurveChart/YieldCurveChart";
import EconomicCalendar from "@/components/EconomicCalendar/EconomicCalendar";
import NewsFeed from "@/components/NewsFeed/NewsFeed";

export default function NewYorkPreMarketPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 pt-20 sm:pt-24 lg:pt-32">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-4">
          Pre-Mercado de Nueva York
        </h1>
        <p className="text-base sm:text-lg text-center text-gray-400 mb-8 max-w-2xl mx-auto">
          Un vistazo rápido a los datos económicos y los movimientos clave que
          sucedieron mientras el mercado de EE.UU. estaba cerrado.
        </p>

        <PreMarketTable />
        <EconomicIndicatorsTable/>
        <YieldCurveChart/>
        <EconomicCalendar/>
        <NewsFeed/>
      </div>
    </div>
  );
}
