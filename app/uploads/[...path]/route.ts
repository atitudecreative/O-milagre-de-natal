import fs from 'node:fs/promises';
import path from 'node:path';
import { uploadsDir, MIME_BY_EXT } from '@/lib/storage';

export const runtime = 'nodejs';

/** Serve arquivos enviados pelo painel quando o armazenamento é local. */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path;
  const root = uploadsDir();
  const file = path.resolve(root, ...parts);
  if (!file.startsWith(root + path.sep)) return new Response('Not found', { status: 404 });
  try {
    const data = await fs.readFile(file);
    const ext = path.extname(file).slice(1).toLowerCase();
    return new Response(new Uint8Array(data), {
      headers: {
        'Content-Type': MIME_BY_EXT[ext] ?? 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
        // Arquivos enviados nunca executam scripts (protege SVGs).
        'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
