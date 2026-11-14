const nf = new Intl.NumberFormat("pt-BR");

/** Formata números grandes de forma editorial: 1.2 mi, 350 mil. */
export function compactNumber(value: number): { number: string; suffix: string } {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return { number: trim(value / 1_000_000_000), suffix: "bi" };
  if (abs >= 1_000_000) return { number: trim(value / 1_000_000), suffix: "mi" };
  if (abs >= 10_000) return { number: trim(value / 1_000), suffix: "mil" };
  return { number: formatNumber(value), suffix: "" };
}

function trim(n: number) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: n < 10 ? 1 : 0 }).format(n);
}

export function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: digits }).format(value);
}

export function formatCurrency(value: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

export function formatInt(value: number) {
  return nf.format(value);
}

export function formatDate(value: string | Date | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value.length === 10 ? `${value}T12:00:00` : value) : value;
  return new Intl.DateTimeFormat("pt-BR", opts).format(d).replace(/\./g, "");
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function relativeTime(value: string) {
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
  if (diff < 60) return "agora";
  if (diff < 3600) return rtf.format(-Math.round(diff / 60), "minute");
  if (diff < 86400) return rtf.format(-Math.round(diff / 3600), "hour");
  if (diff < 86400 * 30) return rtf.format(-Math.round(diff / 86400), "day");
  return formatDate(value);
}

/** "12 a 14 de set de 2027" a partir das datas do evento. */
export function eventDateLabel(starts?: string | null, ends?: string | null, label?: string | null) {
  if (label) return label;
  if (!starts) return "";
  const s = new Date(`${starts}T12:00:00`);
  const e = ends ? new Date(`${ends}T12:00:00`) : null;
  const month = (d: Date) => new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(d);
  if (!e || e.getTime() === s.getTime()) return `${s.getDate()} de ${month(s)} de ${s.getFullYear()}`;
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear())
    return `${s.getDate()} a ${e.getDate()} de ${month(s)} de ${s.getFullYear()}`;
  return `${s.getDate()} de ${month(s)} a ${e.getDate()} de ${month(e)} de ${e.getFullYear()}`;
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function growth(current: number, previous: number | null | undefined) {
  if (previous == null || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function editionLabel(n?: number | null, label?: string | null) {
  if (label) return label;
  if (!n) return "";
  return `${n}ª edição`;
}
