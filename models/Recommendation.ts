import { Schema, model, models, Document } from "mongoose";

export interface IRecommendation extends Document {
  ticker: string;
  assetName: string;
  recommendationDate: Date;
  buyPrice: number;
  currentPrice: number;
  targetPrice: number;
  sellPrice?: number; // Opcional, se fija al vender
  status: "COMPRAR" | "MANTENER" | "VENDER";
  responsible: string;
}

const RecommendationSchema = new Schema<IRecommendation>(
  {
    ticker: { type: String, required: true, uppercase: true },
    assetName: { type: String, required: true },
    recommendationDate: { type: Date, default: Date.now },
    buyPrice: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
    targetPrice: { type: Number, required: true },
    sellPrice: { type: Number },
    status: {
      type: String,
      enum: ["COMPRAR", "MANTENER", "VENDER"],
      default: "COMPRAR",
    },
    responsible: { type: String, required: true },
  },
  { timestamps: true }
);

const Recommendation =
  models.Recommendation ||
  model<IRecommendation>("Recommendation", RecommendationSchema);

export default Recommendation;
