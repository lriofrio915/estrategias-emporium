// app/api/[ticker]/route.ts

import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import {
  RawYahooFinanceCashflowItem,
  RawYahooFinanceBalanceSheetItem,
  RawYahooFinanceIncomeStatementItem,
  FinancialHistoryItem,
  HistoricalData,
  YahooFinanceRawValue,
  YahooFinanceDateValue,
  IncomeStatementHistory,
  QuoteSummaryCashflowStatementHistory,
  QuoteSummaryBalanceSheetHistory,
  YahooFinanceModule,
} from "@/types/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;

  if (!ticker) {
    return NextResponse.json(
      { success: false, message: "El ticker es obligatorio" },
      { status: 400 }
    );
  }

  try {
    const modulesToFetch: YahooFinanceModule[] = [
      "price",
      "financialData",
      "summaryDetail",
      "assetProfile",
      "defaultKeyStatistics",
      "cashflowStatementHistory",
      "balanceSheetHistory",
      "incomeStatementHistory",
      "earningsTrend",
    ] as const;

    // Usa quoteSummary para obtener la mayoría de los módulos
    const quoteSummaryResult = await yahooFinance.quoteSummary(ticker, {
      modules: modulesToFetch,
    });

    // Obtener datos históricos de precios por separado
    const historicalPriceData = await yahooFinance.historical(ticker, {
      period1: "2018-01-01",
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
      (
        quoteSummaryResult.cashflowStatementHistory as
          | QuoteSummaryCashflowStatementHistory
          | undefined
      )?.cashflowStatements || [];

    const balanceSheetStatements =
      (
        quoteSummaryResult.balanceSheetHistory as
          | QuoteSummaryBalanceSheetHistory
          | undefined
      )?.balanceSheetStatements || [];

    const incomeStatementHistoryObject =
      quoteSummaryResult.incomeStatementHistory as
        | IncomeStatementHistory
        | undefined;

    const incomeStatements =
      incomeStatementHistoryObject?.incomeStatements || [];

    // Mapea las declaraciones por año para facilitar la combinación
    const statementsByYear: {
      [year: string]: {
        cashflow?: RawYahooFinanceCashflowItem;
        balanceSheet?: RawYahooFinanceBalanceSheetItem;
        incomeStatement?: RawYahooFinanceIncomeStatementItem;
      };
    } = {};

    // Helper function to extract year from endDate, handling both Date and YahooFinanceDateValue
    const getYearFromEndDate = (
      endDate: Date | YahooFinanceDateValue | undefined
    ): string | undefined => {
      if (!endDate) return undefined;

      if (typeof endDate === "object" && "fmt" in endDate) {
        return endDate.fmt?.substring(0, 4);
      } else if (endDate instanceof Date) {
        return endDate.getFullYear().toString();
      }
      return undefined;
    };

    // Helper function to convert a raw number to YahooFinanceRawValue format
    const toYahooFinanceRawValue = (
      value: number | undefined
    ): YahooFinanceRawValue | undefined => {
      if (typeof value === "number") {
        return { raw: value, fmt: value.toLocaleString() };
      }
      return undefined;
    };

    // Helper function to safely extract raw value
    const getRawValue = (
      value: YahooFinanceRawValue | number | undefined
    ): number | null => {
      if (!value) return null;
      if (typeof value === "number") return value;
      return value.raw;
    };

    // Procesar cashflow statements
    cashflowStatements.forEach((stmt: RawYahooFinanceCashflowItem) => {
      const year = getYearFromEndDate(stmt.endDate);
      if (year) {
        const cashflowStmt: RawYahooFinanceCashflowItem = {
          maxAge: stmt.maxAge,
          endDate: stmt.endDate,
          freeCashFlow:
            typeof stmt.freeCashFlow === "number"
              ? toYahooFinanceRawValue(stmt.freeCashFlow)
              : stmt.freeCashFlow,
          operatingCashFlow:
            typeof stmt.operatingCashFlow === "number"
              ? toYahooFinanceRawValue(stmt.operatingCashFlow)
              : stmt.operatingCashFlow,
          capitalExpenditures:
            typeof stmt.capitalExpenditures === "number"
              ? toYahooFinanceRawValue(stmt.capitalExpenditures)
              : stmt.capitalExpenditures,
        };
        statementsByYear[year] = {
          ...(statementsByYear[year] || {}),
          cashflow: cashflowStmt,
        };
      }
    });

    // Procesar balance sheet statements
    balanceSheetStatements.forEach((stmt: RawYahooFinanceBalanceSheetItem) => {
      const year = getYearFromEndDate(stmt.endDate);
      if (year) {
        const balanceSheetStmt: RawYahooFinanceBalanceSheetItem = {
          maxAge: stmt.maxAge,
          endDate: stmt.endDate,
          totalDebt:
            typeof stmt.totalDebt === "number"
              ? toYahooFinanceRawValue(stmt.totalDebt)
              : stmt.totalDebt,
          totalStockholderEquity:
            typeof stmt.totalStockholderEquity === "number"
              ? toYahooFinanceRawValue(stmt.totalStockholderEquity)
              : stmt.totalStockholderEquity,
        };
        statementsByYear[year] = {
          ...(statementsByYear[year] || {}),
          balanceSheet: balanceSheetStmt,
        };
      }
    });

    // Procesar income statements
    incomeStatements.forEach((stmt: RawYahooFinanceIncomeStatementItem) => {
      const year = getYearFromEndDate(stmt.endDate);
      if (year) {
        const incomeStatementStmt: RawYahooFinanceIncomeStatementItem = {
          maxAge: stmt.maxAge,
          endDate: stmt.endDate,
          totalRevenue:
            typeof stmt.totalRevenue === "number"
              ? toYahooFinanceRawValue(stmt.totalRevenue)
              : stmt.totalRevenue,
          netIncome:
            typeof stmt.netIncome === "number"
              ? toYahooFinanceRawValue(stmt.netIncome)
              : stmt.netIncome,
          grossProfit:
            typeof stmt.grossProfit === "number"
              ? toYahooFinanceRawValue(stmt.grossProfit)
              : stmt.grossProfit,
        };
        statementsByYear[year] = {
          ...(statementsByYear[year] || {}),
          incomeStatement: incomeStatementStmt,
        };
      }
    });

    // Combina y formatea los datos financieros anuales
    for (const year of Object.keys(statementsByYear).sort().reverse()) {
      const { cashflow, balanceSheet } = statementsByYear[year];

      const freeCashFlow = getRawValue(cashflow?.freeCashFlow);
      const operatingCashFlow = getRawValue(cashflow?.operatingCashFlow);
      const capitalExpenditures = getRawValue(cashflow?.capitalExpenditures);
      const totalDebt = getRawValue(balanceSheet?.totalDebt);
      const totalEquity = getRawValue(balanceSheet?.totalStockholderEquity);
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
        date: item.date.toISOString().split("T")[0],
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
        ...quoteSummaryResult,
        historical: formattedHistoricalData,
        financialHistory: financialHistory,
      },
    };

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
