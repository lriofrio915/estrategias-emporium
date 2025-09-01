// components/Profitability/Profitability.tsx
import { ApiAssetItem } from "@/types/api";
import DataListItem from "../Shared/DataListItem";
import { getNumericValue } from "../AnalystPerspectives/AnalystPerspectives";


interface ProfitabilityProps {
  assetData: ApiAssetItem;
}

export default function Profitability({ assetData }: ProfitabilityProps) {
  // Desestructuramos los datos directamente de assetData.data
  // Esto hace que el código sea más seguro y limpio
  const { financialData, defaultKeyStatistics, price } = assetData.data;
  const currencySymbol = price?.currencySymbol || "€";
  // Preprocesamos los valores necesarios
  const revenuePerShare = getNumericValue(defaultKeyStatistics?.revenuePerShare);
  const totalRevenue = getNumericValue(financialData?.totalRevenue);
  const revenueGrowth = getNumericValue(financialData?.revenueGrowth);
  const grossProfits = getNumericValue(financialData?.grossProfits);
  const grossMargins = getNumericValue(financialData?.grossMargins);
  const operatingMargins = getNumericValue(financialData?.operatingMargins);
  const profitMargins = getNumericValue(financialData?.profitMargins);
  const returnOnAssets = getNumericValue(financialData?.returnOnAssets);
  const returnOnEquity = getNumericValue(financialData?.returnOnEquity);
  const trailingEps = getNumericValue(defaultKeyStatistics?.trailingEps);
  const forwardEps = getNumericValue(defaultKeyStatistics?.forwardEps);
  const earningsQuarterlyGrowth = getNumericValue(defaultKeyStatistics?.earningsQuarterlyGrowth);

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
              value={totalRevenue}
              format="currency"
              currencySymbol={currencySymbol}
            />
            <DataListItem
              label="Ingresos por Acción"
              value={revenuePerShare}
              format="currency"
              currencySymbol={currencySymbol}
            />
            <DataListItem
              label="Crecimiento de Ingresos"
              value={revenueGrowth}
              format="percentage"
            />
            <DataListItem
              label="Beneficios Brutos"
              value={grossProfits}
              format="currency"
              currencySymbol={currencySymbol}
            />
            <DataListItem
              label="Márgenes Brutos"
              value={grossMargins}
              format="percentage"
            />
            <DataListItem
              label="Márgenes Operativos"
              value={operatingMargins}
              format="percentage"
            />
            <DataListItem
              label="Márgenes de Beneficio"
              value={profitMargins}
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
              value={trailingEps}
              format="number"
            />
            <DataListItem
              label="EPS (Forward)"
              value={forwardEps}
              format="number"
            />
            <DataListItem
              label="Crecimiento de Ganancias Trimestrales"
              value={earningsQuarterlyGrowth}
              format="percentage"
            />
            <DataListItem
              label="Retorno sobre Activos (ROA)"
              value={returnOnAssets}
              format="percentage"
            />
            <DataListItem
              label="Retorno sobre Patrimonio (ROE)"
              value={returnOnEquity}
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
