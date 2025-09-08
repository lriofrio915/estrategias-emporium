// Extrae la tabla de "Balance Sheet" de Yahoo Finance para un ticker dado.

import { NextResponse } from "next/server";
import { chromium, Browser } from "playwright";

// Define la interfaz con las nuevas métricas.
type BalanceSheetResponse = {
  headers: string[]; // p.ej. ["1/31/2025","1/31/2024","1/31/2023","1/31/2022"]
  metrics: {
    totalAssets: number[];
    totalLiabilitiesNetMinorityInterest: number[];
    totalEquityGrossMinorityInterest: number[];
    totalCapitalization: number[];
    commonStockEquity: number[];
    capitalLeaseObligations: number[];
    netTangibleAssets: number[];
    workingCapital: number[];
    investedCapital: number[];
    tangibleBookValue: number[];
    totalDebt: number[];
    netDebt: number[];
    shareIssued: number[];
    ordinarySharesNumber: number[];
    // Se añade la nueva métrica
    currentAssets: number[];
  };
};

/** Convierte "2,450,670" o "-" a número */
const cleanAndParseValue = (text: string) => {
  if (!text || text.trim() === "-" || text.trim() === "—") return 0;
  const value = parseFloat(text.replace(/,/g, ""));
  return Number.isFinite(value) ? value : 0;
};

/**
 * Lista de filas a extraer (tal como las muestra Yahoo en Balance Sheet).
 * Usamos varias variantes de búsqueda para mayor tolerancia a cambios menores.
 */
const ROWS: Record<keyof BalanceSheetResponse["metrics"], string[]> = {
  totalAssets: ["total assets"],
  totalLiabilitiesNetMinorityInterest: [
    "total liabilities net minority interest",
    "total liabilities net minority",
  ],
  totalEquityGrossMinorityInterest: [
    "total equity gross minority interest",
    "total equity gross minority",
  ],
  totalCapitalization: ["total capitalization"],
  commonStockEquity: ["common stock equity"],
  capitalLeaseObligations: [
    "capital lease obligations",
    "finance lease obligations",
  ],
  netTangibleAssets: ["net tangible assets"],
  workingCapital: ["working capital"],
  investedCapital: ["invested capital"],
  tangibleBookValue: ["tangible book value"],
  totalDebt: ["total debt", "total debt and capital lease obligation"],
  netDebt: ["net debt"],
  shareIssued: ["share issued", "shares issued"],
  ordinarySharesNumber: ["ordinary shares number", "ordinary shares"],
  // Se añade una variante de búsqueda para 'Current Assets'
  currentAssets: ["current assets", "total current assets"],
};

export async function GET(request: Request) {
  let browser: Browser | undefined;

  try {
    const { searchParams } = new URL(request.url);
    const rawTicker = searchParams.get("ticker");

    if (!rawTicker) {
      return NextResponse.json(
        { error: 'Falta el parámetro "ticker".' },
        { status: 400 }
      );
    }

    const ticker = rawTicker.trim();
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const url = `https://finance.yahoo.com/quote/${ticker}/balance-sheet/`;
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Un ancla estable: el <h1> con el nombre del activo
    await page.waitForSelector("h1", { timeout: 20000 });

    // Simular el clic para expandir "Total Assets"
    try {
      // Selector más robusto para el botón de expansión
      await page.click('div.row:has-text("Total Assets") button');
      // Esperar un momento para que el contenido se cargue dinámicamente
      await page.waitForTimeout(1000);
    } catch {
      console.warn(
        "No se pudo hacer clic en el botón de expansión. Ignorando."
      );
    }

    // Re-evaluamos para cada fila deseada (evita mover mucha lógica al navegador)
    const rowValues: Record<string, string[]> = {};
    await page.waitForSelector("div.tableBody .row .rowTitle", {
      timeout: 15000,
    });

    for (const [key, labelList] of Object.entries(ROWS)) {
      const values = await page.evaluate((labels: string[]) => {
        const allRows = Array.from(
          document.querySelectorAll("div.tableBody .row")
        );
        const target = allRows.find((row) => {
          const title =
            row.querySelector(".rowTitle")?.textContent?.trim() || "";
          const titleNorm = title.replace(/\s+/g, " ").trim().toLowerCase();
          // Lógica de búsqueda mejorada para 'Current Assets'
          return labels.some((l) => titleNorm.includes(l));
        });
        if (!target) return [];
        const cols = target.querySelectorAll("div.column:not(.sticky)");
        return Array.from(cols).map((c) => c.textContent?.trim() || "");
      }, labelList);

      rowValues[key] = values;
    }

    // También toma los encabezados ya que en el primer evaluate no los usamos
    const headers = await page.evaluate(() => {
      const headerRow = document.querySelector("div.tableHeader .row");
      const cols = Array.from(headerRow?.querySelectorAll("div.column") || [])
        .map((c) => c.textContent?.trim() || "")
        .filter((t) => t && t !== "Breakdown");
      return cols;
    });

    if (!headers.length) {
      throw new Error("No se detectaron encabezados de la tabla.");
    }

    const formatted: BalanceSheetResponse = {
      headers,
      metrics: {
        totalAssets: (rowValues["totalAssets"] || []).map(cleanAndParseValue),
        totalLiabilitiesNetMinorityInterest: (
          rowValues["totalLiabilitiesNetMinorityInterest"] || []
        ).map(cleanAndParseValue),
        totalEquityGrossMinorityInterest: (
          rowValues["totalEquityGrossMinorityInterest"] || []
        ).map(cleanAndParseValue),
        totalCapitalization: (rowValues["totalCapitalization"] || []).map(
          cleanAndParseValue
        ),
        commonStockEquity: (rowValues["commonStockEquity"] || []).map(
          cleanAndParseValue
        ),
        capitalLeaseObligations: (
          rowValues["capitalLeaseObligations"] || []
        ).map(cleanAndParseValue),
        netTangibleAssets: (rowValues["netTangibleAssets"] || []).map(
          cleanAndParseValue
        ),
        workingCapital: (rowValues["workingCapital"] || []).map(
          cleanAndParseValue
        ),
        investedCapital: (rowValues["investedCapital"] || []).map(
          cleanAndParseValue
        ),
        tangibleBookValue: (rowValues["tangibleBookValue"] || []).map(
          cleanAndParseValue
        ),
        totalDebt: (rowValues["totalDebt"] || []).map(cleanAndParseValue),
        netDebt: (rowValues["netDebt"] || []).map(cleanAndParseValue),
        shareIssued: (rowValues["shareIssued"] || []).map(cleanAndParseValue),
        ordinarySharesNumber: (rowValues["ordinarySharesNumber"] || []).map(
          cleanAndParseValue
        ),
        // Se añade el nuevo campo
        currentAssets: (rowValues["currentAssets"] || []).map(
          cleanAndParseValue
        ),
      },
    };

    // Validación básica: al menos una fila con datos
    const hasAnyData = Object.values(formatted.metrics).some(
      (arr) => Array.isArray(arr) && arr.length > 0
    );
    if (!hasAnyData) {
      throw new Error("No se encontraron filas en la tabla (Balance Sheet).");
    }

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error Balance Sheet scraping:", err);
    return NextResponse.json(
      { error: "Error al obtener el Balance Sheet desde Yahoo." },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}
