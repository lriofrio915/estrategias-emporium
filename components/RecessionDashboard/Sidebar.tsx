"use client";
import React from "react";

interface SidebarProps {
  showCharts: boolean;
  setShowCharts: (value: boolean) => void;
  showTable: boolean;
  setShowTable: (value: boolean) => void;
  onGenerateBrief: () => void;
  isGenerating: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  showCharts,
  setShowCharts,
  showTable,
  setShowTable,
  onGenerateBrief,
  isGenerating,
}) => {
  return (
    <aside className="w-full md:w-64 bg-gray-800 p-6 flex-shrink-0">
      <h2 className="text-2xl font-bold text-white mb-6">Parámetros</h2>
      <div className="space-y-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showCharts}
            onChange={(e) => setShowCharts(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-300">Ver Gráficos</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showTable}
            onChange={(e) => setShowTable(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-300">Ver Tabla Detallada</span>
        </label>
        <button
          onClick={onGenerateBrief}
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generando...
            </>
          ) : (
            "Generar Resumen con IA"
          )}
        </button>
      </div>
    </aside>
  );
};
