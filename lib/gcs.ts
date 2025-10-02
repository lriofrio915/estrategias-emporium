// lib/gcs.ts
"use server";

import { Storage, StorageOptions } from "@google-cloud/storage";

// Interfaz para la estructura mínima del JSON de Service Account
interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

const credentialsJsonString = process.env.GOOGLE_CLOUD_CREDENTIALS;

let parsedCredentials: ServiceAccountCredentials | undefined;

if (credentialsJsonString) {
  try {
    // La línea 29 es donde ocurre el error si la cadena no es JSON válida.
    parsedCredentials = JSON.parse(
      credentialsJsonString
    ) as ServiceAccountCredentials;
  } catch (error) {
    console.error("Error parsing Google Cloud credentials JSON:", error);
  }
}

// Inicializa el cliente de GCS.
const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: parsedCredentials,
} as StorageOptions);

const bucketName = process.env.GCS_BUCKET_NAME || "your-default-bucket-name";

/**
 * Sube un archivo a Google Cloud Storage.
 */
export async function uploadFileToGCS(
  buffer: Buffer,
  mimeType: string,
  originalFilename: string
): Promise<string> {
  if (!bucketName) {
    throw new Error("GCS_BUCKET_NAME is not configured.");
  }

  const gcsFileName = `reports/${Date.now()}_${originalFilename.replace(
    / /g,
    "_"
  )}`;
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(gcsFileName);

  try {
    await file.save(buffer, {
      metadata: { contentType: mimeType },
      resumable: false,
    });

    return `https://storage.googleapis.com/${bucketName}/${gcsFileName}`;
  } catch (error: unknown) {
    console.error("GCS Upload Error:", error);
    const message =
      error instanceof Error ? error.message : "Error desconocido.";
    throw new Error(
      `Failed to upload file to Google Cloud Storage. Check bucket name and permissions. Error: ${message}`
    );
  }
}

/**
 * Elimina un archivo de Google Cloud Storage.
 */
export async function deleteFileFromGCS(fileUrl: string): Promise<void> {
  if (!bucketName) {
    console.error("GCS_BUCKET_NAME is not configured, skipping file deletion.");
    return;
  }

  try {
    const urlParts = new URL(fileUrl).pathname.split("/");
    const gcsFileName = urlParts.slice(2).join("/");

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(gcsFileName);

    await file.delete();
    console.log(`File ${gcsFileName} deleted from GCS.`);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error desconocido.";
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? (error as { code: string | number }).code
        : null;

    if (code !== 404) {
      console.error("GCS Delete Error (Non-404):", error);
      throw new Error(`Failed to delete file from GCS: ${message}`);
    }
  }
}
