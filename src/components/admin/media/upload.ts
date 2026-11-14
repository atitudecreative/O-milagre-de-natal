"use client";
import { createClient } from "@/lib/supabase/client";

const MAX_DIM = 2560;
const RASTER = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml,image/x-icon,video/mp4,video/webm,application/pdf";
export const MAX_BYTES = 50 * 1024 * 1024;

type Prepared = { blob: Blob; ext: string; mime: string; width: number | null; height: number | null };

/** Redimensiona e converte imagens no navegador antes do envio (economia de banda e armazenamento). */
async function prepare(file: File): Promise<Prepared> {
  if (!RASTER.includes(file.type)) {
    const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
    let width: number | null = null;
    let height: number | null = null;
    if (file.type.startsWith("image/")) {
      try {
        const bmp = await createImageBitmap(file);
        width = bmp.width;
        height = bmp.height;
      } catch {}
    }
    return { blob: file, ext, mime: file.type || "application/octet-stream", width, height };
  }
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIM / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.86));
  if (!blob || (scale === 1 && blob.size > file.size)) {
    return { blob: file, ext: file.type.split("/")[1].replace("jpeg", "jpg"), mime: file.type, width: bmp.width, height: bmp.height };
  }
  return { blob, ext: "webp", mime: "image/webp", width: w, height: h };
}

export async function uploadToStorage(eventId: string, folder: string, file: File) {
  if (file.size > MAX_BYTES) throw new Error(`"${file.name}" passa de 50 MB.`);
  const p = await prepare(file);
  const path = `events/${eventId}/${folder}/${crypto.randomUUID()}.${p.ext}`;
  const supabase = createClient();
  const { error } = await supabase.storage.from("media").upload(path, p.blob, { contentType: p.mime, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message.includes("mime") ? "Tipo de arquivo não permitido." : `Falha no envio: ${error.message}`);
  return {
    storage_path: path,
    width: p.width,
    height: p.height,
    size_bytes: p.blob.size,
    mime_type: p.mime,
    kind: (p.mime.startsWith("video/") ? "video" : "image") as "video" | "image",
  };
}

export async function uploadSponsorLogo(file: File) {
  if (file.size > 5 * 1024 * 1024) throw new Error("Logo acima de 5 MB.");
  const p = await prepare(file);
  const path = `sponsors/${crypto.randomUUID()}.${p.ext}`;
  const supabase = createClient();
  const { error } = await supabase.storage.from("media").upload(path, p.blob, { contentType: p.mime, cacheControl: "31536000" });
  if (error) throw new Error(error.message);
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}
