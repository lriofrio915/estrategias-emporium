import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type {
  CompanyData,
  RecessionAnalysisData,
  SectorPerformance,
  FredSeriesResponseItem,
  MacroIndicator,
  CommodityPerformance,
  AdvancedAnalysisData,
} from "@/types/stock-scanner";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("La variable de entorno GEMINI_API_KEY no está configurada");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const financialDataSchema = {
  type: Type.OBJECT,
  properties: {
    profile: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        ticker: { type: Type.STRING },
        exchange: { type: Type.STRING },
        sector: { type: Type.STRING },
        industry: { type: Type.STRING },
        description: { type: Type.STRING },
      },
      required: [
        "name",
        "ticker",
        "exchange",
        "sector",
        "industry",
        "description",
      ],
    },
    keyMetrics: {
      type: Type.OBJECT,
      properties: {
        currentPrice: {
          type: Type.NUMBER,
          description:
            "El precio más reciente de la acción (en tiempo real o del último cierre).",
        },
        marketCap: { type: Type.NUMBER },
        peRatio: {
          type: Type.NUMBER,
          description: "Ratio P/E (TTM - Trailing Twelve Months).",
        },
        eps: {
          type: Type.NUMBER,
          description: "BPA (EPS - TTM - Trailing Twelve Months).",
        },
        dividendYield: {
          type: Type.NUMBER,
          description:
            "La rentabilidad por dividendo PORCENTUAL actual (ej. si es 1.5%, devuelve 1.5).",
        },
        beta: {
          type: Type.NUMBER,
          description: "El beta de 5 años de la acción más reciente.",
        },
        enterpriseValue: {
          type: Type.NUMBER,
          description: "Valor de Empresa (Enterprise Value) más reciente.",
        },
        evToEbitda: {
          type: Type.NUMBER,
          description:
            "Ratio EV/EBITDA (TTM - Trailing Twelve Months) más reciente.",
        },
      },
      required: [
        "currentPrice",
        "marketCap",
        "peRatio",
        "eps",
        "dividendYield",
        "beta",
        "enterpriseValue",
        "evToEbitda",
      ],
    },
    incomeStatement: {
      type: Type.OBJECT,
      properties: {
        revenue: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              year: { type: Type.INTEGER },
              value: { type: Type.NUMBER },
            },
            required: ["year", "value"],
          },
          description: "Últimos 3 años fiscales anuales.",
        },
        netIncome: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              year: { type: Type.INTEGER },
              value: { type: Type.NUMBER },
            },
            required: ["year", "value"],
          },
        },
        ebitda: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              year: { type: Type.INTEGER },
              value: { type: Type.NUMBER },
            },
            required: ["year", "value"],
          },
          description: "EBITDA de los últimos 3 años fiscales anuales.",
        },
      },
      required: ["revenue", "netIncome", "ebitda"],
    },
    balanceSheet: {
      type: Type.OBJECT,
      properties: {
        totalAssets: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              year: { type: Type.INTEGER },
              value: { type: Type.NUMBER },
            },
            required: ["year", "value"],
          },
        },
        totalLiabilities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              year: { type: Type.INTEGER },
              value: { type: Type.NUMBER },
            },
            required: ["year", "value"],
          },
        },
        totalEquity: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              year: { type: Type.INTEGER },
              value: { type: Type.NUMBER },
            },
            required: ["year", "value"],
          },
        },
        totalDebt: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              year: { type: Type.INTEGER },
              value: { type: Type.NUMBER },
            },
            required: ["year", "value"],
          },
          description: "Deuda total al final de los últimos 3 años fiscales.",
        },
      },
      required: ["totalAssets", "totalLiabilities", "totalEquity", "totalDebt"],
    },
    cashFlowStatement: {
      type: Type.OBJECT,
      properties: {
        operatingCashFlow: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              year: { type: Type.INTEGER },
              value: { type: Type.NUMBER },
            },
            required: ["year", "value"],
          },
        },
        investingCashFlow: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              year: { type: Type.INTEGER },
              value: { type: Type.NUMBER },
            },
            required: ["year", "value"],
          },
        },
        financingCashFlow: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              year: { type: Type.INTEGER },
              value: { type: Type.NUMBER },
            },
            required: ["year", "value"],
          },
        },
        freeCashFlow: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              year: { type: Type.INTEGER },
              value: { type: Type.NUMBER },
            },
            required: ["year", "value"],
          },
          description:
            "Flujo de Caja Libre (Free Cash Flow) de los últimos 3 años fiscales anuales.",
        },
      },
      required: [
        "operatingCashFlow",
        "investingCashFlow",
        "financingCashFlow",
        "freeCashFlow",
      ],
    },
    historicalPrices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
          close: { type: Type.NUMBER },
        },
        required: ["date", "close"],
      },
      description:
        "Precios de cierre SEMANALES desde el inicio del año en curso hasta la fecha de hoy. Si los datos semanales no están disponibles, proporciona datos diarios de los últimos 30 días.",
    },
  },
  required: [
    "profile",
    "keyMetrics",
    "incomeStatement",
    "balanceSheet",
    "cashFlowStatement",
    "historicalPrices",
  ],
};

