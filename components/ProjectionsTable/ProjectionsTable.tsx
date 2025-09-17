"use client";
import React, { useState } from "react";
import Tooltip from "../Shared/Tooltips";
import { ProjectionsData } from "@/types/valuation"; // Importamos el tipo

interface Props {
  data: ProjectionsData | null; // Recibe los datos calculados
}

const ProjectionsTable: React.FC<Props> = ({ data }) => {
  // Los `estimates` son para la entrada del usuario, así que se mantienen aquí.
  const [estimates, setEstimates] = useState({
    salesGrowth: "0",
    ebitMargin: "0",
    taxRate: "0",
    sharesIncrease: "0",
  });

  const projectionDescriptions: { [key: string]: string } = {
    salesGrowth:
      "The expected average annual growth rate in the company's sales.",
    ebitMargin: "The company's operating profitability.",
    taxRate: "The corporate tax rate the company is expected to pay.",
    sharesIncrease: "The projected change in the number of outstanding shares.",
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEstimates((prev) => ({ ...prev, [name]: value }));
  };

  if (!data) {
    return (
      <div className="bg-white text-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 flex items-center justify-center h-full">
        <p className="text-gray-500">Cargando proyecciones...</p>
      </div>
    );
  }

  const projectionsToDisplay = [
    { key: "salesGrowth", name: "Sales Growth" },
    { key: "ebitMargin", name: "EBIT Margin" },
    { key: "taxRate", name: "Tax Rate" },
    { key: "sharesIncrease", name: "Shares Increase" },
  ];

  return (
    <div className="bg-white text-gray-800 p-4 rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-xl font-semibold mb-4">Proyección a futuro</h3>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="py-2">Metric</th>
            <th className="py-2 text-center">
              <div className="flex flex-col items-center">
                <span>Average</span>
                <span className="text-sm font-normal">2022 - 2025</span>
              </div>
            </th>
            <th className="py-2 text-center">
              <div className="flex flex-col items-center">
                <span>Estimates</span>
                <span className="text-sm font-normal">2026e</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {projectionsToDisplay.map((projection) => (
            <tr key={projection.key} className="border-b border-gray-200">
              <td className="py-2">
                <Tooltip text={projectionDescriptions[projection.key] || ""}>
                  {projection.name}
                </Tooltip>
              </td>
              <td className="py-2 text-center font-semibold">
                {typeof data[projection.key as keyof ProjectionsData] ===
                "number"
                  ? `${data[projection.key as keyof ProjectionsData]}%`
                  : data[projection.key as keyof ProjectionsData]}
              </td>
              <td className="py-2 text-center text-red-600 font-bold">
                <div className="flex justify-center items-center">
                  <input
                    type="number"
                    name={projection.key}
                    value={estimates[projection.key as keyof typeof estimates]}
                    onChange={handleInputChange}
                    className="w-20 text-center bg-transparent border-none focus:outline-none focus:ring-0"
                    step="0.1"
                  />
                  %
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectionsTable;
