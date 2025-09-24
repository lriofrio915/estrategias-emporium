import { Schema, model, models, Document } from "mongoose";

// Interfaz para el subdocumento de Cartera
export interface ICartera extends Document {
  name: string;
  slug: string;
  tickers: string[];
}

// Interfaz para el documento principal del Portafolio
export interface IPortfolio extends Document {
  name: string;
  slug: string;
  tickers: string[]; // Mantenemos los tickers principales
  carteras: ICartera[]; // Añadimos el array de carteras
}

// Esquema para el subdocumento de Cartera
const CarteraSchema = new Schema<ICartera>({
  name: {
    type: String,
    required: [true, "El nombre de la cartera es obligatorio."],
  },
  slug: {
    type: String,
    required: [true, "El slug de la cartera es obligatorio."],
  },
  tickers: {
    type: [String],
    default: [],
  },
});

const PortfolioSchema = new Schema<IPortfolio>(
  {
    name: {
      type: String,
      required: [true, "El nombre del portafolio es obligatorio."],
    },
    slug: {
      type: String,
      required: [true, "El slug del portafolio es obligatorio."],
      unique: true,
    },
    // Mantenemos la lista de tickers principal
    tickers: {
      type: [String],
      required: true,
    },
    // Y añadimos el array de carteras anidadas
    carteras: [CarteraSchema],
  },
  { timestamps: true }
);

const Portfolio =
  models.Portfolio || model<IPortfolio>("Portfolio", PortfolioSchema);

export default Portfolio;
