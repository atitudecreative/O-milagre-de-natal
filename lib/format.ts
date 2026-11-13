export function lines(v: unknown): string[] {
  return String(v ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function pairs(v: unknown): { label: string; value: number }[] {
  return lines(v)
    .map((l) => {
      const i = l.lastIndexOf(':');
      if (i < 0) return null;
      const value = Number(l.slice(i + 1).replace(',', '.').trim());
      return Number.isFinite(value) ? { label: l.slice(0, i).trim(), value } : null;
    })
    .filter((x): x is { label: string; value: number } => !!x);
}

export function brl(n: number) {
  if (n >= 1000 && n % 1000 === 0) return `R$ ${(n / 1000).toLocaleString('pt-BR')} mil`;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

export function compactNumber(n: number) {
  if (n >= 1_000_000) return { value: n / 1_000_000, unit: 'mi' };
  if (n >= 1000) return { value: n / 1000, unit: 'mil' };
  return { value: n, unit: '' };
}

export function whatsappLink(number: string, message: string) {
  const digits = String(number || '').replace(/\D/g, '');
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message || '')}`;
}

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function dateParts(iso: string) {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return { day: String(d).padStart(2, '0'), month: MONTHS[m - 1], weekday: WEEKDAYS[dt.getUTCDay()], year: y };
}

export function formatDateTime(iso: unknown) {
  if (!iso) return '—';
  const d = new Date(String(iso));
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });
}

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}
