// /app/portafolio/[operador]/[ticker]/page.tsx
import ReportPage from "@/components/ReportPage/ReportPage";

interface PageProps {
  params: Promise<{
    operador: string;
    ticker: string;
  }>;
}

export default async function DynamicReportPage({ params }: PageProps) {
  // Desestructuramos la Promise para obtener los valores
  const { ticker } = await params;

  // Renderizamos el ReportPage, pasándole el ticker obtenido de la URL
  return <ReportPage ticker={ticker.toUpperCase()} />;
}
