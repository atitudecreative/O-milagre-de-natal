import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { dataDir } from '@/lib/db/sqlite';

/**
 * Armazenamento de arquivos enviados pelo painel.
 *  - Supabase Storage quando SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY estiverem definidos
 *    (bucket público, padrão "media");
 *  - Disco local (DATA_DIR/uploads), servido pela rota /uploads/*.
 */

const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'application/pdf': 'pdf',
};

const MAX_BYTES = Number(process.env.UPLOAD_MAX_MB ?? 30) * 1024 * 1024;

export function uploadsDir() {
  return path.join(dataDir(), 'uploads');
}

export async function saveUpload(file: File, folder = 'geral'): Promise<string> {
  const ext = ALLOWED[file.type];
  if (!ext) throw new Error(`Tipo de arquivo não permitido (${file.type || 'desconhecido'}).`);
  if (file.size > MAX_BYTES) throw new Error(`Arquivo acima do limite de ${MAX_BYTES / 1024 / 1024} MB.`);
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, '').slice(0, 40) || 'geral';
  const base = file.name.replace(/\.[^.]+$/, '').normalize('NFD').replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 48) || 'arquivo';
  const key = `${safeFolder}/${Date.now().toString(36)}-${randomUUID().slice(0, 8)}-${base}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && serviceKey) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'media';
    const res = await fetch(`${url}/storage/v1/object/${bucket}/${key}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${serviceKey}`, 'Content-Type': file.type, 'x-upsert': 'true', 'cache-control': '31536000' },
      body: bytes,
    });
    if (!res.ok) throw new Error(`Falha no upload para o Supabase Storage (${res.status}): ${await res.text()}`);
    return `${url}/storage/v1/object/public/${bucket}/${key}`;
  }

  const target = path.join(uploadsDir(), key);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, bytes);
  return `/uploads/${key}`;
}

export const MIME_BY_EXT: Record<string, string> = Object.fromEntries(Object.entries(ALLOWED).map(([m, e]) => [e, m]));
