/**
 * Tipografias disponíveis para os eventos (Google Fonts, carregadas sob demanda
 * apenas na página do evento que as utiliza). Lista curada para manter qualidade.
 */
export type FontOption = { family: string; category: "display" | "sans" | "serif"; weights: string; note: string };

export const FONT_OPTIONS: FontOption[] = [
  { family: "Anton", category: "display", weights: "400", note: "Condensada, festival" },
  { family: "Bebas Neue", category: "display", weights: "400", note: "Condensada, esportiva" },
  { family: "Archivo Black", category: "display", weights: "400", note: "Grotesca pesada" },
  { family: "Big Shoulders Display", category: "display", weights: "500;700;900", note: "Industrial, urbana" },
  { family: "Unbounded", category: "display", weights: "400;600;800", note: "Geométrica expandida" },
  { family: "Syne", category: "display", weights: "500;700;800", note: "Arte, cultura" },
  { family: "Space Grotesk", category: "sans", weights: "400;500;700", note: "Tech, conferência" },
  { family: "Sora", category: "sans", weights: "400;600;800", note: "Corporativa moderna" },
  { family: "Manrope", category: "sans", weights: "400;600;800", note: "Neutra, legível" },
  { family: "Inter", category: "sans", weights: "400;500;600;700", note: "Neutra, texto" },
  { family: "DM Sans", category: "sans", weights: "400;500;700", note: "Amigável" },
  { family: "Instrument Sans", category: "sans", weights: "400;500;700", note: "Editorial limpa" },
  { family: "Fraunces", category: "serif", weights: "400;600;900", note: "Serifada expressiva" },
  { family: "Playfair Display", category: "serif", weights: "400;700;900", note: "Clássica, gala" },
  { family: "Instrument Serif", category: "serif", weights: "400", note: "Editorial elegante" },
  { family: "DM Serif Display", category: "serif", weights: "400", note: "Contraste alto" },
];

export function fontStack(family: string) {
  const f = FONT_OPTIONS.find((o) => o.family === family);
  const fallback = f?.category === "serif" ? "Georgia, serif" : "system-ui, sans-serif";
  return `"${family}", ${fallback}`;
}

export function googleFontsHref(families: string[]) {
  const unique = Array.from(new Set(families)).filter((f) => FONT_OPTIONS.some((o) => o.family === f));
  if (!unique.length) return null;
  const q = unique
    .map((f) => {
      const opt = FONT_OPTIONS.find((o) => o.family === f)!;
      const fam = f.replace(/ /g, "+");
      return opt.weights === "400" ? `family=${fam}` : `family=${fam}:wght@${opt.weights}`;
    })
    .join("&");
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}
