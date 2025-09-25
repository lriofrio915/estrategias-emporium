"use server";

import { revalidatePath } from "next/cache";
import yahooFinance from "yahoo-finance2";
import connectToDB from "@/lib/mongodb";
import Recommendation from "@/models/Recommendation";
import { IRecommendation } from "@/models/Recommendation";

// --- ACCIÓN PARA DATOS DE MERCADO (MOVERS) ---

export async function getDayMovers() {
  try {
    const [gainers, losers] = await Promise.all([
      yahooFinance.screener({ count: 10, scrIds: "day_gainers" }),
      yahooFinance.screener({ count: 10, scrIds: "day_losers" }),
    ]);
    return {
      gainers: gainers.quotes,
      losers: losers.quotes,
      error: null,
    };
  } catch (error) {
    console.error("Error al obtener movers del día:", error);
    return {
      gainers: [],
      losers: [],
      error: "No se pudieron obtener los datos del mercado.",
    };
  }
}

// --- ACCIONES CRUD PARA RECOMENDACIONES ---

type CreateRecommendationInput = {
  ticker: string;
  buyPrice: number;
  targetPrice: number;
  responsible: string;
};

export async function createRecommendation(data: CreateRecommendationInput) {
  try {
    await connectToDB();
    const quoteResult = await yahooFinance.quote(data.ticker);

    // SOLUCIÓN: Verificamos si la respuesta es un array y tomamos el primer elemento.
    const quote = Array.isArray(quoteResult) ? quoteResult[0] : quoteResult;

    if (!quote || typeof quote.regularMarketPrice !== "number") {
      throw new Error(`Ticker "${data.ticker}" no válido o sin precio.`);
    }

    const newRecommendation = new Recommendation({
      ...data,
      assetName: quote.longName || data.ticker,
      currentPrice: quote.regularMarketPrice,
    });

    await newRecommendation.save();
    revalidatePath("/stock-screener");
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "No se pudo crear la recomendación.",
    };
  }
}

export async function getRecommendations(): Promise<IRecommendation[]> {
  await connectToDB();
  const recommendations = await Recommendation.find({})
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(recommendations));
}

export async function updateRecommendationStatus(
  id: string,
  status: "COMPRAR" | "MANTENER" | "VENDER"
) {
  try {
    await connectToDB();
    const recommendation = await Recommendation.findById(id);
    if (!recommendation) throw new Error("Recomendación no encontrada.");

    let updateData: Partial<IRecommendation> = { status };

    if (status === "VENDER" && recommendation.status !== "VENDER") {
      const quoteResult = await yahooFinance.quote(recommendation.ticker);
      // SOLUCIÓN: Repetimos la misma lógica aquí.
      const quote = Array.isArray(quoteResult) ? quoteResult[0] : quoteResult;

      updateData.sellPrice =
        typeof quote?.regularMarketPrice === "number"
          ? quote.regularMarketPrice
          : recommendation.currentPrice;
    }

    await Recommendation.findByIdAndUpdate(id, updateData);
    revalidatePath("/stock-screener");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo actualizar.",
    };
  }
}

export async function deleteRecommendation(id: string) {
  try {
    await connectToDB();
    await Recommendation.findByIdAndDelete(id);
    revalidatePath("/stock-screener");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo eliminar.",
    };
  }
}

export async function refreshRecommendationPrices() {
  try {
    await connectToDB();
    const recommendations = await Recommendation.find({
      status: { $ne: "VENDER" },
    });

    const updates = recommendations.map(async (rec) => {
      try {
        const quoteResult = await yahooFinance.quote(rec.ticker);
        // SOLUCIÓN: Y una vez más aquí.
        const quote = Array.isArray(quoteResult) ? quoteResult[0] : quoteResult;

        if (typeof quote?.regularMarketPrice === "number") {
          rec.currentPrice = quote.regularMarketPrice;
          await rec.save();
        }
      } catch (err) {
        console.error(
          `No se pudo actualizar el precio para ${rec.ticker}:`,
          err
        );
      }
    });

    await Promise.all(updates);
    revalidatePath("/stock-screener");
    return { success: true, updated: recommendations.length };
  } catch (error) {
    console.error("Error al refrescar precios:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "No se pudieron refrescar los precios."
    );
  }
}