const sanitizeAndExtractJson = (rawText: string): string => {
  let text = rawText.trim();

  // 1. Attempt to extract from markdown code block
  const jsonMatch = text.match(/```(json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[2]) {
    text = jsonMatch[2];
  }

  // 2. Fallback: Find the first '{' and the last '}'
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    text = text.substring(firstBrace, lastBrace + 1);
  }

  // 3. Sanitize: remove malformed 'cite' properties occasionally added by the model
  // This regex is more robust to handle various formats of the 'cite' property
  return text.replace(/,\s*"cite":\s*(\d+|\[[\d,\s]*\])/g, "");
};

export const getFinancialData = async (
  ticker: string
): Promise<CompanyData> => {
  let response: GenerateContentResponse | null = null;
  try {
    const today = new Date().toISOString().split("T")[0];
    const startOfYear = new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split("T")[0];

    const systemInstruction = `Eres un asistente experto en análisis financiero. Tu única tarea es buscar en la web utilizando la herramienta de búsqueda de Google para encontrar los datos financieros más precisos y actualizados para un ticker de acción determinado, priorizando Yahoo Finance para los datos de precios históricos. Debes devolver la respuesta ÚNICAMENTE como un objeto JSON válido, sin ningún otro texto, markdown o explicación. La respuesta debe ser solo el JSON. No incluyas ninguna propiedad adicional que no esté definida en el esquema JSON, como claves de 'cite' o cualquier otra forma de citación. Si no puedes encontrar datos para el ticker solicitado, devuelve un objeto JSON con una única propiedad "error" que describa el problema (ej. {"error": "No se encontraron datos para el ticker XYZ."}). Debes hacer un esfuerzo considerable por obtener los datos de precios históricos, intentando primero con datos semanales y luego con datos diarios de los últimos 30 días. Devuelve un array vacío para 'historicalPrices' solo como último recurso si ambos intentos fallan.`;

    const prompt = `Usando la búsqueda de Google para obtener datos en tiempo real, proporciona la información financiera para el ticker "${ticker}". La fecha de hoy es ${today}.

Es CRÍTICO que utilices la búsqueda para obtener los siguientes datos con la información más reciente posible (en tiempo real o del último cierre):
- 'currentPrice'
- 'marketCap'
- 'peRatio'
- 'eps'
- 'dividendYield': la rentabilidad por dividendo PORCENTUAL actual (ej. si es 1.5%, devuelve 1.5).
- 'beta'
- 'enterpriseValue'
- 'evToEbitda'
- El último precio en 'historicalPrices'

Para los datos de los estados financieros, utiliza los datos anuales más recientes disponibles (de los informes 10-K). Para los precios históricos, proporciona datos de cierre SEMANALES desde el inicio del año en curso (${startOfYear}) hasta hoy, obtenidos de Yahoo Finance. Si los datos semanales no están disponibles, intenta obtener datos de cierre diarios de los últimos 30 días. Si, y solo si, ambos intentos fallan, devuelve un array vacío [] para el campo 'historicalPrices'. La solicitud NO debe fallar si solo faltan los precios históricos.

La salida DEBE SER un único bloque de código JSON, y nada más. No incluyas \`\`\`json\`\`\` ni ningún otro texto explicativo. El objeto JSON debe seguir estrictamente esta estructura:
${JSON.stringify(financialDataSchema, null, 2)}
`;

    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const jsonString = sanitizeAndExtractJson(String(response.text));

    if (!jsonString || jsonString.trim() === "") {
      console.error(
        "La IA devolvió una respuesta vacía o no válida:",
        response?.text
      );
      throw new Error(
        `La IA devolvió una respuesta no válida para "${ticker}". Por favor, inténtalo de nuevo.`
      );
    }

    const data = JSON.parse(jsonString);

    if (data.error) {
      console.error("La IA devolvió un error:", data.error);
      throw new Error(data.error);
    }

    // Validate the structure of the data to prevent crashes in the UI
    if (
      !data.profile?.name ||
      !data.keyMetrics ||
      !data.incomeStatement ||
      !Array.isArray(data.historicalPrices)
    ) {
      console.error(
        "La IA devolvió datos con una estructura inesperada:",
        jsonString
      );
      throw new Error(
        `Los datos recibidos para "${ticker}" están incompletos o tienen un formato incorrecto. No se puede mostrar el informe.`
      );
    }

    return data as CompanyData;
  } catch (error) {
    console.error("Error al obtener datos financieros de Gemini:", error);

    if (error instanceof SyntaxError) {
      console.error(
        "Error al parsear la respuesta JSON de la IA:",
        response?.text
      );
      throw new Error(
        `El modelo de IA devolvió una respuesta con formato inesperado para ${ticker}. Por favor, inténtalo de nuevo.`
      );
    }

    if (error instanceof Error) {
      // Propagate more specific error messages from our checks
      throw error;
    }

    throw new Error(
      `No se pudieron obtener los datos financieros para ${ticker}. Asegúrate de que el ticker sea correcto y que la búsqueda en la web pueda encontrarlo.`
    );
  }
};

