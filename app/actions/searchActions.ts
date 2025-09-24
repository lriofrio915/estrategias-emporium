// app/actions/searchActions.ts
"use server";

import yahooFinance from "yahoo-finance2";

// Definimos un tipo más preciso para los resultados de la búsqueda
interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

export async function searchStocksAction(
  query: string
): Promise<{ results: SearchResult[]; error?: string }> {
  if (!query.trim()) {
    return { results: [] };
  }

  try {
    // Usamos la función 'search' de la librería, que es la correcta para esto
    const searchResults = await yahooFinance.search(query);

    // Mapeamos los resultados al formato que nuestro frontend espera
    const formattedResults = (searchResults.quotes || [])
      .filter((q) => q.isYahooFinance) // Filtramos para obtener resultados más relevantes
      .map((quote) => ({
        symbol: quote.symbol,
        name: quote.longname || quote.shortname || quote.symbol,
        type: quote.quoteType || "N/A",
        region: quote.exchange || "N/A",
        currency: "USD", // La API de search no provee la moneda, asumimos USD
      }));

    return { results: formattedResults };
  } catch (err) {
    console.error("Error en la acción de búsqueda:", err);
    return { results: [], error: "Error al realizar la búsqueda." };
  }
}
