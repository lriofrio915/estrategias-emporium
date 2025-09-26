"use server";

import { revalidatePath } from "next/cache";
import yahooFinance from "yahoo-finance2";
// SOLUCIÓN: Corregida la ruta de importación y el nombre del import
import dbConnect from "@/lib/mongodb";
import Recommendation, { IRecommendation } from "@/models/Recommendation";
import {
  Recommendation as ClientRecommendation,
  NewRecommendationData,
} from "@/types/market";
import { MoverQuote } from "@/types/api";

// Lista de tickers para YTD (sin cambios)
const sp500Tickers = [
  "MSFT",
  "NVDA",
  "AAPL",
  "AMZN",
  "META",
  "AVGO",
  "GOOGL",
  "TSLA",
  "BRK.B",
  "GOOG",
  "JPM",
  "V",
  "LLY",
  "NFLX",
  "MA",
  "COST",
  "XOM",
  "WMT",
  "PG",
  "JNJ",
  "HD",
  "ABBV",
  "BAC",
  "UNH",
  "KO",
  "PM",
  "CRM",
  "ORCL",
  "CSCO",
  "GE",
  "PLTR",
  "IBM",
  "WFC",
  "ABT",
  "MCD",
  "CVX",
  "LIN",
  "NOW",
  "DIS",
  "ACN",
  "T",
  "ISRG",
  "MRK",
  "UBER",
  "GS",
  "INTU",
  "VZ",
  "AMD",
  "ADBE",
  "RTX",
  "PEP",
  "BKNG",
  "TXN",
  "QCOM",
  "PGR",
  "CAT",
  "SPGI",
  "AXP",
  "MS",
  "BSX",
  "BA",
  "TMO",
  "SCHW",
  "TJX",
  "NEE",
  "AMGN",
  "HON",
  "BLK",
  "C",
  "UNP",
  "GILD",
  "CMCSA",
  "AMAT",
  "ADP",
  "PFE",
  "SYK",
  "DE",
  "LOW",
  "ETN",
  "GEV",
  "PANW",
  "DHR",
  "COF",
  "TMUS",
  "MMC",
  "VRTX",
  "COP",
  "ADI",
  "MDT",
  "CB",
  "CRWD",
  "MU",
  "LRCX",
  "APH",
  "KLAC",
  "CME",
  "MO",
  "BX",
  "ICE",
  "AMT",
  "LMT",
  "SO",
  "PLD",
  "ANET",
  "BMY",
  "TT",
  "SBUX",
  "ELV",
  "FI",
  "DUK",
  "WELL",
  "MCK",
  "CEG",
  "INTC",
  "CDNS",
  "CI",
  "AJG",
  "WM",
  "PH",
  "MDLZ",
  "EQIX",
  "SHW",
  "MMM",
  "KKR",
  "TDG",
  "ORLY",
  "CVS",
  "SNPS",
  "AON",
  "CTAS",
  "CL",
  "MCO",
  "ZTS",
  "MSI",
  "PYPL",
  "NKE",
  "WMB",
  "GD",
  "UPS",
  "DASH",
  "CMG",
  "HCA",
  "PNC",
  "USB",
  "HWM",
  "ECL",
  "EMR",
  "ITW",
  "FTNT",
  "AZO",
  "NOC",
  "JCI",
  "BK",
  "REGN",
  "ADSK",
  "EOG",
  "TRV",
  "ROP",
  "APD",
  "NEM",
  "MAR",
  "HLT",
  "RCL",
  "CSX",
  "APO",
  "CARR",
  "WDAY",
  "ABNB",
  "AEP",
  "COIN",
  "FCX",
];

// --- ACCIONES DE MERCADO (MOVERS) ---

export async function getDayMovers(): Promise<{
  gainers: MoverQuote[];
  losers: MoverQuote[];
  error: string | null;
}> {
  try {
    const [gainers, losers] = await Promise.all([
      yahooFinance.screener({ count: 10, scrIds: "day_gainers" }),
      yahooFinance.screener({ count: 10, scrIds: "day_losers" }),
    ]);
    return {
      gainers: gainers.quotes as MoverQuote[],
      losers: losers.quotes as MoverQuote[],
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

export async function getYtdMovers(): Promise<{
  gainers: MoverQuote[];
  losers: MoverQuote[];
  error: string | null;
}> {
  try {
    const today = new Date();
    const yearStart = new Date(today.getFullYear(), 0, 1);

    const historicalDataPromises = sp500Tickers.map((ticker) =>
      yahooFinance.historical(ticker, {
        period1: yearStart,
        period2: today,
        interval: "1d",
      })
    );
    const allHistoricalData = await Promise.allSettled(historicalDataPromises);

    const ytdPerformances: MoverQuote[] = allHistoricalData
      .map((result, index) => {
        if (result.status === "fulfilled" && result.value.length > 1) {
          const startPrice = result.value[0].close;
          const endPrice = result.value[result.value.length - 1].close;
          const ytdChange = ((endPrice - startPrice) / startPrice) * 100;
          return {
            symbol: sp500Tickers[index],
            regularMarketChangePercent: ytdChange,
            regularMarketPrice: endPrice,
          } as MoverQuote;
        }
        return null;
      })
      .filter((item): item is MoverQuote => item !== null);

    ytdPerformances.sort(
      (a, b) =>
        (b.regularMarketChangePercent ?? 0) -
        (a.regularMarketChangePercent ?? 0)
    );

    const gainers = ytdPerformances.slice(0, 10);
    const losers = ytdPerformances.slice(-10).reverse();

    return { gainers, losers, error: null };
  } catch (error) {
    console.error("Error al obtener movers YTD:", error);
    return {
      gainers: [],
      losers: [],
      error: "No se pudieron obtener los datos YTD del mercado.",
    };
  }
}

// --- ACCIONES CRUD PARA RECOMENDACIONES ---

export async function createRecommendation(data: NewRecommendationData) {
  try {
    await dbConnect(); // SOLUCIÓN: Usar el nombre de función correcto
    const quoteResult = await yahooFinance.quote(data.ticker);

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

export async function getRecommendations(): Promise<ClientRecommendation[]> {
  try {
    await dbConnect(); // SOLUCIÓN: Usar el nombre de función correcto
    const recommendations = await Recommendation.find({}).sort({
      recommendationDate: -1,
    });
    return JSON.parse(JSON.stringify(recommendations));
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
}

export async function updateRecommendationStatus(
  id: string,
  status: "COMPRAR" | "MANTENER" | "VENDER"
) {
  try {
    await dbConnect(); // SOLUCIÓN: Usar el nombre de función correcto
    const recommendation = await Recommendation.findById(id);
    if (!recommendation) throw new Error("Recomendación no encontrada.");

    const updateData: Partial<IRecommendation> = { status };

    if (status === "VENDER" && recommendation.status !== "VENDER") {
      const quoteResult = await yahooFinance.quote(recommendation.ticker);
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
    await dbConnect(); // SOLUCIÓN: Usar el nombre de función correcto
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
    await dbConnect(); // SOLUCIÓN: Usar el nombre de función correcto
    const recommendations = await Recommendation.find({
      status: { $ne: "VENDER" },
    });

    const updates = recommendations.map(async (rec) => {
      try {
        const quoteResult = await yahooFinance.quote(rec.ticker);
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
