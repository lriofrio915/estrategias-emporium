import { notFound } from "next/navigation";
import Portfolio from "@/models/Portfolio";
import connectToDB from "@/lib/mongodb";
import { Portfolio as PortfolioType } from "@/types/api";
import PortfolioDetailPageClient from "@/components/PortfolioDetailPageClient/PortfolioDetailPageClient";

async function getPortfolioBySlug(slug: string): Promise<PortfolioType | null> {
  await connectToDB();
  const portfolio = await Portfolio.findOne({ slug }).lean();
  if (!portfolio) {
    return null;
  }
  return JSON.parse(JSON.stringify(portfolio));
}

// 1. CORRECCIÓN: Tipamos `params` como una Promesa que resuelve al objeto.
interface PageProps {
  params: Promise<{
    operador: string;
  }>;
}

export default async function PortfolioDetailPage({ params }: PageProps) {
  // 2. CORRECCIÓN: Usamos `await` para obtener el objeto de la promesa.
  const { operador } = await params;
  const portfolio = await getPortfolioBySlug(operador);

  if (!portfolio) {
    notFound();
  }

  return <PortfolioDetailPageClient portfolio={portfolio} />;
}
