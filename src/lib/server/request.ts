import "server-only";
import { createHash } from "node:crypto";

export function clientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "0.0.0.0"
  );
}

/** Hash irreversível do IP (LGPD: não guardamos o IP em claro). */
export function hashIp(ip: string) {
  const salt = process.env.APP_SECRET ?? "palco";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 40);
}

export async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // Proteção opcional: só é exigida quando as duas chaves estão configuradas.
  if (!secret || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return true;
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const json = (await res.json().catch(() => ({}))) as { success?: boolean };
  return Boolean(json.success);
}
