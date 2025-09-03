// app/informes/ES/page.tsx

import Link from 'next/link';

export const metadata = {
  title: "Informes Operativos ES - Pulso Bursátil",
  description: "Accede a los informes de trading operativos mensuales de la Estrategia E-mini S&P 500 (ES) por Emporium Quality Funds.",
};

// Datos de los informes para 2025 de la Estrategia ES
const reports2025 = [
  { id: 1, month: 'Enero', successRate: 'N/A', link: '/informes/ES/enero-25' },
  { id: 2, month: 'Febrero', successRate: 'N/A', link: '/informes/ES/febrero-25' },
  { id: 3, month: 'Marzo', successRate: 'N/A', link: '/informes/ES/marzo-25' },
  { id: 4, month: 'Abril', successRate: 'N/A', link: '/informes/ES/abril-25' },
  { id: 5, month: 'Mayo', successRate: 'N/A', link: '/informes/ES/mayo-25' },
  { id: 6, month: 'Junio', successRate: 'N/A', link: '/informes/ES/junio-25' },
  { id: 7, month: 'Julio', successRate: '60%', link: '/informes/ES/julio-25' }, // Asumiendo que hay un informe de julio
  { id: 8, month: 'Agosto', successRate: '25%', link: '/informes/ES/agosto-25' },
  { id: 9, month: 'Septiembre', successRate: 'N/A', link: '/informes/ES/septiembre-25' },
  { id: 10, month: 'Octubre', successRate: 'N/A', link: '/informes/ES/octubre-25' },
  { id: 11, month: 'Noviembre', successRate: 'N/A', link: '/informes/ES/noviembre-25' },
  { id: 12, month: 'Diciembre', successRate: 'N/A', link: '/informes/ES/diciembre-25' },
];

export default function InformesESPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl pt-20">
      <header className="text-center mb-12 mt-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A2342] mb-4">
          Informes Operativos de Trading ES
        </h1>
        <p className="text-lg md:text-xl text-[#849E8F]">
          Accede a los análisis de rendimiento mensuales de la Estrategia E-mini S&P 500 (ES).
        </p>
      </header>

      <section className="bg-white rounded-lg shadow-xl p-6 md:p-8 mb-12">
        <h2 className="text-3xl font-bold text-center text-[#0A2342] mb-6">
          Informes de Desempeño 2025
        </h2>
        <div className="flex justify-center mb-8 space-x-4">
          <button className="px-6 py-2 bg-[#2CA58D] text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-colors duration-200">
            2025
          </button>
          <button className="px-6 py-2 bg-gray-200 text-[#0A2342] font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors duration-200">
            2026 (Próximamente)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  N°
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Mes
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Tasa de Éxito
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Acceso al Informe
                </th>
              </tr>
            </thead>
            <tbody>
              {reports2025.map((report) => (
                <tr key={report.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150">
                  <td className="py-4 px-6 text-sm text-gray-800 font-medium">{report.id}</td>
                  <td className="py-4 px-6 text-sm text-gray-800">{report.month}</td>
                  <td className="py-4 px-6 text-sm font-semibold">
                    {report.successRate === 'N/A' ? (
                      <span className="text-gray-500">{report.successRate}</span>
                    ) : (
                      <span className="text-[#2CA58D]">{report.successRate}</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    {report.successRate === 'N/A' ? (
                      <span className="text-gray-400 cursor-not-allowed">Próximamente</span>
                    ) : (
                      <Link href={report.link} className="text-blue-600 hover:text-blue-800 font-medium underline transition-colors duration-200">
                        Ver Informe
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <footer className="text-center mt-12 pt-8 border-t border-gray-300">
        <h3 className="font-bold mb-2">Aviso Legal</h3>
        <p className="text-xs text-gray-500 max-w-4xl mx-auto">
          El contenido de este informe tiene fines puramente educativos e informativos y no constituye en ningún caso asesoramiento de inversión. La operativa con futuros implica un alto grado de riesgo y puede no ser adecuada para todos los inversores. Existe la posibilidad de que se incurra en pérdidas que superen la inversión inicial. Los resultados pasados no son indicativos de resultados futuros.
        </p>
      </footer>
    </div>
  );
}