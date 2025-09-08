// Extrae la tabla de "Cash Flow" de Yahoo Finance para un ticker dado.

import { NextResponse } from "next/server";
import { chromium, Browser } from "playwright";

type CashFlowResponse = {
  headers: string[];
  metrics: {
    operatingCashFlow: number[];
    investingCashFlow: number[];
    financingCashFlow: number[];
    endCashPosition: number[];
    incomeTaxPaid: number[];
    interestPaid: number[];
    capitalExpenditure: number[];
    issuanceOfDebt: number[];
    repaymentOfDebt: number[];
    freeCashFlow: number[];
  };
};

const cleanAndParseValue = (text: string) => {
  if (
    !text ||
    text.trim() === "-" ||
    text.trim() === "—" ||
    text.trim() === "--"
  )
    return 0;
  const value = parseFloat(text.replace(/,/g, ""));
  return Number.isFinite(value) ? value : 0;
};

const ROWS: Record<keyof CashFlowResponse["metrics"], string[]> = {
  operatingCashFlow: ["operating cash flow"],
  investingCashFlow: ["investing cash flow"],
  financingCashFlow: ["financing cash flow"],
  endCashPosition: ["end cash position"],
  incomeTaxPaid: ["income tax paid supplemental data", "income tax paid"],
  interestPaid: ["interest paid supplemental data", "interest paid"],
  capitalExpenditure: ["capital expenditure"],
  issuanceOfDebt: ["issuance of debt"],
  repaymentOfDebt: ["repayment of debt"],
  freeCashFlow: ["free cash flow"],
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

    const url = `https://finance.yahoo.com/quote/${ticker}/cash-flow/`;
    await page.goto(url, { waitUntil: "domcontentloaded" });

    await page.waitForSelector("h1", { timeout: 20000 });

    // Extraer headers
    const headers = await page.evaluate(() => {
      const headerRow = document.querySelector("div.tableHeader .row");
      const cols = Array.from(headerRow?.querySelectorAll("div.column") || [])
        .map((c) => c.textContent?.trim() || "")
        .filter((t) => t && t !== "Breakdown");
      return cols;
    });

    if (!headers.length) {
      throw new Error("No se encontraron encabezados de la tabla.");
    }

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
          return labels.some((l) => titleNorm.includes(l));
        });
        if (!target) return [];
        const cols = target.querySelectorAll("div.column:not(.sticky)");
        return Array.from(cols).map((c) => c.textContent?.trim() || "");
      }, labelList);

      rowValues[key] = values;
    }

    const formatted: CashFlowResponse = {
      headers,
      metrics: {
        operatingCashFlow: (rowValues["operatingCashFlow"] || []).map(
          cleanAndParseValue
        ),
        investingCashFlow: (rowValues["investingCashFlow"] || []).map(
          cleanAndParseValue
        ),
        financingCashFlow: (rowValues["financingCashFlow"] || []).map(
          cleanAndParseValue
        ),
        endCashPosition: (rowValues["endCashPosition"] || []).map(
          cleanAndParseValue
        ),
        incomeTaxPaid: (rowValues["incomeTaxPaid"] || []).map(
          cleanAndParseValue
        ),
        interestPaid: (rowValues["interestPaid"] || []).map(cleanAndParseValue),
        capitalExpenditure: (rowValues["capitalExpenditure"] || []).map(
          cleanAndParseValue
        ),
        issuanceOfDebt: (rowValues["issuanceOfDebt"] || []).map(
          cleanAndParseValue
        ),
        repaymentOfDebt: (rowValues["repaymentOfDebt"] || []).map(
          cleanAndParseValue
        ),
        freeCashFlow: (rowValues["freeCashFlow"] || []).map(cleanAndParseValue),
      },
    };

    const hasAnyData = Object.values(formatted.metrics).some(
      (arr) => Array.isArray(arr) && arr.length > 0
    );
    if (!hasAnyData) {
      throw new Error("No se encontraron filas en la tabla (Cash Flow).");
    }

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error Cash Flow scraping:", err);
    return NextResponse.json(
      { error: "Error al obtener Cash Flow desde Yahoo." },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}
