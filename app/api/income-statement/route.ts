// API Route para el App Router de Next.js (versión 13+)
// Este script extrae datos financieros de la página de Yahoo Finance para un ticker específico.

import { NextResponse } from "next/server";
import { chromium } from "playwright";

/**
 * Limpia y convierte una cadena de texto de un valor financiero a un número.
 * @param text El texto del valor (e.g., "2,450,670", "-").
 * @returns El valor numérico.
 */
const cleanAndParseValue = (text: string) => {
  if (!text || text.trim() === "-") {
    return 0;
  }
  // Elimina las comas y convierte a número
  const value = parseFloat(text.replace(/,/g, ""));
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

    // Inicia un navegador Chromium en modo headless (sin interfaz gráfica)
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const url = `https://finance.yahoo.com/quote/${ticker}/financials/`;
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Espera a que el título de la empresa sea visible, un selector muy estable
    await page.waitForSelector("h1", { timeout: 20000 });

    const financialData = await page.evaluate(() => {
      // Función auxiliar para obtener todos los valores de una fila por su título de texto
      const getRowValues = (rowTitle: string): string[] => {
        const row = Array.from(
          document.querySelectorAll("div.tableBody .row")
        ).find((rowElement) => {
          const titleElement = rowElement.querySelector(".rowTitle");
          return titleElement?.textContent?.trim() === rowTitle;
        });

        if (!row) return [];

        const columns = row.querySelectorAll("div.column:not(.sticky)");
        return Array.from(columns).map((col) => col.textContent?.trim() || "");
      };

      // Obtiene los encabezados de la tabla (las fechas)
      const headerRow = document.querySelector("div.tableHeader .row");
      const headers = Array.from(
        headerRow?.querySelectorAll("div.column") || []
      )
        .map((th) => th.textContent?.trim() || "")
        .filter((header) => header !== "Breakdown" && header !== "");

      return {
        headers,
        totalRevenue: getRowValues("Total Revenue"),
        costOfRevenue: getRowValues("Cost of Revenue"),
        grossProfit: getRowValues("Gross Profit"),
        ebit: getRowValues("EBIT"),
        ebitda: getRowValues("EBITDA"),
        netIncome: getRowValues("Net Income Common Stockholders"),
        basicEps: getRowValues("Basic EPS"),
        dilutedEps: getRowValues("Diluted EPS"),
        basicAverageShares: getRowValues("Basic Average Shares"),
        dilutedAverageShares: getRowValues("Diluted Average Shares"),
        taxRateForCalcs: getRowValues("Tax Rate for Calcs"),
        taxEffectOfUnusualItems: getRowValues("Tax Effect of Unusual Items"),
        // Se añade la nueva métrica
        pretaxIncome: getRowValues("Pretax Income"),
      };
    });

    // Si no se encuentra ningún dato, lanza un error
    if (Object.values(financialData).every((val) => !val || val.length === 0)) {
      throw new Error("No se encontraron los datos de la tabla.");
    }

    // Procesa y formatea los datos extraídos
    const formattedData = {
      headers: financialData.headers,
      metrics: {
        totalRevenue: financialData.totalRevenue.map(cleanAndParseValue),
        costOfRevenue: financialData.costOfRevenue.map(cleanAndParseValue),
        grossProfit: financialData.grossProfit.map(cleanAndParseValue),
        ebit: financialData.ebit.map(cleanAndParseValue),
        ebitda: financialData.ebitda.map(cleanAndParseValue),
        netIncome: financialData.netIncome.map(cleanAndParseValue),
        basicEps: financialData.basicEps.map(cleanAndParseValue),
        dilutedEps: financialData.dilutedEps.map(cleanAndParseValue),
        basicAverageShares:
          financialData.basicAverageShares.map(cleanAndParseValue),
        dilutedAverageShares:
          financialData.dilutedAverageShares.map(cleanAndParseValue),
        taxRateForCalcs: financialData.taxRateForCalcs.map(cleanAndParseValue),
        taxEffectOfUnusualItems:
          financialData.taxEffectOfUnusualItems.map(cleanAndParseValue),
        // Se añade el nuevo campo
        pretaxIncome: financialData.pretaxIncome.map(cleanAndParseValue),
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
      { error: "Error al obtener los datos financieros." },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
