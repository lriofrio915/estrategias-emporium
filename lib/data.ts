// lib/data.ts
import { ApiAssetItem } from '@/types/api';
import { notFound } from "next/navigation";

// Definimos la interfaz para los datos que se obtienen de los scrapeos
interface ScrapedData {
  headers: string[];
  metrics: { [key: string]: (number | string)[] };
  error?: string;
}

/**
 * Función centralizada para obtener todos los datos de un ticker.
 * @param ticker El símbolo del activo (ej. 'AAPL').
 * @returns Un objeto ApiAssetItem con todos los datos consolidados, o null si hay un error.
 */
export async function fetchAllStocksData(ticker: string): Promise<ApiAssetItem | null> {
  const normalizedTicker = ticker.toUpperCase();

  try {
    // 1. Llamada a la API principal (incluye historial y módulos de Yahoo Finance)
    const stockApiResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/stocks?tickers=${normalizedTicker}&fullData=true`,
      { next: { revalidate: 3600 } } // Caché del servidor de 1 hora
    );
    
    // Validar respuesta de la API de stocks
    if (!stockApiResponse.ok) {
        console.error(`Error al obtener datos de stocks para ${normalizedTicker}:`, stockApiResponse.statusText);
        return null;
    }
    const stockData = await stockApiResponse.json();
    if (!stockData.success || !stockData.data || stockData.data.length === 0) {
        return null;
    }

    const assetData = stockData.data[0] as ApiAssetItem;

    // 2. Llamadas a las APIs de scraping para datos más específicos (como tablas)
    // Estas llamadas no son estrictamente necesarias si ya obtienes los datos con yahoo-finance2,
    // pero se incluyen para mostrar cómo centralizar todas las APIs.
    const [incomeStatementRes, balanceSheetRes, cashFlowRes] = await Promise.allSettled([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/income-statement?ticker=${normalizedTicker}`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/balance-sheet?ticker=${normalizedTicker}`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/free-cash-flow?ticker=${normalizedTicker}`),
    ]);

    // Procesar los resultados de los scrapeos
    if (incomeStatementRes.status === 'fulfilled' && incomeStatementRes.value.ok) {
      const data: ScrapedData = await incomeStatementRes.value.json();
      // Integrar datos del scrapeo si es necesario, aquí es solo un ejemplo
    } else {
      console.warn(`No se pudo obtener el Income Statement para ${normalizedTicker}`);
    }

    // De manera similar, procesar y consolidar los datos de Balance Sheet y Cash Flow.

    // 3. Devolver el objeto final consolidado
    return assetData;

  } catch (error) {
    console.error(`Error inesperado al consolidar datos para ${normalizedTicker}:`, error);
    return null;
  }
}