import React from "react";

// Define la estructura para los datos de cada indicador por país
interface IndicatorValue {
  indicador: string;
  tipo: "Adelantado" | "Coincidente" | "Rezagado";
  valores: {
    "EE.UU.": string;
    México: string;
    Brasil: string;
    Canadá: string;
    Colombia: string;
    Argentina: string;
  };
}

// Datos de ejemplo para la tabla basados en la imagen
const indicatorsData: IndicatorValue[] = [
  {
    indicador: "Crecimiento del PIB",
    tipo: "Coincidente",
    valores: {
      "EE.UU.": "2.5%",
      México: "1.9%",
      Brasil: "1.9%",
      Canadá: "1.5%",
      Colombia: "0.7%",
      Argentina: "-1.5%",
    },
  },
  {
    indicador: "PMI Manufacturero",
    tipo: "Adelantado",
    valores: {
      "EE.UU.": "52.1",
      México: "50.5",
      Brasil: "49.8",
      Canadá: "51.5",
      Colombia: "48.9",
      Argentina: "45.1",
    },
  },
  {
    indicador: "PMI de Servicios",
    tipo: "Adelantado",
    valores: {
      "EE.UU.": "54.2",
      México: "51.3",
      Brasil: "50.1",
      Canadá: "53.0",
      Colombia: "49.5",
      Argentina: "47.2",
    },
  },
  {
    indicador: "Ventas Minoristas",
    tipo: "Coincidente",
    valores: {
      "EE.UU.": "+0.5%",
      México: "+0.2%",
      Brasil: "+0.1%",
      Canadá: "+0.3%",
      Colombia: "-0.1%",
      Argentina: "-1.2%",
    },
  },
  {
    indicador: "Inflación (IPC)",
    tipo: "Rezagado",
    valores: {
      "EE.UU.": "3.1%",
      México: "4.8%",
      Brasil: "3.5%",
      Canadá: "2.9%",
      Colombia: "7.2%",
      Argentina: "254.2%",
    },
  },
  {
    indicador: "Tasa de Desempleo",
    tipo: "Rezagado",
    valores: {
      "EE.UU.": "3.9%",
      México: "2.7%",
      Brasil: "7.9%",
      Canadá: "5.7%",
      Colombia: "10.5%",
      Argentina: "7.0%",
    },
  },
  {
    indicador: "Tasa de Interés",
    tipo: "Rezagado",
    valores: {
      "EE.UU.": "5.25%",
      México: "11.0%",
      Brasil: "11.75%",
      Canadá: "5.0%",
      Colombia: "12.25%",
      Argentina: "80.0%",
    },
  },
];

// Helper para asignar colores según el tipo de indicador
const typeColors = {
  Adelantado: "bg-green-600",
  Coincidente: "bg-yellow-600",
  Rezagado: "bg-red-600",
};

export default function EconomicIndicatorsTable() {
  const countries = [
    "EE.UU.",
    "México",
    "Brasil",
    "Canadá",
    "Colombia",
    "Argentina",
  ];

  return (
    <div className="rounded-2xl shadow-lg overflow-hidden bg-gray-800 text-white p-4 sm:p-6 lg:p-8 mt-8">
      <h3 className="text-xl sm:text-2xl font-bold mb-4">
        Principales Indicadores Económicos
      </h3>
      <p className="text-sm text-gray-400 mb-6">
        Clasificación de indicadores:{" "}
        <span className="font-semibold text-green-400">Adelantados</span>{" "}
        (señalan la dirección futura),{" "}
        <span className="font-semibold text-yellow-400">Coincidentes</span>{" "}
        (reflejan la actividad económica actual), y{" "}
        <span className="font-semibold text-red-400">Rezagados</span> (confirman
        tendencias pasadas).
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Indicador
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Tipo
              </th>
              {countries.map((country) => (
                <th
                  key={country}
                  scope="col"
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  {country}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {indicatorsData.map((item, index) => (
              <tr key={index}>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {item.indicador}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      typeColors[item.tipo]
                    } text-gray-100`}
                  >
                    {item.tipo}
                  </span>
                </td>
                {countries.map((country) => (
                  <td
                    key={country}
                    className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                  >
                    {item.valores[country as keyof typeof item.valores]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
