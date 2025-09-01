import React from "react";

// Define la estructura de los datos del mercado
interface MarketDataItem {
  mercado: string;
  activo: string;
  valor: string;
  cambio: string;
}

// Datos de ejemplo para la tabla
const marketData: MarketDataItem[] = [
  {
    mercado: "Índices",
    activo: "NASDAQ 100",
    valor: "18,500.50",
    cambio: "+0.25%",
  },
  {
    mercado: "Índices",
    activo: "S&P 500",
    valor: "5,020.10",
    cambio: "+0.15%",
  },
  {
    mercado: "Índices",
    activo: "Dow Jones",
    valor: "38,200.75",
    cambio: "+0.10%",
  },
  {
    mercado: "Índices",
    activo: "Russell 2000",
    valor: "2,010.45",
    cambio: "+0.30%",
  },
  {
    mercado: "Bonos",
    activo: "T-Note 10-Year",
    valor: "4.25%",
    cambio: "-0.02%",
  },
  {
    mercado: "Bonos",
    activo: "T-Bond 30-Year",
    valor: "4.50%",
    cambio: "-0.01%",
  },
  { mercado: "Divisas", activo: "EUR/USD", valor: "1.0850", cambio: "-0.05%" },
  { mercado: "Divisas", activo: "USD/JPY", valor: "148.20", cambio: "+0.10%" },
  { mercado: "Divisas", activo: "GBP/USD", valor: "1.2550", cambio: "+0.03%" },
  { mercado: "Divisas", activo: "USD/CAD", valor: "1.3400", cambio: "-0.07%" },
  {
    mercado: "Commodities",
    activo: "WTI (Petróleo)",
    valor: "75.25",
    cambio: "+0.50%",
  },
  {
    mercado: "Commodities",
    activo: "Oro (Gold)",
    valor: "2,050.80",
    cambio: "+0.12%",
  },
  {
    mercado: "Commodities",
    activo: "Plata (Silver)",
    valor: "23.15",
    cambio: "+0.20%",
  },
  {
    mercado: "Commodities",
    activo: "Gas Natural",
    valor: "2.50",
    cambio: "-1.20%",
  },
  {
    mercado: "Crypto",
    activo: "Bitcoin (BTC)",
    valor: "65,000.00",
    cambio: "+1.50%",
  },
  {
    mercado: "Crypto",
    activo: "Ethereum (ETH)",
    valor: "3,500.20",
    cambio: "+1.80%",
  },
  {
    mercado: "Crypto",
    activo: "Ripple (XRP)",
    valor: "0.60",
    cambio: "+0.50%",
  },
  { mercado: "ETFs", activo: "SPY", valor: "502.15", cambio: "+0.15%" },
  { mercado: "ETFs", activo: "QQQ", valor: "425.80", cambio: "+0.25%" },
  { mercado: "ETFs", activo: "IWM", valor: "201.20", cambio: "+0.30%" },
];

export default function PreMarketTable() {
  const groupedData: { [key: string]: MarketDataItem[] } = marketData.reduce(
    (acc, item) => {
      (acc[item.mercado] = acc[item.mercado] || []).push(item);
      return acc;
    },
    {} as { [key: string]: MarketDataItem[] }
  );

  return (
    <div className="rounded-2xl shadow-lg overflow-hidden bg-gray-800 text-white p-4 sm:p-6 lg:p-8">
      <h3 className="text-xl sm:text-2xl font-bold mb-4">
        Resumen del Pre-Mercado
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Mercado
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Activo
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Valor
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Cambio (%)
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {Object.keys(groupedData).map((mercado, index) => (
              <React.Fragment key={index}>
                {groupedData[mercado].map((item, subIndex) => (
                  <tr key={`${index}-${subIndex}`}>
                    {subIndex === 0 && (
                      <td
                        className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300"
                        rowSpan={groupedData[mercado].length}
                      >
                        {item.mercado}
                      </td>
                    )}
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {item.activo}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.valor}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.cambio.startsWith("+")
                            ? "bg-green-600 text-green-100"
                            : "bg-red-600 text-red-100"
                        }`}
                      >
                        {item.cambio}
                      </span>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
