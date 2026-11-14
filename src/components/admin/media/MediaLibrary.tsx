"use client";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { MediaRow } from "@/lib/types";
import { MEDIA_FOLDERS } from "@/lib/labels";
import { registerMedia, replaceMediaFile } from "@/actions/media";
import { deleteCollectionItem, saveCollectionItem } from "@/actions/content";
import { videoEmbed } from "@/lib/video";
import { EvImage } from "@/components/public/EvImage";
import { Button, cx } from "../ui";
import { Field, Input, Select, Textarea, Toggle } from "../ui/fields";
import { useToast } from "../ui/toast";
import { ConfirmDialog } from "../ui/confirm";
import { ACCEPT, uploadToStorage } from "./upload";

type Props = {
  eventId: string;
  initial: MediaRow[];
  canWrite: boolean;
  /** Modo seletor: devolve a mídia escolhida. */
  onSelect?: (m: MediaRow) => void;
  selectKind?: "image" | "video" | "any";
  defaultFolder?: string;
};

function sizeLabel(b: number | null) {
  if (!b) return "";
  return b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;
}

export function MediaLibrary({ eventId, initial, canWrite, onSelect, selectKind = "any", defaultFolder = "geral" }: Props) {
  const [items, setItems] = useState<MediaRow[]>(initial);
  const [folder, setFolder] = useState<string>("todas");
  const [uploadFolder, setUploadFolder] = useState(defaultFolder);
  const [busy, setBusy] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [editing, setEditing] = useState<MediaRow | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();

  const visible = useMemo(
    () =>
      items.filter((m) => (folder === "todas" || m.folder === folder) && (selectKind === "any" || (selectKind === "image" ? m.kind === "image" : m.kind !== "image"))),
    [items, folder, selectKind],
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const m of items) c[m.folder] = (c[m.folder] ?? 0) + 1;
    return c;
  }, [items]);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    for (const [i, file] of list.entries()) {
      setBusy(`Enviando ${i + 1} de ${list.length}…`);
      try {
        const up = await uploadToStorage(eventId, uploadFolder, file);
        const res = await registerMedia(eventId, { ...up, folder: uploadFolder, alt: null });
        if (!res.ok) throw new Error(res.error);
        setItems((s) => [res.data!, ...s]);
        if (list.length === 1 && onSelect) onSelect(res.data!);
      } catch (e) {
        toast(e instanceof Error ? e.message : "Falha no envio.", "bad");
      }
    }
    setBusy(null);
    router.refresh();
  }

  async function addVideoLink() {
    const embed = videoEmbed(videoUrl.trim());
    if (!embed) return toast("Use um link do YouTube, Vimeo ou arquivo .mp4.", "bad");
    setBusy("Adicionando vídeo…");
    const res = await registerMedia(eventId, { kind: embed.type === "file" ? "video" : "embed", folder: uploadFolder === "geral" ? "aftermovie" : uploadFolder, url: videoUrl.trim() });
    setBusy(null);
    if (!res.ok) return toast(res.error, "bad");
    setItems((s) => [res.data!, ...s]);
    setVideoUrl("");
    toast("Vídeo adicionado.");
  }

  return (
    <div>
      {canWrite ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) void upload(e.dataTransfer.files); }}
          className={cx("rounded-xl border border-dashed p-5 transition-colors", drag ? "border-ink bg-paper-2" : "border-line-strong bg-card")}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <p className="text-sm font-medium">{busy ?? "Arraste imagens e vídeos aqui"}</p>
              <p className="mt-1 text-xs text-mute">JPG, PNG, WebP, SVG, GIF, MP4 até 50 MB. Imagens são otimizadas automaticamente (máx. 2560 px, WebP).</p>
            </div>
            <Field label="Pasta" className="md:w-44">
              <Select value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value)}>
                {MEDIA_FOLDERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </Select>
            </Field>
            <input ref={inputRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} />
            <Button type="button" onClick={() => inputRef.current?.click()} disabled={!!busy}>Selecionar arquivos</Button>
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row">
            <Input placeholder="Ou cole um link do YouTube, Vimeo ou .mp4" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
            <Button type="button" variant="secondary" onClick={addVideoLink} disabled={!videoUrl || !!busy}>Adicionar vídeo</Button>
          </div>
        </div>
      ) : null}

      <div className="my-5 flex gap-1 overflow-x-auto adm-scroll">
        {[{ value: "todas", label: "Todas" }, ...MEDIA_FOLDERS].filter((f) => f.value === "todas" || counts[f.value]).map((f) => (
          <button key={f.value} type="button" onClick={() => setFolder(f.value)} className={cx("shrink-0 rounded-full px-3 py-1 text-xs", folder === f.value ? "bg-ink text-card" : "text-ink-2 hover:bg-paper-2")}>
            {f.label} <span className="opacity-60">{f.value === "todas" ? items.length : counts[f.value]}</span>
          </button>
        ))}
      </div>

      {visible.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((m) => (
            <li key={m.id} className="group overflow-hidden rounded-lg bg-card ring-1 ring-line">
              <button type="button" onClick={() => (onSelect ? onSelect(m) : setEditing(m))} className="relative block aspect-[4/3] w-full bg-paper-2" aria-label={onSelect ? `Selecionar ${m.alt || m.caption || "mídia"}` : `Editar ${m.alt || m.caption || "mídia"}`}>
                {m.kind === "image" ? (
                  <EvImage src={m.url} alt={m.alt ?? ""} fill sizes="240px" className={cx("transition-transform duration-500 group-hover:scale-105", m.mime_type === "image/svg+xml" ? "object-contain p-4" : "object-cover")} />
                ) : m.poster_url ? (
                  <EvImage src={m.poster_url} alt="" fill sizes="240px" className="object-cover" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.2em] text-mute">{m.kind === "embed" ? "Vídeo (link)" : "Vídeo"}</span>
                )}
                {m.featured ? <span className="absolute left-2 top-2 rounded bg-ink px-1.5 py-0.5 text-[10px] text-card">Destaque</span> : null}
                {m.in_gallery ? <span className="absolute right-2 top-2 rounded bg-card/90 px-1.5 py-0.5 text-[10px]">Galeria</span> : null}
              </button>
              <div className="px-2.5 py-2">
                <p className="truncate text-xs font-medium">{m.caption || m.alt || "Sem legenda"}</p>
                <p className="truncate text-[11px] text-mute">{MEDIA_FOLDERS.find((f) => f.value === m.folder)?.label ?? m.folder}{m.width ? ` · ${m.width}×${m.height}` : ""} {sizeLabel(m.size_bytes)}</p>
                {!m.alt && m.kind === "image" ? <p className="mt-0.5 text-[11px] text-warn">Falta texto alternativo</p> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-line-strong p-10 text-center text-sm text-mute">Nenhum arquivo nesta pasta.</p>
      )}

      {editing ? (
        <MediaEditor
          key={editing.id}
          media={editing}
          eventId={eventId}
          canWrite={canWrite}
          onClose={() => setEditing(null)}
          onSaved={(m) => { setItems((s) => s.map((x) => (x.id === m.id ? m : x))); setEditing(null); router.refresh(); }}
          onDeleted={(id) => { setItems((s) => s.filter((x) => x.id !== id)); setEditing(null); router.refresh(); }}
        />
      ) : null}
    </div>
  );
}

