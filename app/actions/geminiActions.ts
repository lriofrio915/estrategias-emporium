"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Definimos la interfaz para el tipado de los datos de entrada.
interface IndicatorSummary {
  Indicador: string;
  Tipo: string;
  Ticker: string;
  Fecha: string;
  Último: number | null;
  YoY: number | null;
  Secuencial: number | null;
  "Aceleración YoY": number | null;
  Fase: string;
  FRED: string;
}

// 2. La función ahora se conectará realmente a la API de Gemini.
export async function generateGeminiBrief(
  summaryData: IndicatorSummary[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "La clave de API de Gemini no está configurada en el servidor."
    );
  }

  // 3. Inicializamos el cliente de la API de Gemini.
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // 4. Creamos un "prompt" dinámico para la IA.
  //    Convertimos los datos en un formato legible (JSON) y le damos instrucciones claras.
  const dataString = JSON.stringify(summaryData, null, 2);
  const prompt = `
    Eres un analista macroeconómico experto que trabaja para un fondo de inversión.
    Tu tarea es analizar los siguientes datos económicos de Estados Unidos, extraídos de FRED,
    y proporcionar un resumen ejecutivo conciso (máximo 4-5 frases) para un trader.

    Interpretación de la 'Fase':
    - 🟢 (Verde): Expansión Acelerada (muy positivo).
    - 🟡 (Amarillo): Expansión Desacelerada (positivo, pero perdiendo impulso).
    - 🟠 (Naranja): Recuperación (negativo, pero mejorando).
    - 🔴 (Rojo): Contracción (muy negativo).

    Basándote en los datos proporcionados a continuación, evalúa la salud general de la economía.
    Indica si las señales apuntan a una posible recesión, a una expansión sólida, o a un escenario mixto.
    Concluye con una recomendación sobre el sesgo general del mercado (alcista, bajista o neutral/cauteloso).

    Datos a analizar:
    ${dataString}
  `;

  try {
    // 5. Realizamos la llamada a la API de Gemini y esperamos la respuesta.
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error al llamar a la API de Gemini:", error);
    throw new Error(
      "No se pudo generar el resumen desde la IA. Inténtalo de nuevo."
    );
  }
}
