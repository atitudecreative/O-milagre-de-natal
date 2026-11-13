'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { createSession, destroySession, getSessionUser, requireRole } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/password';
import { clientIp, rateLimit } from '@/lib/ratelimit';
import { saveUpload } from '@/lib/storage';
import { getCollection, LEAD_STATUSES, SETTINGS_FIELDS, type Field, type Role } from '@/lib/schema';

function refreshSite() {
  revalidatePath('/', 'layout');
}

/* ------------------------------ Login ------------------------------ */

export async function loginAction(_prev: { error?: string } | undefined, form: FormData) {
  const ip = clientIp(await headers());
  if (!rateLimit(`login:${ip}`, 8, 15 * 60 * 1000)) return { error: 'Muitas tentativas. Aguarde 15 minutos.' };
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');
  const d = await db();
  const user = email ? await d.findBy('users', 'email', email) : null;
  const ok = user && user.active && (await verifyPassword(password, String(user.password_hash)));
  if (!ok) return { error: 'E-mail ou senha incorretos.' };
  await d.update('users', user.id, { last_login_at: new Date().toISOString() });
  await createSession(user.id);
  redirect('/admin');
}

export async function logoutAction() {
  await destroySession();
  redirect('/admin/login');
}

/* ---------------------------- Conteúdo ----------------------------- */

async function readFields(fields: Field[], form: FormData, folder: string) {
  const data: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.type === 'boolean') {
      data[f.name] = form.get(f.name) === 'on';
      continue;
    }
    let v = String(form.get(f.name) ?? '').trim();
    if (f.type === 'image' || f.type === 'media') {
      const file = form.get(`${f.name}__file`);
      if (file instanceof File && file.size > 0) v = await saveUpload(file, folder);
    }
    if (f.type === 'lines' || f.type === 'pairs') v = v.replace(/\r\n/g, '\n');
    if (f.required && !v) throw new Error(`O campo "${f.label}" é obrigatório.`);
    if (f.type === 'url' && v && !/^(https?:\/\/|\/|mailto:|tel:)/.test(v)) throw new Error(`"${f.label}" precisa começar com https://`);
    data[f.name] = f.type === 'number' ? (v === '' ? null : Number(v.replace(',', '.'))) : v;
  }
  return data;
}

export async function saveItemAction(collectionKey: string, id: string, form: FormData) {
  await requireRole('content');
  const c = getCollection(collectionKey);
  if (!c) throw new Error('Coleção inválida');
  const d = await db();
  let target = `/admin/conteudo/${c.key}?ok=salvo`;
  try {
    const data = await readFields(c.fields, form, c.key);
    data.visible = form.get('visible') === 'on';
    const sort = Number(form.get('sort'));
    if (Number.isFinite(sort)) data.sort = sort;
    if (id === 'novo') {
      if (!Number.isFinite(sort)) {
        const all = await d.list(c.key);
        data.sort = (Math.max(0, ...all.map((r) => Number(r.sort) || 0)) || 0) + 10;
      }
      await d.insert(c.key, data);
    } else await d.update(c.key, id, data);
    refreshSite();
  } catch (e) {
    target = `/admin/conteudo/${c.key}/${id}?erro=${encodeURIComponent((e as Error).message)}`;
  }
  redirect(target);
}

export async function deleteItemAction(collectionKey: string, id: string) {
  await requireRole('content');
  if (!getCollection(collectionKey)) throw new Error('Coleção inválida');
  await (await db()).remove(collectionKey, id);
  refreshSite();
  redirect(`/admin/conteudo/${collectionKey}?ok=removido`);
}

export async function toggleVisibleAction(collectionKey: string, id: string) {
  await requireRole('content');
  if (!getCollection(collectionKey)) throw new Error('Coleção inválida');
  const d = await db();
  const row = await d.get(collectionKey, id);
  if (row) await d.update(collectionKey, id, { visible: !row.visible });
  refreshSite();
  revalidatePath(`/admin/conteudo/${collectionKey}`);
}

