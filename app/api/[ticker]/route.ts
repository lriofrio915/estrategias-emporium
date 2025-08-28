// app/api/[ticker]/route.ts

import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import {
  CashflowStatement,
  BalanceSheet,
  IncomeStatement,
  FinancialHistoryItem,
  HistoricalData,
  YahooFinanceRawValue,
  YahooFinanceDateValue,
  IncomeStatementHistory, // Importamos IncomeStatementHistory para un tipado más preciso
} from "@/types/api"; // Importa los tipos necesarios

export async function GET(
  request: Request,
  { params }: { params: { ticker: string } }
) {
  const { ticker } = params;

  if (!ticker) {
    return NextResponse.json(
      { success: false, message: "El ticker es obligatorio" },
      { status: 400 }
    );
  }

  try {
    const modulesToFetch = [
      "price",
      "financialData",
      "summaryDetail",
      "assetProfile",
      "defaultKeyStatistics",
      "cashflowStatementHistory",
      "balanceSheetHistory",
      "incomeStatementHistory",
      "earningsTrend",
    ] as any[];

    // Usa quoteSummary para obtener la mayoría de los módulos
    const quoteSummaryResult = await yahooFinance.quoteSummary(ticker, {
      modules: modulesToFetch,
    });

    // Obtener datos históricos de precios por separado
    const historicalPriceData = await yahooFinance.historical(ticker, {
      period1: "2018-01-01", // Puedes ajustar la fecha de inicio según sea necesario
    });

    // Se verifica si quoteSummaryResult existe y tiene datos relevantes.
    if (
      !quoteSummaryResult ||
      (!quoteSummaryResult.price && historicalPriceData.length === 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Ticker '${ticker}' no encontrado o sin datos relevantes.`,
        },
        { status: 404 }
      );
    }

    // Procesar historial financiero anual
    const financialHistory: FinancialHistoryItem[] = [];

    const cashflowStatements =
      quoteSummaryResult.cashflowStatementHistory?.cashflowStatements || [];
    const balanceSheetStatements =
      quoteSummaryResult.balanceSheetHistory?.balanceSheetStatements || [];
    // --- CORRECCIÓN FINAL Y DEFINITIVA: Acceso correcto a incomeStatements ---
    // quoteSummaryResult.incomeStatementHistory es el objeto IncomeStatementHistory,
    // que contiene el array 'incomeStatements'.
    const incomeStatementHistoryObject =
      quoteSummaryResult.incomeStatementHistory as
        | IncomeStatementHistory
        | undefined;
    const incomeStatements =
      incomeStatementHistoryObject?.incomeStatements || [];

    // Mapea las declaraciones por año para facilitar la combinación
    const statementsByYear: {
      [year: string]: {
        cashflow?: CashflowStatement;
        balanceSheet?: BalanceSheet;
        incomeStatement?: IncomeStatement;
      };
    } = {};

    // Helper function to extract year from endDate, handling both Date and YahooFinanceDateValue
    const getYearFromEndDate = (
      endDate: Date | YahooFinanceDateValue | undefined
    ): string | undefined => {
      if (!endDate) return undefined;
      // Si endDate es un YahooFinanceDateValue, su propiedad 'fmt' ya es la cadena.
      if (typeof (endDate as YahooFinanceDateValue).fmt === "string") {
        return (endDate as YahooFinanceDateValue).fmt.substring(0, 4);
      } else if (endDate instanceof Date) {
        // Si es un objeto Date
        return (endDate as Date).getFullYear().toString();
      }
      return undefined;
    };

    // Helper function to convert a raw number to YahooFinanceRawValue format
    const toYahooFinanceRawValue = (
      value: number | undefined
    ): YahooFinanceRawValue | undefined => {
      if (typeof value === "number") {
        return { raw: value, fmt: value.toLocaleString() }; // Basic formatting, can be improved
      }
      return undefined;
    };

    cashflowStatements.forEach((stmt: any) => {
      // Usamos 'any' temporalmente para acceder a propiedades no tipadas
      const year = getYearFromEndDate(stmt.endDate);
      if (year) {
        // Se crea un nuevo objeto que solo incluye las propiedades de CashflowStatement
        // Y se transforman los números raw a YahooFinanceRawValue
        const cashflowStmt: CashflowStatement = {
          maxAge: stmt.maxAge,
          endDate: stmt.endDate,
          freeCashFlow: toYahooFinanceRawValue(stmt.freeCashFlow),
          operatingCashFlow: toYahooFinanceRawValue(stmt.operatingCashFlow),
          capitalExpenditures: toYahooFinanceRawValue(stmt.capitalExpenditures),
        };
        statementsByYear[year] = {
          ...(statementsByYear[year] || {}),
          cashflow: cashflowStmt,
        };
      }
    });

    balanceSheetStatements.forEach((stmt: any) => {
      // Usamos 'any' temporalmente
      const year = getYearFromEndDate(stmt.endDate);
      if (year) {
        // Se crea un nuevo objeto que solo incluye las propiedades de BalanceSheet
        // Y se transforman los números raw a YahooFinanceRawValue
        const balanceSheetStmt: BalanceSheet = {
          maxAge: stmt.maxAge,
          endDate: stmt.endDate,
          totalDebt: toYahooFinanceRawValue(stmt.totalDebt),
          totalStockholderEquity: toYahooFinanceRawValue(
            stmt.totalStockholderEquity
          ),
        };
        statementsByYear[year] = {
          ...(statementsByYear[year] || {}),
          balanceSheet: balanceSheetStmt,
        };
      }
    });

    incomeStatements.forEach((stmt: any) => {
      // Usamos 'any' temporalmente
      const year = getYearFromEndDate(stmt.endDate);
      if (year) {
        // Se crea un nuevo objeto que solo incluye las propiedades de IncomeStatement
        // Y se transforman los números raw a YahooFinanceRawValue
        const incomeStatementStmt: IncomeStatement = {
          maxAge: stmt.maxAge,
          endDate: stmt.endDate,
          totalRevenue: toYahooFinanceRawValue(stmt.totalRevenue),
          netIncome: toYahooFinanceRawValue(stmt.netIncome),
          grossProfit: toYahooFinanceRawValue(stmt.grossProfit),
        };
        statementsByYear[year] = {
          ...(statementsByYear[year] || {}),
          incomeStatement: incomeStatementStmt,
        };
      }
    });

    // Combina y formatea los datos financieros anuales
    for (const year of Object.keys(statementsByYear).sort().reverse()) {
      // Ordenar por año descendente
      const { cashflow, balanceSheet } = statementsByYear[year];

      const freeCashFlow = cashflow?.freeCashFlow?.raw ?? null;
      const operatingCashFlow = cashflow?.operatingCashFlow?.raw ?? null;
      const capitalExpenditures = cashflow?.capitalExpenditures?.raw ?? null;
      const totalDebt = balanceSheet?.totalDebt?.raw ?? null;
      const totalEquity = balanceSheet?.totalStockholderEquity?.raw ?? null;
      const debtToEquity =
        totalDebt !== null && totalEquity !== null && totalEquity !== 0
          ? totalDebt / totalEquity
          : null;

      financialHistory.push({
        year: year,
        freeCashFlow,
        totalDebt,
        totalEquity,
        debtToEquity,
        operatingCashFlow,
        capitalExpenditures,
      });
    }

    // Formatear los datos históricos de precios al tipo esperado por el frontend
    const formattedHistoricalData: HistoricalData[] = historicalPriceData.map(
      (item) => ({
        date: item.date.toISOString().split("T")[0], // Formatear a 'YYYY-MM-DD'
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
        adjClose: item.adjClose,
      })
    );

    // Formatea la respuesta para que coincida con la estructura ApiAssetItem de tu frontend
    const formattedData = {
      ticker: ticker.toUpperCase(),
      data: {
        // 'data' debe contener QuoteSummaryData
        ...quoteSummaryResult, // Esto trae price, financialData, summaryDetail, etc.
        historical: formattedHistoricalData, // Añade el historial de precios procesado
        financialHistory: financialHistory, // Añade el historial financiero anual procesado
      },
    };

    // La respuesta de la API ahora contiene un array de `ApiAssetItem` como `assetData`
    return NextResponse.json({ success: true, assetData: [formattedData] });
  } catch (error) {
    console.error(`Error al obtener datos para ${ticker}:`, error);
    return NextResponse.json(
      {
        success: false,
        message:
          "No se pudo obtener la información del ticker. Por favor, verifica el símbolo.",
      },
      { status: 500 }
    );
  }
}
