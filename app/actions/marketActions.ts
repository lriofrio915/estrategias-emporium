// app/actions/marketActions.ts
"use server";

import { revalidatePath } from "next/cache";
import yahooFinance from "yahoo-finance2";
import dbConnect from "@/lib/mongodb";
import Recommendation, { IRecommendation } from "@/models/Recommendation";
import { uploadFileToGCS, deleteFileFromGCS } from "@/lib/gcs";
import {
  Recommendation as ClientRecommendation,
} from "@/types/market";
import { MoverQuote } from "@/types/api";

const ROWS_PER_PAGE = 10;

// Tipos de retorno para las acciones con paginación
interface GetRecommendationsResult {
  recommendations: ClientRecommendation[];
  totalPages: number;
  totalCount: number;
  error?: string;
}
interface ActionResponse {
  success?: boolean;
  error?: string;
  updated?: number;
  message?: string;
}

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

// --- FUNCIONES DE MERCADO (Sin cambios) ---
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

/**
 * Obtiene recomendaciones con paginación.
 */
export async function getRecommendations(
  page: number = 1
): Promise<GetRecommendationsResult> {
  await dbConnect();
  const skip = (page - 1) * ROWS_PER_PAGE;

  try {
    const totalCount = await Recommendation.countDocuments();
    const recommendations = await Recommendation.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(ROWS_PER_PAGE)
      .exec();

    const totalPages = Math.ceil(totalCount / ROWS_PER_PAGE);

    return {
      recommendations: JSON.parse(JSON.stringify(recommendations)),
      totalPages,
      totalCount,
    };
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return {
      recommendations: [],
      totalPages: 0,
      totalCount: 0,
      error: "Fallo al cargar las recomendaciones con paginación.",
    };
  }
}

/**
 * Crea una recomendación (sin requerir archivo).
 */
export async function createRecommendation(
  formData: FormData
): Promise<ActionResponse> {
  await dbConnect();

  try {
    // 1. Extraer campos de texto
    const ticker = formData.get("ticker") as string;
    const buyPrice = parseFloat(formData.get("buyPrice") as string); // P. Rec. (P. Compra)
    const targetPrice = parseFloat(formData.get("targetPrice") as string);
    const responsible = formData.get("responsible") as string;
    const reportFile = formData.get("reportFile") as File;

    if (!ticker || isNaN(buyPrice) || isNaN(targetPrice) || !responsible) {
      return {
        success: false,
        error: "Campos de texto incompletos o inválidos.",
      };
    }

    // 2. Obtener el precio actual
    const quoteResult = await yahooFinance.quote(ticker);
    const quote = Array.isArray(quoteResult) ? quoteResult[0] : quoteResult;

    if (!quote || typeof quote.regularMarketPrice !== "number") {
      throw new Error(`Ticker "${ticker}" no válido o sin precio.`);
    }

    // 3. Procesar y subir el archivo (si existe)
    let reportUrl: string | null = null;
    let reportMimeType: string | null = null;

    if (reportFile && reportFile.size > 0) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(reportFile.type)) {
        return {
          success: false,
          error: "Tipo de archivo no permitido. Solo PDF o Word (doc/docx).",
        };
      }

      const fileBuffer = Buffer.from(await reportFile.arrayBuffer());
      reportUrl = await uploadFileToGCS(
        fileBuffer,
        reportFile.type,
        reportFile.name
      );
      reportMimeType = reportFile.type;
    }

    // 4. Crear el nuevo documento en MongoDB
    await Recommendation.create({
      ticker: ticker.toUpperCase(),
      purchasePrice: buyPrice, // <-- Lo que se muestra en P. Rec.
      buyPrice: buyPrice, // <-- Mantengo para compatibilidad con código antiguo
      currentPrice: quote.regularMarketPrice,
      targetPrice: targetPrice,
      responsible,
      assetName: quote.longName || ticker,
      reportUrl,
      reportMimeType,
    });

    revalidatePath("/recomendaciones");

    return { success: true, message: "Recomendación creada con éxito." };
  } catch (error) {
    console.error("Error creating recommendation:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error desconocido al crear la recomendación.";
    return {
      error: errorMessage,
    };
  }
}

/**
 * NUEVA ACCIÓN: Actualiza los campos de una recomendación existente y maneja la subida de archivo.
 */