export async function moveItemAction(collectionKey: string, id: string, dir: -1 | 1) {
  await requireRole('content');
  if (!getCollection(collectionKey)) throw new Error('Coleção inválida');
  const d = await db();
  const rows = await d.list(collectionKey, { orderBy: 'sort' });
  const i = rows.findIndex((r) => r.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= rows.length) return;
  [rows[i], rows[j]] = [rows[j], rows[i]];
  for (let k = 0; k < rows.length; k++) if (Number(rows[k].sort) !== (k + 1) * 10) await d.update(collectionKey, rows[k].id, { sort: (k + 1) * 10 });
  refreshSite();
  revalidatePath(`/admin/conteudo/${collectionKey}`);
}

/* -------------------------- Configurações -------------------------- */

export async function saveSettingsAction(group: string, form: FormData) {
  await requireRole('content');
  const keys = new Set(String(form.get('__keys') ?? '').split(','));
  const fields = SETTINGS_FIELDS.filter((f) => keys.has(f.name));
  let target = `/admin/configuracoes?grupo=${group}&ok=1`;
  try {
    const data = await readFields(fields, form, 'site');
    await (await db()).setSettings(Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v === null ? '' : String(v)])));
    refreshSite();
  } catch (e) {
    target = `/admin/configuracoes?grupo=${group}&erro=${encodeURIComponent((e as Error).message)}`;
  }
  redirect(target);
}

/* ------------------------------ Leads ------------------------------ */

export async function updateLeadAction(id: string, form: FormData) {
  await requireRole('leads');
  const status = String(form.get('status') ?? '');
  if (!LEAD_STATUSES.some((s) => s.value === status)) throw new Error('Status inválido');
  await (await db()).update('leads', id, { status, notes: String(form.get('notes') ?? '').slice(0, 5000) });
  redirect(`/admin/leads/${id}?ok=1`);
}

export async function deleteLeadAction(id: string) {
  await requireRole('leads');
  await (await db()).remove('leads', id);
  redirect('/admin/leads?ok=removido');
}

/* ----------------------------- Usuários ---------------------------- */

const ROLES: Role[] = ['admin', 'editor', 'comercial'];

export async function createUserAction(form: FormData) {
  await requireRole('users');
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const name = String(form.get('name') ?? '').trim();
  const role = String(form.get('role')) as Role;
  const password = String(form.get('password') ?? '');
  let target = '/admin/usuarios?ok=criado';
  try {
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('E-mail inválido.');
    if (!ROLES.includes(role)) throw new Error('Perfil inválido.');
    if (password.length < 10) throw new Error('A senha precisa ter pelo menos 10 caracteres.');
    const d = await db();
    if (await d.findBy('users', 'email', email)) throw new Error('Já existe um usuário com este e-mail.');
    await d.insert('users', { email, name: name || email, role, active: true, password_hash: await hashPassword(password) });
  } catch (e) {
    target = `/admin/usuarios?erro=${encodeURIComponent((e as Error).message)}`;
  }
  redirect(target);
}

export async function updateUserAction(id: string, form: FormData) {
  const me = await requireRole('users');
  const role = String(form.get('role')) as Role;
  const active = form.get('active') === 'on';
  const password = String(form.get('password') ?? '');
  let target = '/admin/usuarios?ok=atualizado';
  try {
    if (!ROLES.includes(role)) throw new Error('Perfil inválido.');
    if (id === me.id && (role !== 'admin' || !active)) throw new Error('Você não pode remover o seu próprio acesso de administrador.');
    if (password && password.length < 10) throw new Error('A senha precisa ter pelo menos 10 caracteres.');
    await (await db()).update('users', id, { role, active, ...(password ? { password_hash: await hashPassword(password) } : {}) });
  } catch (e) {
    target = `/admin/usuarios?erro=${encodeURIComponent((e as Error).message)}`;
  }
  redirect(target);
}

export async function changeOwnPasswordAction(form: FormData) {
  const me = await getSessionUser();
  if (!me) redirect('/admin/login');
  const current = String(form.get('current') ?? '');
  const next = String(form.get('next') ?? '');
  const d = await db();
  const user = await d.get('users', me.id);
  let target = '/admin/conta?ok=1';
  if (!user || !(await verifyPassword(current, String(user.password_hash)))) target = '/admin/conta?erro=' + encodeURIComponent('Senha atual incorreta.');
  else if (next.length < 10) target = '/admin/conta?erro=' + encodeURIComponent('A nova senha precisa ter pelo menos 10 caracteres.');
  else await d.update('users', me.id, { password_hash: await hashPassword(next) });
  redirect(target);
}
