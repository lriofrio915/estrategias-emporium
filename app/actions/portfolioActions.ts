// app/actions/portfolioActions.ts
"use server";

import { revalidatePath } from "next/cache";
import Portfolio from "@/models/Portfolio"; // Asegúrate de que la ruta a tu modelo sea correcta
import connectToDB from "@/lib/mongodb";
import { Portfolio as PortfolioType, Cartera } from "@/types/api";

// --- INTERFACES PARA LOS DATOS ---
interface NewPortfolioData {
  name: string;
  tickers: string[];
}

interface NewCarteraData {
  portfolioSlug: string;
  name: string;
}

// --- ACCIONES PARA PORTAFOLIOS ---

export async function getPortfolios(): Promise<PortfolioType[]> {
  await connectToDB();
  const portfolios = await Portfolio.find({}).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(portfolios));
}

export async function getPortfolioBySlug(
  slug: string
): Promise<PortfolioType | null> {
  await connectToDB();
  const portfolio = await Portfolio.findOne({ slug }).lean();
  return portfolio ? JSON.parse(JSON.stringify(portfolio)) : null;
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

// --- ACCIONES PARA LISTA PRINCIPAL DE TICKERS ---

export async function addTickerToPortfolio(
  portfolioSlug: string,
  ticker: string
): Promise<void> {
  await connectToDB();
  const portfolio = await Portfolio.findOneAndUpdate(
    { slug: portfolioSlug },
    { $addToSet: { tickers: ticker } } // $addToSet evita duplicados
  );
  if (!portfolio) throw new Error("Portafolio no encontrado.");
  revalidatePath(`/portafolio/${portfolioSlug}`);
}

export async function removeTickerFromPortfolio(
  portfolioSlug: string,
  ticker: string
): Promise<void> {
  await connectToDB();
  const portfolio = await Portfolio.findOneAndUpdate(
    { slug: portfolioSlug },
    { $pull: { tickers: ticker } } // $pull elimina el elemento del array
  );
  if (!portfolio) throw new Error("Portafolio no encontrado.");
  revalidatePath(`/portafolio/${portfolioSlug}`);
}

// --- ACCIONES PARA CARTERAS ESPECÍFICAS ---

export async function createCartera(data: NewCarteraData): Promise<Cartera> {
  await connectToDB();
  const { portfolioSlug, name } = data;
  const carteraSlug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const portfolio = await Portfolio.findOne({ slug: portfolioSlug });
  if (!portfolio) throw new Error("Portafolio no encontrado.");
  if (portfolio.carteras.some((c: Cartera) => c.slug === carteraSlug)) {
    throw new Error(`La cartera con el nombre "${name}" ya existe.`);
  }

  const newCartera: Cartera = { name, slug: carteraSlug, tickers: [] };
  portfolio.carteras.push(newCartera);
  await portfolio.save();

  revalidatePath(`/portafolio/${portfolioSlug}`);
  return JSON.parse(JSON.stringify(newCartera));
}

export async function deleteCartera(
  portfolioSlug: string,
  carteraSlug: string
): Promise<void> {
  await connectToDB();
  const portfolio = await Portfolio.findOneAndUpdate(
    { slug: portfolioSlug },
    { $pull: { carteras: { slug: carteraSlug } } }
  );
  if (!portfolio) throw new Error("Portafolio no encontrado.");
  revalidatePath(`/portafolio/${portfolioSlug}`);
}

export async function addTickerToCartera(
  portfolioSlug: string,
  carteraSlug: string,
  ticker: string
): Promise<void> {
  await connectToDB();
  const portfolio = await Portfolio.findOne({
    slug: portfolioSlug,
    "carteras.slug": carteraSlug,
  });
  if (!portfolio) throw new Error("Portafolio o cartera no encontrados.");

  // Evitar duplicados
  const cartera = portfolio.carteras.find(
    (c: Cartera) => c.slug === carteraSlug
  );
  if (cartera && cartera.tickers.includes(ticker)) {
    throw new Error("El ticker ya existe en esta cartera.");
  }

  await Portfolio.updateOne(
    { slug: portfolioSlug, "carteras.slug": carteraSlug },
    { $addToSet: { "carteras.$.tickers": ticker } }
  );
  revalidatePath(`/portafolio/${portfolioSlug}/${carteraSlug}`);
}

export async function removeTickerFromCartera(
  portfolioSlug: string,
  carteraSlug: string,
  ticker: string
): Promise<void> {
  await connectToDB();
  const portfolio = await Portfolio.updateOne(
    { slug: portfolioSlug, "carteras.slug": carteraSlug },
    { $pull: { "carteras.$.tickers": ticker } }
  );
  if (portfolio.modifiedCount === 0)
    throw new Error("Portafolio o cartera no encontrados.");
  revalidatePath(`/portafolio/${portfolioSlug}/${carteraSlug}`);
}
