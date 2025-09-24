import { notFound } from "next/navigation";
import { getPortfolioBySlug } from "@/app/actions/portfolioActions";
import CarteraDetailPageClient from "@/components/CarteraDetailPageClient/CarteraDetailPageClient"; // Crearemos este componente

interface PageProps {
  params: Promise<{
    operador: string;
    cartera: string;
  }>;
}

export default async function CarteraDetailPage({ params }: PageProps) {
  const { operador, cartera: carteraSlug } = await params;

  const portfolio = await getPortfolioBySlug(operador);
  if (!portfolio) {
    notFound();
  }

  // Encontramos la cartera específica dentro del portafolio
  const carteraData = portfolio.carteras.find((c) => c.slug === carteraSlug);
  if (!carteraData) {
    notFound();
  }

  // Pasamos los datos del portafolio padre y la cartera específica al componente cliente
  return (
    <CarteraDetailPageClient portfolio={portfolio} cartera={carteraData} />
  );
}
