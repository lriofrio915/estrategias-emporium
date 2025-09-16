"use server";

// Simula una llamada a la API de Gemini. Reemplaza esto con tu implementación real.
export async function generateGeminiBrief(summaryData: any[]): Promise<string> {
  // const apiKey = process.env.GEMINI_API_KEY;
  // if (!apiKey) {
  //   return "Error: La clave de API de Gemini no está configurada.";
  // }

  console.log("Generando resumen con los siguientes datos:", summaryData);

  // -- COMIENZO DE LA SIMULACIÓN --
  // En un caso real, aquí construirías el prompt y llamarías a la API de Gemini.
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Simular latencia de red

  const hasNegativeSigns = summaryData.some(
    (d) => d.Fase === "🔴" || d.Fase === "🟠"
  );

  if (hasNegativeSigns) {
    return `Análisis Macroeconómico Preliminar:
- Se observan señales de desaceleración en indicadores clave como ${summaryData
      .filter((d) => d.Fase === "🔴" || d.Fase === "🟠")
      .map((d) => d.Indicador)
      .join(", ")}.
- La fase de contracción (🔴) o recuperación débil (🟠) en estos sectores sugiere cautela.
- Es crucial monitorear la evolución de la Producción Industrial y las Peticiones de Desempleo en los próximos informes para confirmar la tendencia.
Conclusión: El entorno macroeconómico presenta desafíos. Se recomienda una gestión de riesgo prudente.`;
  }

  return `Análisis Macroeconómico Preliminar:
- Los principales indicadores económicos muestran resiliencia. La mayoría se encuentra en fase de expansión (🟢) o desaceleración controlada (🟡).
- El mercado laboral, reflejado en Nóminas No Agrícolas, se mantiene sólido.
- La inflación parece estar contenida, según las expectativas a 5 años.
Conclusión: El escenario base no apunta a una recesión inminente. El entorno es favorable para activos de riesgo, aunque se debe mantener vigilancia sobre la política monetaria.`;
  // -- FIN DE LA SIMULACIÓN --
}
