// components/AnalystPerspectives/AnalystPerspectives.tsx
import { ApiAssetItem, YahooFinanceRawValue } from "@/types/api";
import DataListItem from "../Shared/DataListItem";

interface AnalystPerspectivesProps {
  assetData: ApiAssetItem;
}

// Función helper para manejar valores numéricos
export const getNumericValue = (
  value: number | YahooFinanceRawValue | string | null | undefined
): number => {
  if (value === undefined || value === null) return 0;

  if (typeof value === "number") return value;

  if (typeof value === "object" && value !== null && "raw" in value) {
    return value.raw || 0;
  }

  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

export default function AnalystPerspectives({
  assetData,
}: AnalystPerspectivesProps) {
  // Desestructuramos directamente sin 'as any'
  const { financialData, assetProfile, price } = assetData.data;
  const currencySymbol = price?.currencySymbol || "€";

  if (!financialData && !assetProfile) {
    return null;
  }

  // Precalculamos los valores numéricos necesarios
  const recommendationMean = getNumericValue(financialData?.recommendationMean);
  const targetHighPrice = getNumericValue(financialData?.targetHighPrice);
  const targetLowPrice = getNumericValue(financialData?.targetLowPrice);
  const targetMeanPrice = getNumericValue(financialData?.targetMeanPrice);
  const currentPrice = getNumericValue(price?.regularMarketPrice);

  // Calculamos el potencial de apreciación
  const upsidePotential =
    currentPrice > 0
      ? ((targetMeanPrice - currentPrice) / currentPrice) * 100
      : 0;

  return (
    <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
      <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
        6. Perspectivas de Analistas y Riesgos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
        <div>
          <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
            Recomendaciones de Analistas
          </h3>
          <ul className="space-y-2">
            <DataListItem
              label="Recomendación Media"
              value={financialData?.recommendationKey}
              format="text"
            />
            {recommendationMean > 0 && (
              <li className="flex justify-between items-center py-1">
                <span className="font-semibold">Puntuación Media:</span>
                <span className="highlight-api bg-blue-100 px-2 py-1 rounded">
                  {recommendationMean.toFixed(2)} de 5
                </span>
              </li>
            )}
            <DataListItem
              label="Número de Analistas"
              value={financialData?.numberOfAnalystOpinions}
              format="number"
            />
            <DataListItem
              label="Precio Objetivo Alto"
              value={targetHighPrice}
              format="currency"
              currencySymbol={currencySymbol}
            />
            <DataListItem
              label="Precio Objetivo Bajo"
              value={targetLowPrice}
              format="currency"
              currencySymbol={currencySymbol}
            />
            <DataListItem
              label="Precio Objetivo Medio"
              value={targetMeanPrice}
              format="currency"
              currencySymbol={currencySymbol}
            />
            {targetMeanPrice > 0 && currentPrice > 0 && (
              <li className="flex justify-between items-center py-1">
                <span className="font-semibold">Potencial:</span>
                <span
                  className={
                    upsidePotential > 0
                      ? "text-green-600 font-bold"
                      : "text-red-600 font-bold"
                  }
                >
                  {upsidePotential > 0 ? "+" : ""}
                  {upsidePotential.toFixed(2)}%
                </span>
              </li>
            )}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
            Riesgos de Gobierno Corporativo
          </h3>
          <ul className="space-y-2">
            <DataListItem
              label="Riesgo General"
              value={assetProfile?.overallRisk}
              format="number"
            />
            <DataListItem
              label="Riesgo de Auditoría"
              value={assetProfile?.auditRisk}
              format="number"
            />
            <DataListItem
              label="Riesgo de Junta Directiva"
              value={assetProfile?.boardRisk}
              format="number"
            />
            <DataListItem
              label="Riesgo de Compensación"
              value={assetProfile?.compensationRisk}
              format="number"
            />
            <DataListItem
              label="Riesgo de Derechos de Accionistas"
              value={assetProfile?.shareHolderRightsRisk}
              format="number"
            />
          </ul>
        </div>
      </div>
    </section>
  );
}
