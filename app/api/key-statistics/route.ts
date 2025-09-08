// API Route para el App Router de Next.js (versión 13+)
// Este script extrae múltiplos de valoración de la página de Yahoo Finance
// para un ticker específico.

import { NextResponse } from "next/server";
import { chromium } from "playwright";

/**
 * Limpia y convierte una cadena de texto de un valor financiero a un número.
 * @param text El texto del valor (e.g., "16.13B", "1.87k", "--").
 * @returns El valor numérico.
 */
const cleanAndParseValue = (text: string): number => {
  if (!text || text.trim() === "--") {
    return 0;
  }
  // Elimina las comas y convierte a número, manejando sufijos (B, M, k)
  let value = parseFloat(text.replace(/,/g, ""));
  if (text.includes("B")) {
    value *= 1e9;
  } else if (text.includes("M")) {
    value *= 1e6;
  } else if (text.includes("k")) {
    value *= 1e3;
  }
  return isNaN(value) ? 0 : value;
};

export async function GET(request: Request) {
  let browser;
  try {
    // Extrae el ticker del parámetro de consulta
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get("ticker");

    if (!ticker) {
      return NextResponse.json(
        { error: 'Falta el parámetro "ticker" en la solicitud.' },
        { status: 400 }
      );
    }

    // Inicia un navegador Chromium en modo headless
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const url = `https://finance.yahoo.com/quote/${ticker}/key-statistics/`;
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Espera a que el título de la página sea visible
    await page.waitForSelector("h1", { timeout: 20000 });

    const valuationData = await page.evaluate(() => {
      // Función auxiliar para obtener los valores de una fila por su título
      const getRowValues = (rowTitle: string): string[] => {
        // Selector actualizado para encontrar las filas de la tabla de valoración
        const row = Array.from(
          document.querySelectorAll(
            "section[data-testid='qsp-statistics'] table tr"
          )
        ).find((rowElement) => {
          const titleElement = rowElement.querySelector("td:first-child");
          return titleElement?.textContent?.trim() === rowTitle;
        });

        if (!row) return [];

        const columns = row.querySelectorAll("td:not(:first-child)");
        return Array.from(columns).map((col) => col.textContent?.trim() || "");
      };

      // Obtiene los encabezados de la tabla (las fechas)
      const headerRow = document.querySelector(
        "section[data-testid='qsp-statistics'] table thead tr"
      );
      const headers = Array.from(headerRow?.querySelectorAll("th") || [])
        .map((th) => th.textContent?.trim() || "")
        .filter((header) => header !== "");

      // Extrae todas las filas de la tabla
      return {
        headers,
        marketCap: getRowValues("Market Cap"),
        enterpriseValue: getRowValues("Enterprise Value"),
        trailingPE: getRowValues("Trailing P/E"),
        forwardPE: getRowValues("Forward P/E"),
        pegRatio: getRowValues("PEG Ratio (5yr expected)"),
        priceSales: getRowValues("Price/Sales"),
        priceBook: getRowValues("Price/Book"),
        enterpriseValueRevenue: getRowValues("Enterprise Value/Revenue"),
        enterpriseValueEBITDA: getRowValues("Enterprise Value/EBITDA"),
      };
    });

    // Si no se encuentra ningún dato, lanza un error
    if (Object.values(valuationData).every((val) => !val || val.length === 0)) {
      throw new Error("No se encontraron los datos de valoración.");
    }

    // Procesa y formatea los datos extraídos
    const formattedData = {
      headers: valuationData.headers,
      metrics: {
        marketCap: valuationData.marketCap.map(cleanAndParseValue),
        enterpriseValue: valuationData.enterpriseValue.map(cleanAndParseValue),
        trailingPE: valuationData.trailingPE.map(cleanAndParseValue),
        forwardPE: valuationData.forwardPE.map(cleanAndParseValue),
        pegRatio: valuationData.pegRatio.map(cleanAndParseValue),
        priceSales: valuationData.priceSales.map(cleanAndParseValue),
        priceBook: valuationData.priceBook.map(cleanAndParseValue),
        enterpriseValueRevenue:
          valuationData.enterpriseValueRevenue.map(cleanAndParseValue),
        enterpriseValueEBITDA:
          valuationData.enterpriseValueEBITDA.map(cleanAndParseValue),
      },
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error durante el web scraping:", error.message);
    } else {
      console.error("Ocurrió un error desconocido:", error);
    }
    return NextResponse.json(
      { error: "Error al obtener los datos de valoración." },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