export const getAiAnalysis = async (
  companyData: CompanyData
): Promise<string> => {
  const todayStr = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const ebitdaLines = companyData.incomeStatement.ebitda
    .map(
      (item) =>
        `- ${item.year}: ${new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "USD",
          notation: "compact",
        }).format(item.value)}`
    )
    .join("\n");

  const prompt = `
        Realiza un análisis financiero detallado y actualizado en español para ${
          companyData.profile.name
        } (${
    companyData.profile.ticker
  }) basado en los siguientes datos. La fecha de hoy es ${todayStr}.
        El análisis debe ser objetivo y basarse únicamente en la información proporcionada.

        **Perfil de la Empresa:**
        - **Sector:** ${companyData.profile.sector}
        - **Industria:** ${companyData.profile.industry}
        - **Descripción:** ${companyData.profile.description}

        **Métricas Clave (Datos de mercado más recientes a ${todayStr}):**
        - **Precio Actual:** ${new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
        }).format(companyData.keyMetrics.currentPrice)}
        - **Capitalización de Mercado:** ${new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "USD",
          notation: "compact",
        }).format(companyData.keyMetrics.marketCap)}
        - **Valor de Empresa (EV):** ${new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "USD",
          notation: "compact",
        }).format(companyData.keyMetrics.enterpriseValue)}
        - **Ratio P/E (TTM):** ${companyData.keyMetrics.peRatio.toFixed(2)}
        - **Ratio EV/EBITDA (TTM):** ${companyData.keyMetrics.evToEbitda.toFixed(
          2
        )}
        - **BPA (EPS - TTM):** ${new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "USD",
        }).format(companyData.keyMetrics.eps)}
        - **Rentabilidad por Dividendo:** ${companyData.keyMetrics.dividendYield.toFixed(
          2
        )}%
        - **Beta:** ${companyData.keyMetrics.beta.toFixed(2)}

        **Resultados Financieros (últimos 3 años fiscales anuales):**
        Ingresos:
        ${companyData.incomeStatement.revenue
          .map(
            (item) =>
              `- ${item.year}: ${new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "USD",
                notation: "compact",
              }).format(item.value)}`
          )
          .join("\n")}
        Beneficio Neto:
        ${companyData.incomeStatement.netIncome
          .map(
            (item) =>
              `- ${item.year}: ${new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "USD",
                notation: "compact",
              }).format(item.value)}`
          )
          .join("\n")}
        EBITDA:
        ${ebitdaLines}
        Deuda Total:
        ${companyData.balanceSheet.totalDebt
          .map(
            (item) =>
              `- ${item.year}: ${new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "USD",
                notation: "compact",
              }).format(item.value)}`
          )
          .join("\n")}
        Flujo de Caja Libre:
        ${companyData.cashFlowStatement.freeCashFlow
          .map((item) => {
            return `- ${item.year}: ${new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: "USD",
              notation: "compact",
            }).format(item.value)}`;
          })
          .join("\n")}


        **Análisis Solicitado:**
        Genera un análisis en formato markdown con las siguientes secciones:
        **Resumen Ejecutivo:** Un párrafo breve resumiendo la salud financiera general y la posición en el mercado, usando las métricas más actuales.
        **Análisis de Rendimiento:** Evalúa el crecimiento de los ingresos y la rentabilidad (beneficio neto y EBITDA) basándose en los datos de los últimos 3 años fiscales anuales. ¿Hay tendencias positivas o negativas?
        **Salud Financiera:** Analiza la situación del balance y la capacidad de la empresa para generar efectivo.
        - **Flujo de Caja Libre (FCF):** ¿La empresa genera un FCF positivo y creciente? ¿Qué implica esto para su capacidad de invertir, pagar deudas y recompensar a los accionistas?
        - **Nivel de Deuda:** Evalúa la tendencia de la deuda total en los últimos años. ¿Es manejable en relación con su EBITDA o patrimonio?
        **Valoración y Riesgos:** Usando las métricas más recientes (P/E TTM, EV/EBITDA, Beta), comenta sobre la valoración actual y el riesgo percibido por el mercado. ¿La acción parece cara o barata en comparación con sus ganancias y su valor de empresa? ¿Qué indica su beta sobre su volatilidad?
        **Perspectivas Futuras:** Basado en todos los datos proporcionados, ¿cuáles son las perspectivas? Menciona cualquier factor clave de la descripción de la empresa que pueda influir en el futuro.

        El tono debe ser profesional y fácil de entender para un inversor no experto. No des consejos de inversión.
    `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return String(response.text);
  } catch (error) {
    console.error("Error al generar el análisis de IA:", error);
    throw new Error(
      "El análisis de IA no pudo ser generado. Por favor, inténtalo de nuevo más tarde."
    );
  }
};

