// components/DividendsSection/DividendsSection.tsx
import { ApiAssetItem } from "@/types/api";
import DataListItem from "../Shared/DataListItem";

interface DividendsSectionProps {
  assetData: ApiAssetItem;
}

export default function DividendsSection({ assetData }: DividendsSectionProps) {
  // Desestructuramos los datos directamente sin 'as any'
  // Esto asegura que TypeScript verifique las propiedades
  const { summaryDetail, defaultKeyStatistics, price } = assetData.data;
  const currencySymbol = price?.currencySymbol || "€";

  return (
    <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
      <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
        3. Rendimiento y Dividendos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
        <div>
          <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
            Dividendos
          </h3>
          <ul className="space-y-2">
            <DataListItem
              label="Tasa de Dividendo"
              value={summaryDetail?.dividendRate}
              format="currency"
              currencySymbol={currencySymbol}
            />
            <DataListItem
              label="Rendimiento de Dividendo"
              value={summaryDetail?.dividendYield}
              format="percentage"
            />
            <DataListItem
              label="Fecha Ex-Dividendo"
              value={summaryDetail?.exDividendDate}
              format="date"
            />
            <DataListItem
              label="Payout Ratio"
              value={summaryDetail?.payoutRatio}
              format="percentage"
            />
            <DataListItem
              label="Rendimiento Prom. 5 Años"
              value={summaryDetail?.fiveYearAvgDividendYield}
              format="percentage"
            />
            <DataListItem
              label="Último Valor de Dividendo"
              value={defaultKeyStatistics?.lastDividendValue}
              format="currency"
              currencySymbol={currencySymbol}
            />
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
            Volatilidad y Riesgo
          </h3>
          <ul className="space-y-2">
            <DataListItem
              label="Beta"
              // `beta` está en `summaryDetail` o `defaultKeyStatistics`.
              // Ambas opciones son válidas, pero usaremos `summaryDetail` para consistencia.
              value={summaryDetail?.beta}
              format="number"
            />
            <DataListItem
              label="Cambio vs. S&P 500 (52 Semanas)"
              // Aquí la propiedad tiene un nombre peculiar: "52WeekChange"
              value={defaultKeyStatistics?.["52WeekChange"]}
              format="percentage"
            />
          </ul>
        </div>
      </div>
    </section>
  );
}
