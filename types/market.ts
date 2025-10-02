// types/market.ts

// Tipo para el estado de una recomendación
export type RecommendationStatus = "COMPRAR" | "MANTENER" | "VENDER";

// Interfaz "segura para el cliente" para una recomendación.
// Esta es la estructura que los componentes de React esperarán.
export interface Recommendation {
  _id: string;
  ticker: string;
  assetName: string;
  recommendationDate: string; // El objeto Date se convierte en string ISO
  buyPrice: number;
  currentPrice: number;
  targetPrice: number;
  sellPrice?: number; // Opcional
  status: RecommendationStatus;
  responsible: string;
  purchasePrice: number; // Precio de recomendación (P. Rec.)
  reportUrl: string | null;      // URL del archivo (NUEVO)
  reportMimeType: string | null; // MIME Type (NUEVO)
  createdAt: Date;
}

// Interfaz para los datos del formulario de nueva recomendación
export interface NewRecommendationData {
  ticker: string;
  buyPrice: number;
  targetPrice: number;
  responsible: string;
}
