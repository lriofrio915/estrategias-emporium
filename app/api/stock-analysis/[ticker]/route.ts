// app/api/stock-analysis/[ticker]/route.ts
import { NextResponse } from "next/server";
import {
  getFinancialData,
  getAdvancedAnalysisData,
  getAiAnalysis,
} from "@/lib/services/geminiService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;

  if (!ticker) {
    return NextResponse.json(
      { error: "El ticker es requerido." },
      { status: 400 }
    );
  }

  try {
    console.log(`[API] Iniciando análisis para: ${ticker}`);

    // 1. Obtenemos los datos básicos y avanzados en paralelo para mayor eficiencia
    const [companyData, advancedData] = await Promise.all([
      getFinancialData(ticker),
      getAdvancedAnalysisData(ticker),
    ]);

    // 2. Una vez que tenemos los datos, solicitamos el análisis de la IA
    const aiAnalysis = await getAiAnalysis(companyData);

    console.log(`[API] Análisis completado para: ${ticker}`);

    // 3. Devolvemos todos los datos en una única respuesta
    return NextResponse.json({
      companyData,
      advancedData,
      aiAnalysis,
    });
  } catch (error: unknown) {
    // CORRECCIÓN: 'any' cambiado a 'unknown'
    console.error(`[API] Error al procesar el ticker ${ticker}:`, error);

    // Verificamos si el error es una instancia de Error para acceder a 'message' de forma segura
    const errorMessage =
      error instanceof Error ? error.message : "Un error desconocido ocurrió.";

    return NextResponse.json(
      { error: `Falló el análisis para ${ticker}: ${errorMessage}` },
      { status: 500 }
    );
  }
}