export const getRecessionAnalysis = async (
  sectors: string[]
): Promise<RecessionAnalysisData> => {
  let response: GenerateContentResponse | null = null;

  const recessionSchema = {
    type: Type.OBJECT,
    properties: {
      overallRecessionProbability: {
        type: Type.NUMBER,
        description:
          "Una calificación general de 0 a 100 que representa la probabilidad de recesión para la economía en general, basada en el análisis de los sectores.",
      },
      sectors: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sectorName: { type: Type.STRING },
            riskLevel: { type: Type.STRING, enum: ["Alto", "Medio", "Bajo"] },
            recessionProbabilityPercentage: {
              type: Type.NUMBER,
              description:
                "Una calificación numérica de 0 a 100 que representa la probabilidad de recesión para este sector. Esta calificación debe basarse en un análisis riguroso de las variaciones interanuales (trimestre actual vs. mismo trimestre del año anterior) y secuenciales (trimestre actual vs. trimestre anterior) de las métricas clave. Caídas abruptas y significativas en métricas como 'Ventas e Ingresos' o aumentos drásticos en 'Deuda' o 'Nivel de Inventarios' deberían resultar en una calificación más alta.",
            },
            summary: {
              type: Type.STRING,
              description:
                "Un resumen del análisis del sector y la justificación del nivel de riesgo.",
            },
            sourceEtf: {
              type: Type.STRING,
              description:
                "El nombre y ticker del ETF de EE. UU. del cual se seleccionaron las empresas (ej. 'Technology Select Sector SPDR Fund (XLK)').",
            },
            representativeCompanies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description:
                      "Nombre completo de la empresa representativa.",
                  },
                  quarterlyComparisons: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        metric: {
                          type: Type.STRING,
                          enum: [
                            "Ventas e Ingresos",
                            "Liquidez",
                            "Deuda",
                            "Capital de Trabajo",
                            "Nivel de Inventarios",
                            "Rotación de Inventarios",
                          ],
                        },
                        currentQuarter: {
                          type: Type.STRING,
                          description:
                            "Valor ilustrativo para el trimestre más reciente (ej. '$5.2B', '-1.5%').",
                        },
                        previousQuarter: {
                          type: Type.STRING,
                          description:
                            "Valor ilustrativo para el trimestre anterior (ej. '$5.0B', '+0.5%').",
                        },
                        sameQuarterLastYear: {
                          type: Type.STRING,
                          description:
                            "Valor ilustrativo para el mismo trimestre del año anterior (ej. '$4.8B', '+3.0%').",
                        },
                        analysis: {
                          type: Type.STRING,
                          description:
                            "Breve análisis de la tendencia observada en los tres puntos de datos, destacando el impacto de cualquier variación interanual abrupta.",
                        },
                      },
                      required: [
                        "metric",
                        "currentQuarter",
                        "previousQuarter",
                        "sameQuarterLastYear",
                        "analysis",
                      ],
                    },
                  },
                },
                required: ["name", "quarterlyComparisons"],
              },
            },
          },
          required: [
            "sectorName",
            "riskLevel",
            "recessionProbabilityPercentage",
            "summary",
            "sourceEtf",
            "representativeCompanies",
          ],
        },
      },
    },
    required: ["overallRecessionProbability", "sectors"],
  };

  const prompt = `
        Actúa como un economista y analista financiero experto. Tu tarea es generar un análisis detallado sobre la probabilidad de recesión para varios sectores económicos, incluyendo calificaciones numéricas.
        NO uses herramientas de búsqueda. Basa tu análisis en principios económicos generales y tu conocimiento interno. Los datos financieros específicos de las empresas deben ser ILUSTRATIVOS y realistas, no datos en tiempo real.
        La respuesta DEBE SER un único objeto JSON, sin ningún otro texto o markdown.

        Sectores a analizar:
        ${sectors.map((s) => `- ${s}`).join("\n")}

        Para la respuesta JSON, proporciona una propiedad raíz 'overallRecessionProbability', que es una calificación porcentual general (0-100) que promedia y pondera el riesgo de los sectores analizados para dar una visión macroeconómica.
        Además, proporciona una propiedad raíz 'sectors' que es un array de objetos, donde cada objeto representa un sector y tiene la siguiente estructura:

        1.  **sectorName:** El nombre del sector.
        2.  **riskLevel:** Califica el riesgo de recesión del sector como 'Alto', 'Medio' o 'Bajo'.
        3.  **recessionProbabilityPercentage:** Proporciona una calificación porcentual de 0 a 100 para la probabilidad de recesión del sector. Es CRÍTICO que esta calificación sea realista y esté directamente justificada por los datos trimestrales ilustrativos que proporcionas. Al determinar este valor, pon especial énfasis en la comparación entre el 'currentQuarter' y el 'sameQuarterLastYear'. Las caídas interanuales significativas y abruptas en métricas clave (como Ventas) o los aumentos preocupantes (como Deuda o Inventarios) son fuertes indicadores de estrés económico y deben reflejarse en una calificación de probabilidad más alta. La calificación debe ser una síntesis cuantitativa del análisis cualitativo presentado en el resumen y en las métricas de las empresas.
        4.  **summary:** Un resumen explicando la calificación de riesgo, basado en las vulnerabilidades y fortalezas del sector, y haciendo referencia explícita a las tendencias observadas en los datos trimestrales ilustrativos de las empresas representativas.
        5.  **sourceEtf:** Identifica un ETF sectorial relevante de EE. UU. para el sector y proporciona su nombre completo y ticker. Por ejemplo, para el sector financiero, "Financial Select Sector SPDR Fund (XLF)". Para el sector "Productores de Madera", un ETF apropiado sería 'iShares Global Timber & Forestry ETF (WOOD)'.
        6.  **representativeCompanies:** Un array con TRES empresas. Es CRÍTICO que las TRES empresas seleccionadas sean las TRES principales participaciones (top 3 holdings) del ETF que identificaste.
            - Para cada empresa, proporciona su nombre completo.
            - Para cada empresa, proporciona un array 'quarterlyComparisons' con análisis para CUATRO métricas relevantes.
            - Para todos los sectores EXCEPTO 'Productores de Madera', usa estas CUATRO métricas exactas: 'Ventas e Ingresos', 'Liquidez', 'Deuda', y 'Capital de Trabajo'.
            - PARA EL SECTOR 'Productores de Madera', usa estas CUATRO métricas: 'Ventas e Ingresos', 'Nivel de Inventarios', 'Rotación de Inventarios', y 'Deuda'. El análisis para este sector debe centrarse en cómo los inventarios, su rotación y las ventas indican la salud del sector y el riesgo de recesión.
            - Para cada métrica, proporciona valores ILUSTRATIVOS y realistas para 'currentQuarter' (trimestre más reciente), 'previousQuarter' (trimestre anterior), y 'sameQuarterLastYear' (mismo trimestre del año anterior). Los valores pueden ser cambios porcentuales (ej. '+2.5%') o montos absolutos (ej. '$4.8B'). Para 'Rotación de Inventarios', el valor puede ser un número (ej. '4.5x').
            - Proporciona también un 'analysis' que explique la tendencia observada en los tres trimestres para esa métrica, destacando el impacto de cualquier variación interanual abrupta.

        La salida DEBE SER un único bloque de código JSON, y nada más. No incluyas \`\`\`json\`\`\` ni ningún otro texto explicativo.
    `;

  try {
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recessionSchema,
      },
    });

    const jsonString = sanitizeAndExtractJson(String(response.text));
    const data = JSON.parse(jsonString);

    if (
      !data ||
      typeof data.overallRecessionProbability !== "number" ||
      !Array.isArray(data.sectors) ||
      data.sectors.length === 0
    ) {
      throw new Error(
        "La respuesta de la IA no tiene la estructura esperada para el análisis de recesión."
      );
    }

    return data as RecessionAnalysisData;
  } catch (error) {
    console.error("Error al obtener el análisis de recesión de Gemini:", error);
    if (error instanceof SyntaxError) {
      console.error(
        "Error al parsear la respuesta JSON de la IA:",
        response?.text
      );
      throw new Error(
        "El modelo de IA devolvió una respuesta con formato inesperado para el análisis de recesión."
      );
    }
    throw new Error(
      "No se pudo generar el análisis de recesión. Por favor, inténtalo de nuevo más tarde."
    );
  }
};

