import { createHash } from 'node:crypto';

const buckets = new Map<string, { count: number; reset: number }>();

/** Limitador em memória (por instância). Em múltiplas instâncias, complemente com Turnstile/WAF. */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return true;
  }
  b.count++;
  return b.count <= limit;
}

export function clientIp(h: Headers) {
  return (h.get('x-forwarded-for')?.split(',')[0] || h.get('x-real-ip') || 'local').trim();
}

export function hashIp(ip: string) {
  return createHash('sha256').update(`${ip}:${process.env.SESSION_SECRET ?? ''}`).digest('hex').slice(0, 24);
}
