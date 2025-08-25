// Importamos el componente ReportPage usando una ruta relativa para evitar problemas de alias en la compilación
import ReportPage from "@/components/ReportPage/ReportPage";

// Definimos la interfaz para los parámetros de la ruta dinámica
interface DynamicReportPageProps {
  params: {
    ticker: string; // El nombre del parámetro de la carpeta dinámica ([ticker])
  };
}

// Este componente recibirá los 'params' de la URL
export default function DynamicReportPage({ params }: DynamicReportPageProps) {
  const { ticker } = params;

  // Renderizamos el ReportPage, pasándole el ticker obtenido de la URL
  return <ReportPage ticker={ticker.toUpperCase()} />;
}