export const getSectorPerformance = async (): Promise<SectorPerformance[]> => {
  const sectors = [
    "Communication Services",
    "Consumer Discretionary",
    "Consumer Staples",
    "Energy",
    "Financials",
    "Health Care",
    "Industrials",
    "Information Technology",
    "Materials",
    "Real Estate",
    "Utilities",
  ];

  const finvizSectorMapping = {
    "Communication Services": "Communication Services",
    "Consumer Discretionary": "Consumer Cyclical",
    "Consumer Staples": "Consumer Defensive",
    Energy: "Energy",
    Financials: "Financials",
    "Health Care": "Health Care",
    Industrials: "Industrials",
    "Information Technology": "Technology",
    Materials: "Basic Materials",
    "Real Estate": "Real Estate",
    Utilities: "Utilities",
  };

  const finvizSectors = sectors.map(
    (s) => finvizSectorMapping[s as keyof typeof finvizSectorMapping]
  );

  const performanceSchema = {
    type: Type.OBJECT,
    properties: {
      sectorName: {
        type: Type.STRING,
        description: `The name of the sector from the original list: ${sectors.join(
          ", "
        )}.`,
      },
      performance: {
        type: Type.OBJECT,
        properties: {
          "1D": {
            type: Type.NUMBER,
            description: "1-Day percentage change (from Finviz 'Perf Day')",
          },
          "1W": {
            type: Type.NUMBER,
            description: "1-Week percentage change (from Finviz 'Perf Week')",
          },
          "1M": {
            type: Type.NUMBER,
            description: "1-Month percentage change (from Finviz 'Perf Month')",
          },
          "3M": {
            type: Type.NUMBER,
            description:
              "3-Month percentage change (from Finviz 'Perf Quarter')",
          },
          "6M": {
            type: Type.NUMBER,
            description: "6-Month percentage change (from Finviz 'Perf Half')",
          },
          "1Y": {
            type: Type.NUMBER,
            description: "1-Year percentage change (from Finviz 'Perf Year')",
          },
          YTD: {
            type: Type.NUMBER,
            description:
              "Year-to-Date percentage change (from Finviz 'Perf YTD')",
          },
        },
        required: ["1D", "1W", "1M", "3M", "6M", "1Y", "YTD"],
      },
    },
    required: ["sectorName", "performance"],
  };

  const schema = {
    type: Type.ARRAY,
    items: performanceSchema,
  };

  const systemInstruction = `Eres un asistente de datos financieros altamente preciso. Tu única tarea es utilizar la búsqueda de Google para encontrar los datos de rendimiento sectorial más recientes del sitio web Finviz.com. Debes seguir estrictamente las instrucciones del usuario, realizar el mapeo de nombres de sector solicitado y devolver la respuesta ÚNICAMENTE como un objeto JSON válido. No incluyas ninguna propiedad adicional que no esté definida en el esquema, como 'cite'.`;

  const prompt = `
Utilizando la búsqueda de Google, encuentra los datos más recientes sobre el rendimiento de los sectores de Finviz.com. Necesito los datos de la vista "Performance (Day)" (v=170) de la sección "Groups".

**Datos a extraer:**
Busca los valores porcentuales para los siguientes sectores:
${finvizSectors.join("\n")}

**Mapeo de Nombres de Sector:**
En tu respuesta JSON, DEBES usar los nombres de sector originales de la lista a continuación. Mapea los nombres que encuentres en Finviz (ej. "Technology") a su correspondiente en esta lista (ej. "Information Technology").
${sectors
  .map(
    (s) =>
      `- ${
        finvizSectorMapping[s as keyof typeof finvizSectorMapping]
      } (Finviz) -> ${s} (JSON)`
  )
  .join("\n")}

**Mapeo de Columnas de Datos:**
Para cada sector, mapea los datos de rendimiento de Finviz a las claves JSON de la siguiente manera:
- 'Perf Day' -> '1D'
- 'Perf Week' -> '1W'
- 'Perf Month' -> '1M'
- 'Perf Quarter' -> '3M'
- 'Perf Half' -> '6M'
- 'Perf Year' -> '1Y'
- 'Perf YTD' -> 'YTD'

**Formato de Salida:**
- La respuesta DEBE SER un único bloque de código JSON, y nada más. No incluyas \`\`\`json\`\`\` ni ningún otro texto explicativo.
- El JSON debe ser un array de objetos.
- El valor del rendimiento debe ser un NÚMERO (ej. para +1.5%, devuelve 1.5; para -0.5%, devuelve -0.5). Si un valor no está disponible, devuelve 0.

**Instrucción Crítica:** Si la búsqueda de Google no te proporciona los datos numéricos exactos de la tabla de Finviz, NO inventes datos. En su lugar, devuelve un JSON con un solo objeto de error, así: \`[{"error": "No se pudieron obtener los datos de Finviz a través de la búsqueda."}]\`. Es preferible un error a datos incorrectos.

La salida final, si tiene éxito, DEBE ser solo un objeto JSON que siga estrictamente esta estructura:
${JSON.stringify(schema, null, 2)}
    `;

  let response: GenerateContentResponse | null = null;
  try {
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const jsonString = sanitizeAndExtractJson(String(response.text));

    if (!jsonString || jsonString.trim() === "") {
      throw new Error(
        "La IA devolvió una respuesta vacía para el rendimiento sectorial."
      );
    }

    const data = JSON.parse(jsonString);

    if (Array.isArray(data) && data[0]?.error) {
      console.error(
        "La IA indicó un error en la obtención de datos:",
        data[0].error
      );
      throw new Error(data[0].error);
    }

    if (!Array.isArray(data) || data.length === 0) {
      console.error(
        "La IA devolvió datos con una estructura inesperada:",
        jsonString
      );
      throw new Error(
        `Los datos de rendimiento sectorial recibidos están incompletos o tienen un formato incorrecto.`
      );
    }

    return data as SectorPerformance[];
  } catch (error) {
    console.error(
      "Error al obtener el rendimiento sectorial de Gemini:",
      error
    );

    if (error instanceof SyntaxError) {
      console.error(
        "Error al parsear la respuesta JSON de la IA:",
        response?.text
      );
      throw new Error(
        "El modelo de IA devolvió una respuesta con formato inesperado para el rendimiento sectorial."
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "No se pudo obtener el rendimiento sectorial. Por favor, inténtalo de nuevo."
    );
  }
};

export const getCommoditiesPerformance = async (): Promise<
  CommodityPerformance[]
> => {
  const commodities = ["Cobre", "Gas Natural", "Oro", "Plata", "Petroleo"];

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, enum: commodities },
        price: {
          type: Type.NUMBER,
          description: "El precio actual del commodity (columna 'Last')",
        },
        daily: {
          type: Type.NUMBER,
          description: "Cambio porcentual del día (columna 'Daily')",
        },
        weekly: {
          type: Type.NUMBER,
          description: "Cambio porcentual de la semana (columna 'Weekly')",
        },
        monthly: {
          type: Type.NUMBER,
          description: "Cambio porcentual del mes (columna 'Monthly')",
        },
        yearly: {
          type: Type.NUMBER,
          description: "Cambio porcentual del año (columna 'Yearly')",
        },
      },
      required: ["name", "price", "daily", "weekly", "monthly", "yearly"],
    },
  };

  const systemInstruction = `Eres un asistente de datos financieros. Tu única tarea es buscar en la web utilizando la herramienta de búsqueda de Google para encontrar los datos más recientes sobre el rendimiento de las materias primas desde la página https://tradingeconomics.com/commodities. Debes devolver la respuesta ÚNICAMENTE como un objeto JSON válido, sin ningún otro texto, markdown o explicación. La respuesta debe ser solo el JSON. No incluyas ninguna propiedad adicional que no esté definida en el esquema, como 'cite'. Si no puedes encontrar datos para un período, devuelve 0. El valor para 'price' debe extraerse de la columna 'Last'. Los valores porcentuales deben ser devueltos como números (ej. para +1.5%, devuelve 1.5; para -0.5%, devuelve -0.5).`;

  const prompt = `
        Eres un experto en extracción de datos web. Tu ÚNICA tarea es usar la búsqueda de Google para encontrar y extraer datos de la tabla de materias primas en 'tradingeconomics.com/commodities'.

        **Objetivo:** Extraer datos para las siguientes 5 materias primas. En el JSON de salida, usa el nombre en español proporcionado aquí para el campo 'name'.
        1.  "Cobre" (Buscar: "Copper")
        2.  "Gas Natural" (Buscar: "Natural Gas")
        3.  "Oro" (Buscar: "Gold")
        4.  "Plata" (Buscar: "Silver")
        5.  "Petroleo" (Buscar: "Crude Oil WTI")

        **Instrucciones de extracción (EXTREMADAMENTE IMPORTANTE):**
        Para CADA una de las 5 materias primas, debes encontrar la fila correspondiente en la tabla y extraer los valores de las siguientes columnas EXACTAS:
        - 'price': Del valor en la columna "Last".
        - 'daily': Del valor en la columna "Daily".
        - 'weekly': Del valor en la columna "Weekly". LA EXTRACCIÓN DE ESTE DATO ES DE MÁXIMA PRIORIDAD. ASEGÚRATE DE OBTENERLO.
        - 'monthly': Del valor en la columna "Monthly".
        - 'yearly': Del valor en la columna "Yearly".

        **Reglas de formato de salida:**
        1.  La salida DEBE ser un array JSON de 5 objetos, uno para cada materia prima.
        2.  Todos los valores numéricos (precio y porcentajes) DEBEN ser números, no strings. Por ejemplo, para +1.5%, devuelve 1.5. Para -0.5%, devuelve -0.5.
        3.  Si por alguna razón un valor porcentual no está disponible en la web, DEBES devuelve 0 para ese campo. NO dejes el campo fuera ni devuelvas null. La solicitud NO debe fallar si falta un valor.
        4.  NO incluyas \`\`\`json\`\`\` ni ningún otro texto explicativo. La respuesta debe ser SÓLO el JSON.

        Verifica tu salida final para asegurarte de que es un JSON válido y que contiene los 5 elementos solicitados antes de devolverla.

        La salida DEBE SER un único bloque de código JSON que sea un array de objetos. No incluyas \`\`\`json\`\`\` ni ningún otro texto explicativo. El objeto JSON debe seguir estrictamente esta estructura:
        ${JSON.stringify(schema, null, 2)}
    `;

  let response: GenerateContentResponse | null = null;
  try {
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const jsonString = sanitizeAndExtractJson(String(response.text));

    if (!jsonString || jsonString.trim() === "") {
      throw new Error(
        "La IA devolvió una respuesta vacía para el rendimiento de las materias primas."
      );
    }

    const data = JSON.parse(jsonString);

    if (!Array.isArray(data) || data.length === 0) {
      console.error(
        "La IA devolvió datos con una estructura inesperada o un array vacío:",
        jsonString
      );
      throw new Error(
        "El modelo de IA respondió pero no encontró datos de materias primas. Esto puede ser un problema temporal al acceder a la fuente."
      );
    }

    return data as CommodityPerformance[];
  } catch (error) {
    console.error(
      "Error al obtener el rendimiento de las materias primas de Gemini:",
      error
    );

    if (error instanceof SyntaxError) {
      console.error(
        "Error al parsear la respuesta JSON de la IA:",
        response?.text
      );
      throw new Error(
        "El modelo de IA devolvió una respuesta con formato inesperado para el rendimiento de las materias primas."
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "No se pudo obtener el rendimiento de las materias primas. Por favor, inténtalo de nuevo."
    );
  }
};

