// components/MarketAnalysis/MarketAnalysis.tsx
import { ApiAssetItem } from "@/types/api";
import DataListItem from "../Shared/DataListItem";

interface MarketAnalysisProps {
  assetData: ApiAssetItem;
}

export default function MarketAnalysis({ assetData }: MarketAnalysisProps) {
  const { price, summaryDetail, defaultKeyStatistics } = assetData.data;
  const currencySymbol = price?.currencySymbol || "€";

  return (
    <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
      <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
        2. Análisis de Mercado y Precios
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-700">
        <div>
          <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
            Rendimiento Actual
          </h3>
          <ul className="space-y-2">
            <DataListItem
              label="Bolsa"
              value={price?.exchangeName}
              format="text"
            />
            <DataListItem
              label="Precio Actual"
              value={price?.regularMarketPrice}
              format="currency"
              currencySymbol={currencySymbol}
            />
            <DataListItem
              label="Cambio Diario"
              value={price?.regularMarketChange}
              format="currency"
              currencySymbol={currencySymbol}
            />
            <DataListItem
              label="Cambio %"
              value={price?.regularMarketChangePercent}
              format="percentage"
            />
            <DataListItem
              label="Última Actualización"
              value={price?.regularMarketTime}
              format="date"
            />
            <DataListItem
              label="Cierre Anterior"
              value={summaryDetail?.previousClose}
              format="currency"
              currencySymbol={currencySymbol}
            />
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
            Rangos y Volumen
          </h3>
          <ul className="space-y-2">
            <DataListItem
              label="Mínimo Diario"
              value={summaryDetail?.dayLow}
              format="currency"
              currencySymbol={currencySymbol}
            />
            <DataListItem
              label="Máximo Diario"
              value={summaryDetail?.dayHigh}
              format="currency"
              currencySymbol={currencySymbol}
            />
            <DataListItem
              label="Mínimo 52 Semanas"
              value={summaryDetail?.fiftyTwoWeekLow}
              format="currency"
              currencySymbol={currencySymbol}
            />
            <DataListItem
              label="Máximo 52 Semanas"
              value={summaryDetail?.fiftyTwoWeekHigh}
              format="currency"
              currencySymbol={currencySymbol}
            />
            <DataListItem
              label="Volumen"
              value={summaryDetail?.volume}
              format="number"
            />
            <DataListItem
              label="Volumen Promedio"
              value={summaryDetail?.averageVolume}
              format="number"
            />
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
            Ratios de Valoración
          </h3>
          <ul className="space-y-2">
            <DataListItem
              label="Capitalización"
              value={price?.marketCap}
              format="currency"
              currencySymbol={currencySymbol}
            />
            {/* Aquí está la corrección: Los ratios de P/E, P/S y Beta
            están en el objeto summaryDetail, no en defaultKeyStatistics */}
            <DataListItem
              label="P/E (Trailing)"
              value={summaryDetail?.trailingPE}
              format="number"
            />
            <DataListItem
              label="P/E (Forward)"
              value={summaryDetail?.forwardPE}
              format="number"
            />
            <DataListItem
              label="P/S (TTM)"
              value={summaryDetail?.priceToSalesTrailing12Months}
              format="number"
            />
            {/* Los siguientes valores (P/B y Beta) sí están en defaultKeyStatistics */}
            <DataListItem
              label="P/B"
              value={defaultKeyStatistics?.priceToBook}
              format="number"
            />
            <DataListItem
              label="Beta"
              value={defaultKeyStatistics?.beta}
              format="number"
            />
          </ul>
        </div>
      </div>
    </section>
  );
}
