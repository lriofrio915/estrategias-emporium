import ReportPage from "@/components/ReportPage/ReportPage";

interface PageProps {
  params: Promise<{
    ticker: string;
  }>;
}

export default async function StockReportPage({ params }: PageProps) {
  const { ticker } = await params;

  // Renderizamos el ReportPage, pasándole el ticker obtenido de la URL
  return <ReportPage ticker={ticker.toUpperCase()} />;
}
