// app/actions/translateActions.ts
"use server";

import { TranslationServiceClient } from "@google-cloud/translate";
// Importa el tipo de credenciales de Google Auth Library si es posible
// Si no tienes @google-cloud/translate/build/src/auth/credentials directamente,
// puedes buscar un tipo similar en 'google-auth-library' o dejarlo como 'object'.
// Por ejemplo: import { Credentials } from 'google-auth-library';

export async function translateText(
  textToTranslate: string,
  targetLanguageCode: string
): Promise<{ translatedText?: string; error?: string }> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  // Almacena las credenciales directamente para evitar re-parseo si es un JSON
  const credentialsJsonString = process.env.GOOGLE_CLOUD_CREDENTIALS;

  if (!projectId) {
    return { error: "GOOGLE_CLOUD_PROJECT_ID is not configured." };
  }

  try {
    // 1. Error: 'clientOptions' is never reassigned. Use 'const' instead.
    // Cambiamos 'let' a 'const' porque el objeto clientOptions no se reasigna,
    // solo se modifican sus propiedades.
    const clientOptions: {
      // 2. Error: Unexpected any. Specify a different type. (Línea 19:21)
      // Usamos 'object' como un tipo más específico que 'any' para las credenciales,
      // ya que sabemos que será un objeto JSON parseado.
      credentials?: object;
      projectId?: string;
      universeDomain?: string;
    } = {
      projectId,
    };

    if (credentialsJsonString) {
      const parsedCredentials = JSON.parse(credentialsJsonString);
      clientOptions.credentials = parsedCredentials;
      // Añadir el universo explícitamente desde las credenciales si está presente
      // TypeScript ya infiere el tipo de parsedCredentials, pero se puede hacer explícito
      if ((parsedCredentials as { universe_domain?: string }).universe_domain) {
        clientOptions.universeDomain = (
          parsedCredentials as { universe_domain?: string }
        ).universe_domain;
      }
    } else {
      // Si no hay credenciales, asume el dominio por defecto
      clientOptions.universeDomain = "googleapis.com";
    }

    const translationClient = new TranslationServiceClient(clientOptions);

    const textLimit = 5000;
    const contents = [
      textToTranslate.length > textLimit
        ? textToTranslate.substring(0, textLimit) + "..."
        : textToTranslate,
    ];

    const [response] = await translationClient.translateText({
      parent: `projects/${projectId}/locations/global`,
      contents,
      mimeType: "text/plain",
      sourceLanguageCode: "en",
      targetLanguageCode,
    });

    const translatedText = response.translations?.[0]?.translatedText;
    if (translatedText) {
      return { translatedText };
    }

    return { error: "No translation received." };
  } catch (error: unknown) {
    // 3. Error: Unexpected any. Specify a different type. (Línea 61:19)
    // Cambiamos 'any' a 'unknown' para manejar el error de forma más segura.
    // 'unknown' nos obliga a verificar el tipo antes de usar sus propiedades.
    let errorMessage = "An unknown error occurred during translation.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    console.error("Error en traducción:", errorMessage);
    return { error: "Failed to translate text." };
  }
}
