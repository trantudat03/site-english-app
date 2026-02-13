import { fetchWithAuth } from "./strapiFetch";

export interface UploadProps {
  file: File | File[];
  ref: string;
  refId: string | number;
  field: string;
}

/**
 * Uploads a file (or files) to Strapi and links it to an existing entry.
 *
 * Endpoint: POST ${apiUrl}/api/upload
 * Headers: Authorization: Bearer ${token} (if provided, otherwise uses stored token)
 * Body: FormData with keys: files, ref, refId, field
 */
export async function uploadToStrapi({
  file,
  ref,
  refId,
  field,
}: UploadProps) {
  const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_STRAPI_URL is not defined");
  }
  const formData = new FormData();

  // Handle single or multiple files
  if (Array.isArray(file)) {
    file.forEach((f) => formData.append("files", f));
  } else {
    formData.append("files", file);
  }

  // Append reference fields
  formData.append("ref", ref);
  formData.append("refId", String(refId));
  formData.append("field", field);

  // Construct the upload URL
  const baseUrl = apiUrl.replace(/\/+$/, "");
  const url = `${baseUrl}/api/upload`;

  // Use fetchWithAuth to handle token (if not provided) and error parsing
  return fetchWithAuth(url, {
    method: "POST",
    body: formData,
  });
}
