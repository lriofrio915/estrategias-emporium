import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { IncomeStatement } from "@/types/stock-scanner";

interface RevenueChartProps {
  data: IncomeStatement;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const chartData = data.revenue
    .map((revItem) => {
      const netItem = data.netIncome.find((ni) => ni.year === revItem.year);
      return {
        year: revItem.year,
        Ingresos: revItem.value / 1e9, // in Billions
        "Beneficio Neto": netItem ? netItem.value / 1e9 : 0,
      };
    })
    .sort((a, b) => a.year - b.year);

  const valueFormatter = (value: number) =>
    `${new Intl.NumberFormat("es-ES").format(value)} mil mill.`;

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg h-96">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">
        Ingresos vs. Beneficio Neto (en miles de millones de USD)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 20, left: -5, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis dataKey="year" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" tickFormatter={(value) => `$${value}`} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334152",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ color: "#cbd5e1" }}
            formatter={valueFormatter}
          />
          <Legend wrapperStyle={{ paddingTop: "20px", color: "#94a3b8" }} />
          <Bar dataKey="Ingresos" fill="#06b6d4" />
          <Bar dataKey="Beneficio Neto" fill="#67e8f9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
