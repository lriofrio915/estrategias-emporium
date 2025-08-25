// components/FinancialHealth/FinancialHealth.tsx
import { ApiAssetItem } from '@/types/api';
import DataListItem from '../Shared/DataListItem';

interface FinancialHealthProps {
  assetData: ApiAssetItem;
}

export default function FinancialHealth({ assetData }: FinancialHealthProps) {
  const { financialData } = assetData.data; // Cambiado a assetData.data
  const currencySymbol = assetData.data.price?.currencySymbol || "€";

  if (!financialData || (
    financialData.totalCash === undefined &&
    financialData.totalDebt === undefined &&
    financialData.quickRatio === undefined &&
    financialData.currentRatio === undefined &&
    financialData.debtToEquity === undefined &&
    financialData.operatingCashflow === undefined &&
    financialData.freeCashflow === undefined
  )) {
    return null;
  }

  return (
    <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
      <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-8">
        4. Salud Financiera
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
        <div>
          <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
            Liquidez y Endeudamiento
          </h3>
          <ul className="space-y-2">
            <DataListItem label="Efectivo Total" value={financialData?.totalCash} format="currency" currencySymbol={currencySymbol} />
            <DataListItem label="Efectivo por Acción" value={financialData?.totalCashPerShare} format="currency" currencySymbol={currencySymbol} />
            <DataListItem label="Deuda Total" value={financialData?.totalDebt} format="currency" currencySymbol={currencySymbol} />
            <DataListItem label="Quick Ratio" value={financialData?.quickRatio} format="number" />
            <DataListItem label="Current Ratio" value={financialData?.currentRatio} format="number" />
            <DataListItem label="Deuda/Patrimonio" value={financialData?.debtToEquity} format="number" />
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[#0A2342] mb-3">
            Flujos de Efectivo
          </h3>
          <ul className="space-y-2">
            <DataListItem label="Flujo de Caja Operativo" value={financialData?.operatingCashflow} format="currency" currencySymbol={currencySymbol} />
            <DataListItem label="Flujo de Caja Libre" value={financialData?.freeCashflow} format="currency" currencySymbol={currencySymbol} />
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            Un flujo de caja libre positivo es crucial para la inversión
            en crecimiento y el pago de dividendos.
          </p>
        </div>
      </div>
    </section>
  );
}