export async function updateRecommendationData(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  await dbConnect();
  try {
    const existingRec = await Recommendation.findById(id);
    if (!existingRec) {
      return {
        success: false,
        error: "Recomendación no encontrada para actualizar.",
      };
    }

    // 1. Extraer campos de texto
    const ticker = (formData.get("ticker") as string).toUpperCase();
    const purchasePrice = parseFloat(formData.get("purchasePrice") as string);
    const targetPrice = parseFloat(formData.get("targetPrice") as string);
    const responsible = formData.get("responsible") as string;
    const removeFile = formData.get("removeFile") === "true";
    const reportFile = formData.get("reportFile") as File;

    if (!ticker || isNaN(purchasePrice) || isNaN(targetPrice) || !responsible) {
      return {
        success: false,
        error: "Campos de texto incompletos o inválidos.",
      };
    }

    const updateData: Partial<IRecommendation> = {
      ticker,
      purchasePrice,
      buyPrice: purchasePrice, // Mantener buyPrice sincronizado para evitar el problema de N/A en código antiguo
      targetPrice,
      responsible,
      reportUrl: existingRec.reportUrl, // Inicializar con el valor existente
      reportMimeType: existingRec.reportMimeType,
    };

    // 2. Manejar la eliminación del archivo existente
    if (removeFile && existingRec.reportUrl) {
      await deleteFileFromGCS(existingRec.reportUrl);
      updateData.reportUrl = null;
      updateData.reportMimeType = null;
    }

    // 3. Manejar la subida de un NUEVO archivo
    if (reportFile && reportFile.size > 0) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(reportFile.type)) {
        return {
          success: false,
          error: "Tipo de archivo no permitido. Solo PDF o Word (doc/docx).",
        };
      }

      // Si hay un nuevo archivo, elimina el anterior (si existe)
      if (existingRec.reportUrl) {
        await deleteFileFromGCS(existingRec.reportUrl);
      }

      const fileBuffer = Buffer.from(await reportFile.arrayBuffer());
      updateData.reportUrl = await uploadFileToGCS(
        fileBuffer,
        reportFile.type,
        reportFile.name
      );
      updateData.reportMimeType = reportFile.type;
    }

    // 4. Actualizar el documento en la base de datos
    await Recommendation.findByIdAndUpdate(id, updateData, { new: true });

    // 5. Revalidar
    revalidatePath("/recomendaciones");

    return { success: true, message: "Recomendación actualizada con éxito." };
  } catch (error) {
    console.error("Error updating recommendation data:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error desconocido al actualizar la recomendación.";
    return { success: false, error: errorMessage };
  }
}

// --- RESTO DE ACCIONES (Sin cambios) ---
export async function updateRecommendationStatus(
  id: string,
  status: "COMPRAR" | "MANTENER" | "VENDER"
): Promise<ActionResponse> {
  try {
    await dbConnect();
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

    await Recommendation.findByIdAndUpdate(id, updateData, { new: true });
    revalidatePath("/recomendaciones");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo actualizar.",
    };
  }
}

export async function deleteRecommendation(
  id: string
): Promise<ActionResponse> {
  await dbConnect();
  try {
    const recommendation = await Recommendation.findById(id);

    if (!recommendation) {
      return { success: false, error: "Recomendación no encontrada." };
    }

    if (recommendation.reportUrl) {
      await deleteFileFromGCS(recommendation.reportUrl);
    }

    await Recommendation.findByIdAndDelete(id);

    revalidatePath("/recomendaciones");
    return { success: true };
  } catch (error) {
    console.error("Error deleting recommendation:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la recomendación.",
    };
  }
}

export async function refreshRecommendationPrices(): Promise<ActionResponse> {
  await dbConnect();
  try {
    const recommendations = await Recommendation.find({
      status: { $ne: "VENDER" },
    }).select("_id ticker");

    const updates = recommendations.map(async (rec) => {
      try {
        const quoteResult = await yahooFinance.quote(rec.ticker);
        const quote = Array.isArray(quoteResult) ? quoteResult[0] : quoteResult;

        if (typeof quote?.regularMarketPrice === "number") {
          await Recommendation.updateOne(
            { _id: rec._id },
            { $set: { currentPrice: quote.regularMarketPrice } }
          );
        }
      } catch (err) {
        console.error(
          `No se pudo actualizar el precio para ${rec.ticker} (Probable: Yahoo Finance):`,
          err
        );
      }
    });

    await Promise.all(updates);
    revalidatePath("/recomendaciones");
    return { success: true, updated: recommendations.length };
  } catch (error) {
    console.error("Error al refrescar precios (General):", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudieron refrescar los precios.",
    };
  }
}