export const getMacroeconomicData = async (
  series: { id: string }[]
): Promise<FredSeriesResponseItem[]> => {

  interface FredSeries {
    id: string;
    observations: Array<{ date: string; value: string | number }>; // 'observations' puede tener una estructura más detallada si la conoces
  }

  const seriesIds = series.map((s) => s.id);
  const schema = {
    type: Type.OBJECT,
    properties: {
      series: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: {
              type: Type.STRING,
              description: `One of the requested series IDs: ${seriesIds.join(
                ", "
              )}`,
            },
            observations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: {
                    type: Type.STRING,
                    description: "Date in YYYY-MM-DD format",
                  },
                  value: {
                    type: Type.NUMBER,
                    description:
                      "The numeric value for that date. Can be null if data is missing.",
                  },
                },
                required: ["date", "value"],
              },
            },
          },
          required: ["id", "observations"],
        },
      },
    },
    required: ["series"],
  };

  const systemInstruction = `Eres un asistente experto en datos económicos. Tu única tarea es usar la herramienta de búsqueda de Google para encontrar datos históricos para los indicadores de FRED (Federal Reserve Economic Data) solicitados. Es CRÍTICO que utilices el sitio web oficial fred.stlouisfed.org como la fuente principal y autorizada para todos los datos. No utilices otras fuentes. Devuelve la respuesta ÚNICAMENTE como un objeto JSON válido, sin texto adicional. No incluyas ninguna propiedad adicional que no esté definida en el esquema, como 'cite'.`;

  const prompt = `
        Usando la búsqueda de Google, busca EN fred.stlouisfed.org los datos históricos desde 2010-01-01 hasta la fecha más reciente disponible para los siguientes indicadores de FRED:
        ${seriesIds.join(", ")}

        Para cada indicador, proporciona una lista de sus observaciones (fecha y valor). Asegúrate de que las fechas estén en formato YYYY-MM-DD. Si no se encuentran datos para un indicador, devuelve un array de observaciones vacío para ese ID.

        La salida DEBE SER un único bloque de código JSON. No incluyas \`\`\`json\`\`\` ni ningún otro texto. El objeto JSON debe seguir estrictamente esta estructura:
        ${JSON.stringify(schema, null, 2)}
    `;

  let response: GenerateContentResponse | null = null;
  try {
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const jsonString = sanitizeAndExtractJson(String(response.text));

    if (!jsonString || jsonString.trim() === "") {
      throw new Error(
        "La IA devolvió una respuesta vacía para los datos macroeconómicos."
      );
    }

    const data = JSON.parse(jsonString);

    if (!data.series || !Array.isArray(data.series)) {
      console.error(
        "La IA devolvió datos con una estructura inesperada:",
        jsonString
      );
      throw new Error(
        `Los datos macroeconómicos recibidos están incompletos o tienen un formato incorrecto.`
      );
    }

    // Validate that all requested series are present in the response
    const returnedSeriesIds = new Set(data.series.map((s: FredSeries) => s.id));
    const missingSeries = seriesIds.filter((id) => !returnedSeriesIds.has(id));

    if (missingSeries.length > 0) {
      console.warn(
        `La IA no devolvió datos para las siguientes series de FRED: ${missingSeries.join(
          ", "
        )}. Se devolverán como series vacías.`
      );
      missingSeries.forEach((id) => {
        data.series.push({ id: id, observations: [] });
      });
    }

    return data.series as FredSeriesResponseItem[];
  } catch (error:unknown) {
    console.error("Error al obtener datos macroeconómicos de Gemini:", error);

    if (error instanceof SyntaxError) {
      console.error(
        "Error al parsear la respuesta JSON de la IA:",
        response?.text
      );
      throw new Error(
        "El modelo de IA devolvió una respuesta con formato inesperado para los datos macroeconómicos."
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "No se pudieron obtener los datos macroeconómicos. Por favor, inténtalo de nuevo."
    );
  }
};