function MediaEditor({ media, eventId, canWrite, onClose, onSaved, onDeleted }: { media: MediaRow; eventId: string; canWrite: boolean; onClose: () => void; onSaved: (m: MediaRow) => void; onDeleted: (id: string) => void }) {
  const [m, setM] = useState(media);
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const replaceRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  function save() {
    start(async () => {
      const res = await saveCollectionItem("event_media", eventId, m.id, { folder: m.folder, caption: m.caption ?? "", alt: m.alt ?? "", credit: m.credit ?? "", in_gallery: m.in_gallery, featured: m.featured, poster_url: m.poster_url ?? "" });
      if (!res.ok) return toast(res.error, "bad");
      toast("Mídia atualizada.");
      onSaved(m);
    });
  }
  async function replace(file: File) {
    try {
      const up = await uploadToStorage(eventId, m.folder, file);
      const res = await replaceMediaFile(eventId, m.id, up);
      if (!res.ok) throw new Error(res.error);
      setM(res.data!);
      toast("Arquivo substituído em todas as seções que o usavam.");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Falha.", "bad");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Editar mídia">
      <button type="button" aria-label="Fechar" className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-lg flex-col bg-paper shadow-2xl animate-[rise_0.4s_var(--ease-out-expo)_both]">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-2xl">Detalhes da mídia</h2>
          <button type="button" onClick={onClose} className="text-sm text-mute hover:text-ink">Fechar</button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-5 adm-scroll">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-paper-2">
            {m.kind === "image" ? <EvImage src={m.url} alt={m.alt ?? ""} fill sizes="500px" className="object-contain" /> : <p className="flex h-full items-center justify-center break-all p-4 text-center text-xs text-mute">{m.url}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => { void navigator.clipboard.writeText(m.url); toast("Link copiado."); }}>Copiar link</Button>
            {canWrite && m.storage_path ? (
              <>
                <input ref={replaceRef} type="file" hidden accept={ACCEPT} onChange={(e) => e.target.files?.[0] && replace(e.target.files[0])} />
                <Button type="button" size="sm" variant="secondary" onClick={() => replaceRef.current?.click()}>Substituir arquivo</Button>
              </>
            ) : null}
          </div>
          <Field label="Texto alternativo" hint="Descreva a imagem para leitores de tela e SEO.">
            <Textarea rows={2} value={m.alt ?? ""} onChange={(e) => setM({ ...m, alt: e.target.value })} disabled={!canWrite} maxLength={280} />
          </Field>
          <Field label="Legenda"><Input value={m.caption ?? ""} onChange={(e) => setM({ ...m, caption: e.target.value })} disabled={!canWrite} maxLength={280} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Crédito"><Input value={m.credit ?? ""} onChange={(e) => setM({ ...m, credit: e.target.value })} disabled={!canWrite} /></Field>
            <Field label="Pasta">
              <Select value={m.folder} onChange={(e) => setM({ ...m, folder: e.target.value })} disabled={!canWrite}>
                {MEDIA_FOLDERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </Select>
            </Field>
          </div>
          {m.kind !== "image" ? <Field label="Imagem de capa (URL)"><Input value={m.poster_url ?? ""} onChange={(e) => setM({ ...m, poster_url: e.target.value })} disabled={!canWrite} /></Field> : null}
          <div className="space-y-4 rounded-lg bg-card p-4 ring-1 ring-line">
            <Toggle label="Exibir na galeria" description="Aparece na seção “A grandiosidade”." checked={m.in_gallery} onChange={(v) => setM({ ...m, in_gallery: v })} disabled={!canWrite} />
            <Toggle label="Destaque" description="Abre a galeria em tela cheia." checked={m.featured} onChange={(v) => setM({ ...m, featured: v })} disabled={!canWrite} />
          </div>
        </div>
        {canWrite ? (
          <div className="flex justify-between gap-2 border-t border-line px-5 py-4">
            <Button type="button" variant="ghost" className="text-bad" onClick={() => setConfirm(true)}>Excluir</Button>
            <Button type="button" onClick={save} disabled={pending}>{pending ? "Salvando…" : "Salvar"}</Button>
          </div>
        ) : null}
      </div>
      <ConfirmDialog open={confirm} tone="danger" title="Excluir mídia?" confirmLabel="Excluir" onClose={() => setConfirm(false)}
        description="O arquivo some da biblioteca. Seções que usam este link deixarão de exibi-lo."
        onConfirm={async () => { const r = await deleteCollectionItem("event_media", eventId, m.id); if (r.ok) { toast("Mídia excluída."); onDeleted(m.id); } else toast(r.error, "bad"); }} />
    </div>
  );
}
