import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import type { Role } from '@/lib/schema';

const COOKIE = 'mn_session';
const MAX_AGE = 60 * 60 * 12; // 12h

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === 'production') throw new Error('SESSION_SECRET ausente ou curto (mínimo 32 caracteres).');
    return 'dev-only-secret-dev-only-secret-dev-only';
  }
  return s;
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export async function createSession(userId: string) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + MAX_AGE * 1000 })).toString('base64url');
  const jar = await cookies();
  jar.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && process.env.INSECURE_COOKIES !== 'true',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split('.');
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const got = Buffer.from(sig);
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return null;
  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!uid || Date.now() > exp) return null;
    const user = await (await db()).get('users', uid);
    if (!user || !user.active) return null;
    return { id: user.id, email: String(user.email), name: String(user.name), role: user.role as Role };
  } catch {
    return null;
  }
}

export const PERMISSIONS = {
  content: ['admin', 'editor'] as Role[],
  leads: ['admin', 'comercial'] as Role[],
  users: ['admin'] as Role[],
  dashboard: ['admin', 'editor', 'comercial'] as Role[],
};

export function can(user: SessionUser | null, area: keyof typeof PERMISSIONS) {
  return !!user && PERMISSIONS[area].includes(user.role);
}

/** Uso em páginas e server actions: interrompe se não houver permissão. */
export async function requireRole(area: keyof typeof PERMISSIONS) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (!can(user, area)) redirect('/admin?erro=permissao');
  return user;
}
