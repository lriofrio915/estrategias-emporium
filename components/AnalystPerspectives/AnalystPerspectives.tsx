// components/AnalystPerspectives/AnalystPerspectives.tsx
import { ApiAssetItem } from "@/types/api";
import DataListItem from "../Shared/DataListItem";

interface AnalystPerspectivesProps {
  assetData: ApiAssetItem;
}

export default function AnalystPerspectives({
  assetData,
}: AnalystPerspectivesProps) {
  // Desestructuramos directamente sin 'as any'
  const { financialData, assetProfile, price } = assetData.data;
  const currencySymbol = price?.currencySymbol || "€";

  if (!financialData && !assetProfile) {
    return null;
  }

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
            {financialData?.recommendationMean !== null &&
              financialData?.recommendationMean !== undefined && (
                <li>
                  <span className="font-semibold">Puntuación Media:</span>{" "}
                  <span className="highlight-api">
                    {financialData.recommendationMean.toFixed(2)}
                  </span>{" "}
                  de 5
                </li>
              )}
            <DataListItem
              label="Número de Analistas"
              value={financialData?.numberOfAnalystOpinions}
              format="number"
            />
            <DataListItem
              label="Precio Objetivo Alto"
              value={financialData?.targetHighPrice}
              format="currency"
              currencySymbol={currencySymbol}
            />
            <DataListItem
              label="Precio Objetivo Bajo"
              value={financialData?.targetLowPrice}
              format="currency"
              currencySymbol={currencySymbol}
            />
            <DataListItem
              label="Precio Objetivo Medio"
              value={financialData?.targetMeanPrice}
              format="currency"
              currencySymbol={currencySymbol}
            />
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
