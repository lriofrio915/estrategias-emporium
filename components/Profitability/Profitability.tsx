// components/Profitability/Profitability.tsx
import { ApiAssetItem } from "@/types/api";
import DataListItem from "../Shared/DataListItem";

interface ProfitabilityProps {
  assetData: ApiAssetItem;
}

export default function Profitability({ assetData }: ProfitabilityProps) {
  // Desestructuramos los datos directamente de assetData.data
  // Esto hace que el código sea más seguro y limpio
  const { financialData, defaultKeyStatistics, price } = assetData.data;
  const currencySymbol = price?.currencySymbol || "€";

  // La lógica de retorno temprano está bien, pero ahora es más precisa
  if (!financialData && !defaultKeyStatistics) {
    return null;
  }

  return (
    <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
      <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
        5. Rentabilidad y Crecimiento
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
        <div>
          <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
            Ingresos y Márgenes
          </h3>
          <ul className="space-y-2">
            <DataListItem
              label="Ingresos Totales"
              value={financialData?.totalRevenue}
              format="currency"
              currencySymbol={currencySymbol}
            />
            <DataListItem
              label="Ingresos por Acción"
              value={financialData?.revenuePerShare}
              format="currency"
              currencySymbol={currencySymbol}
            />
            <DataListItem
              label="Crecimiento de Ingresos"
              value={financialData?.revenueGrowth}
              format="percentage"
            />
            <DataListItem
              label="Beneficios Brutos"
              value={financialData?.grossProfits}
              format="currency"
              currencySymbol={currencySymbol}
            />
            <DataListItem
              label="Márgenes Brutos"
              value={financialData?.grossMargins}
              format="percentage"
            />
            <DataListItem
              label="Márgenes EBITDA"
              value={financialData?.ebitdaMargins}
              format="percentage"
            />
            <DataListItem
              label="Márgenes Operativos"
              value={financialData?.operatingMargins}
              format="percentage"
            />
            <DataListItem
              label="Márgenes de Beneficio"
              value={financialData?.profitMargins}
              format="percentage"
            />
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
            Ganancias y Retorno
          </h3>
          <ul className="space-y-2">
            <DataListItem
              label="EPS (Trailing)"
              value={defaultKeyStatistics?.trailingEps}
              format="number"
            />
            <DataListItem
              label="EPS (Forward)"
              value={defaultKeyStatistics?.forwardEps}
              format="number"
            />
            <DataListItem
              label="Crecimiento de Ganancias Trimestrales"
              value={defaultKeyStatistics?.earningsQuarterlyGrowth}
              format="percentage"
            />
            <DataListItem
              label="Retorno sobre Activos (ROA)"
              value={financialData?.returnOnAssets}
              format="percentage"
            />
            <DataListItem
              label="Retorno sobre Patrimonio (ROE)"
              value={financialData?.returnOnEquity}
              format="percentage"
            />
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            Los márgenes y retornos son indicadores clave de la eficiencia
            operativa y la creación de valor para los accionistas.
          </p>
        </div>
      </div>
    </section>
  );
}
