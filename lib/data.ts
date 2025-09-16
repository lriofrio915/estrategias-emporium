// lib/data.ts
import { ApiAssetItem } from '@/types/api';

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

    return assetData;

  } catch (error) {
    console.error(`Error inesperado al consolidar datos para ${normalizedTicker}:`, error);
    return null;
  }
}