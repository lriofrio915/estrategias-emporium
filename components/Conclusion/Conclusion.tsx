// components/Conclusion/Conclusion.tsx
import { ApiAssetItem } from "@/types/api";
import { formatCurrency, formatPercentage } from "../Shared/utils";

interface ConclusionProps {
  assetData: ApiAssetItem;
}

export default function Conclusion({ assetData }: ConclusionProps) {
  // Desestructuramos los datos directamente de assetData.data
  const { price, financialData, summaryDetail, defaultKeyStatistics } =
    assetData.data;

  const companyName = price?.longName || assetData.ticker;
  const currencySymbol = price?.currencySymbol || "€";

  return (
    <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
      <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
        7. Conclusión del Informe
      </h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        {companyName} se posiciona como un actor clave en su industria, con una
        fuerte presencia en diversos segmentos. Su capitalización de mercado de
        aproximadamente{" "}
        <span className="highlight-api">
          {formatCurrency(price?.marketCap, currencySymbol)}
        </span>{" "}
        y su diversificada cartera de productos sugieren una empresa con una
        base sólida.
      </p>
      <p className="text-gray-700 leading-relaxed mb-4">
        Desde la perspectiva financiera, observamos que los precios objetivos de
        los analistas varían, pero la recomendación media de{" "}
        <span className="highlight-api">
          {financialData?.recommendationKey?.toUpperCase() || ""}
        </span>{" "}
        sugiere una perspectiva generalmente positiva. Sin embargo, el{" "}
        {summaryDetail?.payoutRatio !== undefined && (
          <span>
            <span className="font-semibold">Payout Ratio</span> de{" "}
            <span className="highlight-api">
              {formatPercentage(summaryDetail?.payoutRatio)}
            </span>
          </span>
        )}{" "}
        y el{" "}
        {defaultKeyStatistics?.earningsQuarterlyGrowth !== undefined && (
          <span>
            <span className="font-semibold">
              Crecimiento de Ganancias Trimestrales:
            </span>{" "}
            <span className="highlight-api">
              {formatPercentage(defaultKeyStatistics?.earningsQuarterlyGrowth)}
            </span>
          </span>
        )}{" "}
        son puntos clave a monitorear.
      </p>
      <p className="text-gray-700 leading-relaxed">
        Considerando su posición en el mercado, el rendimiento de dividendos de{" "}
        {summaryDetail?.dividendYield !== undefined && (
          <span className="highlight-api">
            {formatPercentage(summaryDetail?.dividendYield)}
          </span>
        )}{" "}
        y los ratios de valoración, {companyName} podría representar una
        oportunidad interesante para inversores con un horizonte a largo plazo,
        siempre considerando los riesgos inherentes al mercado.
      </p>
    </section>
  );
}
