import React, { useState } from "react";
import { CompanyData, FinancialStatementItem } from "@/types/stock-scanner";

type Statement = "income" | "balance" | "cash";

const FinancialStatementTabs: React.FC<{ data: CompanyData }> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<Statement>("income");

  // FIX: Explicitly type sort parameters as numbers to resolve TypeScript error.
  const years = [
    ...new Set(data.incomeStatement.revenue.map((item) => item.year)),
  ].sort((a: number, b: number) => b - a);

  const renderContent = () => {
    let labels: string[] = [];
    const dataMap = new Map<string, FinancialStatementItem[]>();

    switch (activeTab) {
      case "income":
        labels = ["Ingresos Totales", "Beneficio Neto"];
        dataMap.set("Ingresos Totales", data.incomeStatement.revenue);
        dataMap.set("Beneficio Neto", data.incomeStatement.netIncome);
        break;
      case "balance":
        labels = ["Activos Totales", "Pasivos Totales", "Patrimonio Neto"];
        dataMap.set("Activos Totales", data.balanceSheet.totalAssets);
        dataMap.set("Pasivos Totales", data.balanceSheet.totalLiabilities);
        dataMap.set("Patrimonio Neto", data.balanceSheet.totalEquity);
        break;
      case "cash":
        labels = [
          "Flujo de Caja Operativo",
          "Flujo de Caja de Inversión",
          "Flujo de Caja de Financiación",
        ];
        dataMap.set(
          "Flujo de Caja Operativo",
          data.cashFlowStatement.operatingCashFlow
        );
        dataMap.set(
          "Flujo de Caja de Inversión",
          data.cashFlowStatement.investingCashFlow
        );
        dataMap.set(
          "Flujo de Caja de Financiación",
          data.cashFlowStatement.financingCashFlow
        );
        break;
      default:
        return null;
    }

    return (
      <tbody>
        {labels.map((label) => (
          <tr key={label} className="border-b border-slate-700 last:border-b-0">
            <th
              scope="row"
              className="px-6 py-4 font-medium text-slate-100 whitespace-nowrap"
            >
              {label}
            </th>
            {years.map((year) => {
              const statementItems = dataMap.get(label);
              const item = statementItems?.find((i) => i.year === year);
              return (
                <td key={`${label}-${year}`} className="px-6 py-4 text-right">
                  {new Intl.NumberFormat("es-ES", {
                    style: "currency",
                    currency: "USD",
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(item?.value || 0)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    );
  };

  const getTabClass = (tab: Statement) =>
    `px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${
      activeTab === tab
        ? "bg-cyan-600 text-white"
        : "text-slate-300 hover:bg-slate-600"
    }`;

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-slate-100">
          Estados Financieros
        </h3>
        <div className="flex space-x-2 bg-slate-700 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("income")}
            className={getTabClass("income")}
          >
            Resultados
          </button>
          <button
            onClick={() => setActiveTab("balance")}
            className={getTabClass("balance")}
          >
            Balance
          </button>
          <button
            onClick={() => setActiveTab("cash")}
            className={getTabClass("cash")}
          >
            Flujo de Caja
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
            <tr>
              <th scope="col" className="px-6 py-3 rounded-l-lg">
                Métrica
              </th>
              {years.map((year) => (
                <th key={year} scope="col" className="px-6 py-3 text-right">
                  {year}
                </th>
              ))}
            </tr>
          </thead>
          {renderContent()}
        </table>
      </div>
    </div>
  );
};

export default FinancialStatementTabs;
