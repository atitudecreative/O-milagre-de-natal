import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { siteUrl } from "@/lib/env";

/** Fonte de imagem aceita pelo `<Image>` do react-pdf (apenas JPG/PNG). */
export type PdfImage = { data: Buffer; format: "jpg" | "png"; width: number; height: number };

/** `photo` vira JPEG redimensionado; `logo` vira PNG com transparência preservada. */
export type ImageKind = "photo" | "logo";
export type ImageRequest = { url: string; kind: ImageKind; maxWidth?: number };

const FETCH_TIMEOUT_MS = 6000;
const CONCURRENCY = 6;
const MAX_BYTES = 15 * 1024 * 1024;

export function imageKey(url: string, kind: ImageKind, maxWidth?: number) {
  return `${kind}:${maxWidth ?? ""}:${url}`;
}

function resolveUrl(raw: string, maxWidth: number): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed, `${siteUrl()}/`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    // Unsplash entrega no tamanho pedido: evita baixar 2400px para usar 900px.
    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("w", String(maxWidth));
      url.searchParams.set("fm", "jpg");
    }
    return url.toString();
  } catch {
    return null;
  }
}

function looksLikeSvg(buf: Buffer, contentType: string | null, url: string) {
  if (contentType?.includes("svg")) return true;
  if (/\.svg($|\?)/i.test(url)) return true;
  const head = buf.subarray(0, 256).toString("utf8").trimStart();
  return head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"));
}

async function loadOne(req: ImageRequest): Promise<PdfImage | null> {
  const maxWidth = req.maxWidth ?? (req.kind === "logo" ? 600 : 1800);
  // Arquivos de /public são lidos do disco (não depende do site estar acessível).
  const local = req.url.startsWith("/") && !req.url.startsWith("//");
  const url = local ? req.url : resolveUrl(req.url, maxWidth);
  if (!url) return null;
  try {
    let buf: Buffer;
    let contentType: string | null = null;
    if (local) {
      const publicDir = path.join(process.cwd(), "public");
      const file = path.join(publicDir, decodeURIComponent(url.split("?")[0]));
      if (!file.startsWith(publicDir + path.sep)) return null;
      buf = await readFile(file);
    } else {
      const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), headers: { Accept: "image/*" } });
      if (!res.ok) return null;
      buf = Buffer.from(await res.arrayBuffer());
      contentType = res.headers.get("content-type");
    }
    if (!buf.length || buf.length > MAX_BYTES) return null;
    const svg = looksLikeSvg(buf, contentType, url);
    const input = sharp(buf, svg ? { density: 300 } : { failOn: "none" }).rotate();

    if (req.kind === "logo" || svg) {
      const { data, info } = await input
        .resize({ width: maxWidth, height: maxWidth, fit: "inside", withoutEnlargement: !svg })
        .png({ compressionLevel: 8 })
        .toBuffer({ resolveWithObject: true });
      return { data, format: "png", width: info.width, height: info.height };
    }

    const { data, info } = await input
      .resize({ width: maxWidth, withoutEnlargement: true })
      .flatten({ background: "#000000" })
      .jpeg({ quality: 78, progressive: false })
      .toBuffer({ resolveWithObject: true });
    return { data, format: "jpg", width: info.width, height: info.height };
  } catch {
    return null;
  }
}

/**
 * Baixa e converte imagens em paralelo (com limite de concorrência).
 * Falhas são ignoradas: a chave simplesmente não aparece no mapa.
 */
export async function loadImages(requests: ImageRequest[]): Promise<Map<string, PdfImage>> {
  const unique = new Map<string, ImageRequest>();
  for (const r of requests) {
    if (!r.url) continue;
    const key = imageKey(r.url, r.kind, r.maxWidth);
    if (!unique.has(key)) unique.set(key, r);
  }
  const entries = Array.from(unique.entries());
  const out = new Map<string, PdfImage>();
  let cursor = 0;
  async function worker() {
    while (cursor < entries.length) {
      const [key, req] = entries[cursor++];
      const img = await loadOne(req);
      if (img) out.set(key, img);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, entries.length) }, worker));
  return out;
}
