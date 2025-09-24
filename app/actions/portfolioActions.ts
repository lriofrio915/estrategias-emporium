// app/actions/portfolioActions.ts
"use server";

import { revalidatePath } from "next/cache";
import Portfolio from "@/models/Portfolio"; // Asegúrate que la ruta a tu modelo es correcta
import connectToDB from "@/lib/mongodb";
import { Portfolio as PortfolioType, Cartera } from "@/types/api";

interface NewPortfolioData {
  name: string;
  tickers: string[];
}

interface NewCarteraData {
  portfolioSlug: string;
  name: string;
}

export async function getPortfolios(): Promise<PortfolioType[]> {
  try {
    await connectToDB();
    const portfolios = await Portfolio.find({}).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(portfolios));
  } catch (error) {
    console.error("Error al obtener portafolios:", error);
    throw new Error("No se pudieron obtener los portafolios.");
  }
}

export async function getPortfolioBySlug(
  slug: string
): Promise<PortfolioType | null> {
  try {
    await connectToDB();
    const portfolio = await Portfolio.findOne({ slug }).lean();
    return portfolio ? JSON.parse(JSON.stringify(portfolio)) : null;
  } catch (error) {
    console.error("Error al obtener portafolio por slug:", error);
    throw new Error("No se pudo obtener el portafolio.");
  }
}

export async function createPortfolio(
  data: NewPortfolioData
): Promise<PortfolioType> {
  await connectToDB();
  const { name, tickers } = data;
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  if (await Portfolio.findOne({ slug })) {
    throw new Error(`El portafolio con el nombre "${name}" ya existe.`);
  }

  const newPortfolio = new Portfolio({ name, slug, tickers, carteras: [] });
  await newPortfolio.save();

  revalidatePath("/portafolio");
  return JSON.parse(JSON.stringify(newPortfolio));
}

export async function addTickerToPortfolio(
  portfolioSlug: string,
  ticker: string
): Promise<void> {
  await connectToDB();
  const portfolio = await Portfolio.findOne({ slug: portfolioSlug });
  if (!portfolio) throw new Error("Portafolio no encontrado.");
  if (portfolio.tickers.includes(ticker))
    throw new Error("El ticker ya existe en la lista principal.");

  portfolio.tickers.push(ticker);
  await portfolio.save();
  revalidatePath(`/portafolio/${portfolioSlug}`);
}

export async function removeTickerFromPortfolio(
  portfolioSlug: string,
  ticker: string
): Promise<void> {
  await connectToDB();
  const portfolio = await Portfolio.findOne({ slug: portfolioSlug });
  if (!portfolio) throw new Error("Portafolio no encontrado.");

  portfolio.tickers = portfolio.tickers.filter((t: string) => t !== ticker);
  await portfolio.save();
  revalidatePath(`/portafolio/${portfolioSlug}`);
}

export async function deletePortfolio(
  portfolioSlug: string
): Promise<{ message: string }> {
  await connectToDB();
  const result = await Portfolio.deleteOne({ slug: portfolioSlug });
  if (result.deletedCount === 0)
    throw new Error("No se encontró el portafolio para eliminar.");

  revalidatePath("/portafolio");
  return { message: "Portafolio eliminado exitosamente." };
}

export async function createCartera(data: NewCarteraData): Promise<Cartera> {
  await connectToDB();
  const { portfolioSlug, name } = data;

  const portfolio = await Portfolio.findOne({ slug: portfolioSlug });
  if (!portfolio) throw new Error("Portafolio no encontrado.");

  const carteraSlug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  if (portfolio.carteras.some((c: Cartera) => c.slug === carteraSlug)) {
    throw new Error(`La cartera con el nombre "${name}" ya existe.`);
  }

  const newCartera: Cartera = { name, slug: carteraSlug, tickers: [] }; // Inicia con tickers vacíos

  portfolio.carteras.push(newCartera);
  await portfolio.save();

  revalidatePath(`/portafolio/${portfolioSlug}`);
  return JSON.parse(JSON.stringify(newCartera));
}
