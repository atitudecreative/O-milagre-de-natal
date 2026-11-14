import "server-only";
import { Font } from "@react-pdf/renderer";
import { FONT_OPTIONS } from "@/lib/fonts";

/**
 * Tipografia do PDF. Tenta usar as fontes do evento (Google Fonts, TTF);
 * se algo falhar, cai para a Helvetica embutida no PDF.
 */
export type DeckFonts = {
  heading: string;
  body: string;
  /** Peso a usar no corpo para negrito (700 se a família tiver; senão o próprio 400). */
  bodyBold: number;
};

const FALLBACK: DeckFonts = { heading: "Helvetica", body: "Helvetica", bodyBold: 700 };
const TIMEOUT_MS = 4000;
// Um User-Agent antigo faz o Google Fonts responder com URLs .ttf (que o react-pdf aceita).
const OLD_UA = "Mozilla/4.0";

type Face = { weight: number; url: string };
type FamilyFiles = { regular: string; bold: string | null; display: string };

const cache = new Map<string, Promise<FamilyFiles | null>>();
const registered = new Set<string>();

let hyphenationOff = false;
function disableHyphenation() {
  if (hyphenationOff) return;
  Font.registerHyphenationCallback((word) => [word]);
  hyphenationOff = true;
}

async function fetchText(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": OLD_UA }, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function fetchDataUrl(url: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  // Só TrueType/OpenType (o fontkit do react-pdf não lê EOT/WOFF2).
  const magic = buf.subarray(0, 4).toString("hex");
  if (!["00010000", "74727565", "4f54544f"].includes(magic)) throw new Error("Formato de fonte não suportado");
  return `data:font/ttf;base64,${buf.toString("base64")}`;
}

function parseFaces(css: string): Face[] {
  const faces: Face[] = [];
  for (const block of css.split("@font-face").slice(1)) {
    if (/font-style:\s*italic/.test(block)) continue;
    const w = /font-weight:\s*(\d+)/.exec(block);
    const u = /url\((['"]?)(https:[^)'"]+\.ttf)\1\)/.exec(block);
    if (u) faces.push({ weight: w ? Number(w[1]) : 400, url: u[2] });
  }
  return faces;
}

function closest(faces: Face[], target: number) {
  return [...faces].sort((a, b) => Math.abs(a.weight - target) - Math.abs(b.weight - target) || b.weight - a.weight)[0];
}

async function loadFamily(family: string): Promise<FamilyFiles | null> {
  const opt = FONT_OPTIONS.find((o) => o.family === family);
  const fam = encodeURIComponent(family).replace(/%20/g, "+");
  const weights = opt?.weights ?? "400;700";
  let css: string;
  try {
    css = await fetchText(`https://fonts.googleapis.com/css2?family=${fam}:wght@${weights}`);
  } catch {
    css = await fetchText(`https://fonts.googleapis.com/css2?family=${fam}`);
  }
  const faces = parseFaces(css);
  if (!faces.length) return null;
  const regular = closest(faces, 400);
  const boldFace = faces.filter((f) => f.weight >= 600);
  const bold = boldFace.length ? closest(boldFace, 700) : null;
  const display = closest(faces, 700);

  const urls = Array.from(new Set([regular.url, bold?.url, display.url].filter(Boolean) as string[]));
  const data = new Map(await Promise.all(urls.map(async (u) => [u, await fetchDataUrl(u)] as const)));
  return { regular: data.get(regular.url)!, bold: bold ? data.get(bold.url)! : null, display: data.get(display.url)! };
}

function getFamily(family: string) {
  let p = cache.get(family);
  if (!p) {
    p = loadFamily(family).catch(() => null);
    cache.set(family, p);
    // Não guarda falhas para sempre: tenta de novo na próxima geração.
    p.then((r) => { if (!r) cache.delete(family); });
  }
  return p;
}

export async function loadDeckFonts(headingFamily: string, bodyFamily: string): Promise<DeckFonts> {
  disableHyphenation();
  const [heading, body] = await Promise.all([
    headingFamily ? getFamily(headingFamily) : Promise.resolve(null),
    bodyFamily ? getFamily(bodyFamily) : Promise.resolve(null),
  ]);

  const result: DeckFonts = { ...FALLBACK };
  try {
    if (heading) {
      const name = `DeckHeading-${headingFamily}`;
      if (!registered.has(name)) {
        Font.register({ family: name, fonts: [{ src: heading.display, fontWeight: 400 }, { src: heading.display, fontWeight: 700 }] });
        registered.add(name);
      }
      result.heading = name;
    }
    if (body) {
      const name = `DeckBody-${bodyFamily}`;
      if (!registered.has(name)) {
        Font.register({ family: name, fonts: [{ src: body.regular, fontWeight: 400 }, { src: body.bold ?? body.regular, fontWeight: 700 }] });
        registered.add(name);
      }
      result.body = name;
    }
  } catch {
    return FALLBACK;
  }
  return result;
}
