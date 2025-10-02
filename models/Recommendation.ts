// models/Recommendation.ts

import mongoose, { Schema, model, models, Document } from "mongoose";

// Se asume que el tipo RecommendationStatus existe en tu proyecto (p.ej., en types/market.ts)
export type RecommendationStatus = "COMPRAR" | "MANTENER" | "VENDER";

export interface IRecommendation extends Document {
  ticker: string;
  purchasePrice: number;
  assetName: string;
  recommendationDate: Date;
  buyPrice: number; // Mantenemos para compatibilidad con tu código (es el precio de recomendación)
  currentPrice: number;
  targetPrice: number; // Nuevo: Precio objetivo ingresado por el usuario
  sellPrice?: number; // Opcional, se fija al vender
  status: RecommendationStatus;
  responsible: string;
  reportUrl: string | null;
  reportMimeType: string | null;
  createdAt: Date;
}

const RecommendationSchema = new Schema<IRecommendation>(
  {
    ticker: { type: String, required: true, uppercase: true, trim: true },
    purchasePrice: { type: Number, required: true },
    assetName: { type: String, required: true },
    reportUrl: { type: String, default: null },
    recommendationDate: { type: Date, default: Date.now },
    buyPrice: { type: Number, required: true },
    reportMimeType: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    currentPrice: { type: Number, required: true },
    targetPrice: { type: Number, required: true }, // Asegurado como requerido
    sellPrice: { type: Number },
    status: {
      type: String,
      enum: ["COMPRAR", "MANTENER", "VENDER"],
      default: "COMPRAR",
    },
    responsible: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Recommendation =
  (models.Recommendation as mongoose.Model<IRecommendation>) ||
  model<IRecommendation>("Recommendation", RecommendationSchema);

export default Recommendation;