export const getMacroAnalysis = async (
  indicators: MacroIndicator[]
): Promise<string> => {
  const payload = {
    fecha_corte: new Date().toISOString().split("T")[0],
    indicadores: indicators.map((i) => ({
      Indicador: i.name,
      Tipo: i.kind,
      Ticker: i.ticker,
      Fecha: i.lastDate,
      Último: i.lastValue,
      YoY: i.yoy,
      Secuencial: i.sequential,
      "Aceleración YoY": i.yoyAccel,
      Fase: i.phase,
    })),
    leyenda_colores: {
      "🟢": "Expansión",
      "🟡": "Pico/Desaceleración",
      "🔴": "Contracción",
      "🟠": "Suelo/Recuperación (débil, mejora secuencial)",
    },
  };

  const prompt = `
        Eres un economista. Con base en este JSON, redacta en español (máx. 180 palabras) un diagnóstico del ciclo de EE. UU.
        Sé disciplinado y no especulativo. Enfatiza qué fase domina, menciona LEI, CLI, INDPRO, CP y S&P 500,
        y explica el uso de 🟠 en recuperación temprana (débil pero mejorando).

        JSON:
        ${JSON.stringify(payload, null, 2)}
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    return String(response.text);
  } catch (error) {
    console.error("Error al generar el análisis macroeconómico de IA:", error);
    throw new Error("El análisis macroeconómico de IA no pudo ser generado.");
  }
};

export const getAdvancedAnalysisData = async (
  ticker: string
): Promise<AdvancedAnalysisData> => {
  const fifteenYearsAgo = new Date();
  fifteenYearsAgo.setFullYear(fifteenYearsAgo.getFullYear() - 15);
  const startDate = fifteenYearsAgo.toISOString().split("T")[0];

  const schema = {
    type: Type.OBJECT,
    properties: {
      annualRevenue: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            year: { type: Type.INTEGER },
            value: { type: Type.NUMBER },
          },
          required: ["year", "value"],
        },
        description: `Hasta 15 años de datos de ingresos anuales (Revenue). Devuelve un array vacío si no se encuentran.`,
      },
      annualEps: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            year: { type: Type.INTEGER },
            value: { type: Type.NUMBER },
          },
          required: ["year", "value"],
        },
        description: `Hasta 15 años de datos de BPA diluido anual (Diluted EPS). Devuelve un array vacío si no se encuentran.`,
      },
      zScoreComponents: {
        type: Type.OBJECT,
        properties: {
          currentAssets: { type: Type.NUMBER },
          currentLiabilities: { type: Type.NUMBER },
          totalAssets: { type: Type.NUMBER },
          totalLiabilities: { type: Type.NUMBER },
          retainedEarnings: { type: Type.NUMBER },
          ebit: {
            type: Type.NUMBER,
            description: "También conocido como Operating Income.",
          },
          sales: {
            type: Type.NUMBER,
            description: "Ventas anuales más recientes (Total Revenue).",
          },
          marketCap: { type: Type.NUMBER },
          interestExpense: {
            type: Type.NUMBER,
            description:
              "Gasto por intereses anual más reciente (Interest Expense).",
          },
          incomeTaxExpense: {
            type: Type.NUMBER,
            description:
              "Gasto por impuesto a la renta anual más reciente (Income Tax Expense).",
          },
        },
        required: [
          "currentAssets",
          "currentLiabilities",
          "totalAssets",
          "totalLiabilities",
          "retainedEarnings",
          "ebit",
          "sales",
          "marketCap",
          "interestExpense",
          "incomeTaxExpense",
        ],
      },
      tickerPrices: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: "YYYY-MM-DD" },
            close: { type: Type.NUMBER },
          },
          required: ["date", "close"],
        },
        description: `Precios de cierre MENSUALES para ${ticker} desde ${startDate}.`,
      },
      spyPrices: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: "YYYY-MM-DD" },
            close: { type: Type.NUMBER },
          },
          required: ["date", "close"],
        },
        description: `Precios de cierre MENSUALES para SPY desde ${startDate}.`,
      },
      historicalFcf: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            year: { type: Type.INTEGER },
            value: { type: Type.NUMBER },
          },
          required: ["year", "value"],
        },
        description: `Hasta 15 años de datos de Flujo de Caja Libre (Free Cash Flow) anual. Devuelve un array vacío si no se encuentran.`,
      },
      sharesOutstanding: {
        type: Type.NUMBER,
        description:
          "Número de acciones en circulación (Shares Outstanding) más reciente, en la misma unidad que los datos financieros (no en millones).",
      },
      cashAndCashEquivalents: {
        type: Type.NUMBER,
        description:
          "Efectivo y equivalentes de efectivo (Cash and Cash Equivalents) del balance más reciente.",
      },
      totalDebt: {
        type: Type.NUMBER,
        description: "Deuda total (Total Debt) del balance más reciente.",
      },
    },
    required: [
      "annualRevenue",
      "annualEps",
      "zScoreComponents",
      "tickerPrices",
      "spyPrices",
      "historicalFcf",
      "sharesOutstanding",
      "cashAndCashEquivalents",
      "totalDebt",
    ],
  };

  const systemInstruction = `Eres un asistente experto en datos financieros. Tu única tarea es buscar en la web utilizando la herramienta de búsqueda de Google para encontrar los datos financieros históricos y de balance más precisos y actualizados para un ticker de acción determinado. Prioriza fuentes como Yahoo Finance, Macrotrends o los archivos oficiales de la SEC. La respuesta debe ser ÚNICAMENTE un objeto JSON válido. No incluyas ninguna propiedad adicional que no esté definida en el esquema, como 'cite'.`;

  const prompt = `
        Utilizando la búsqueda de Google, proporciona datos financieros avanzados para el ticker "${ticker}". Necesito datos para un análisis fundamental, de riesgo y de valoración DCF. Es CRÍTICO que los datos provengan de fuentes confiables como Yahoo Finance, Macrotrends o archivos SEC.

        **Datos Requeridos:**
        1.  **Historial Anual (hasta 15 años):**
            - Ingresos anuales (Revenue).
            - BPA diluido anual (Diluted EPS).
            - Flujo de Caja Libre anual (Free Cash Flow).
        2.  **Componentes para Z-Score (los más recientes disponibles):**
            - Activos Corrientes, Pasivos Corrientes, Activos Totales, Pasivos Totales, Ganancias Retenidas, EBIT (o Ingresos Operativos), Ventas Anuales, Capitalización de Mercado, Gasto por Intereses, Gasto por Impuesto a la Renta.
        3.  **Datos para Valoración DCF (los más recientes disponibles):**
            - **Número de Acciones en Circulación (Shares Outstanding):** El número total, no en millones.
            - **Efectivo y Equivalentes de Efectivo (Cash and Cash Equivalents).**
            - **Deuda Total (Total Debt).**
        4.  **Precios Históricos (desde ${startDate} hasta hoy):**
            - Precios de cierre MENSUALES para el ticker ${ticker}.
            - Precios de cierre MENSUALES para el ETF SPY.
            - **Instrucción Crítica:** Es VITAL que para AMBOS tickers, intentes obtener un historial de precios de 15 años. Si no está disponible un historial completo de 15 años, proporciona tantos datos como sea posible. TU MÁXIMA PRIORIDAD es obtener al menos los ÚLTIMOS 12 MESES de datos mensuales. Si después de un esfuerzo exhaustivo no puedes encontrar 12 meses (por ejemplo, para una IPO reciente), devuelve tantos meses como estén disponibles. La solicitud NO DEBE fallar por este motivo.

        **Formato de Salida:**
        - La respuesta DEBE SER un único bloque de código JSON, y nada más. No incluyas \`\`\`json\`\`\` ni ningún otro texto explicativo.
        - Si algún dato numérico específico no se encuentra, devuelve 0 para ese campo.
        - Si un historial de datos (como revenue o precios) no se encuentra, devuelve un array vacío [] para ese campo. La solicitud NO debe fallar si falta un array.

        La salida final DEBE ser solo un objeto JSON que siga estrictamente esta estructura:
        ${JSON.stringify(schema, null, 2)}
    `;

  let response: GenerateContentResponse | null = null;
  try {
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const jsonString = sanitizeAndExtractJson(String(response.text));

    if (!jsonString || jsonString.trim() === "") {
      throw new Error(
        `La IA devolvió una respuesta vacía para el análisis avanzado de "${ticker}".`
      );
    }

    const data = JSON.parse(jsonString);

    if (
      !data.zScoreComponents ||
      !Array.isArray(data.tickerPrices) ||
      !data.historicalFcf
    ) {
      console.error(
        "La IA devolvió datos avanzados con una estructura inesperada:",
        jsonString
      );
      throw new Error(
        `Los datos para el análisis avanzado de "${ticker}" están incompletos o tienen un formato incorrecto.`
      );
    }

    return data as AdvancedAnalysisData;
  } catch (error) {
    console.error(
      "Error al obtener datos de análisis avanzado de Gemini:",
      error
    );

    if (error instanceof SyntaxError) {
      console.error(
        "Error al parsear la respuesta JSON de la IA:",
        response?.text
      );
      throw new Error(
        `El modelo de IA devolvió una respuesta con formato inesperado para el análisis avanzado de ${ticker}.`
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      `No se pudieron obtener los datos de análisis avanzado para ${ticker}.`
    );
  }
};
