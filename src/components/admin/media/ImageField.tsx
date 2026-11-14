"use client";
import { useState } from "react";
import type { MediaRow } from "@/lib/types";
import { EvImage } from "@/components/public/EvImage";
import { Button } from "../ui";
import { Input } from "../ui/fields";
import { MediaLibrary } from "./MediaLibrary";

/** Campo de imagem/vídeo: escolhe da biblioteca do evento, envia novo arquivo ou cola um link. */
export function ImageField({ value, onChange, eventId, media, kind = "image", folder = "geral", aspect = "aspect-[16/9]", disabled }: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  eventId: string;
  media: MediaRow[];
  kind?: "image" | "video";
  folder?: string;
  aspect?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState(false);
  return (
    <div className="space-y-2">
      <div className={`relative overflow-hidden rounded-lg ring-1 ring-line ${aspect}`} style={{ background: "repeating-conic-gradient(#d9d5cc 0 25%, #c4bfb4 0 50%) 0 0 / 16px 16px" }}>
        {value && kind === "image" ? (
          <EvImage src={value} alt="" fill sizes="400px" className={value.endsWith(".svg") ? "object-contain p-4" : "object-cover"} />
        ) : value ? (
          <p className="absolute inset-0 flex items-center justify-center break-all p-3 text-center text-xs text-mute">{value}</p>
        ) : (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-mute">Nenhum{kind === "image" ? "a imagem" : " vídeo"}</p>
        )}
      </div>
      {!disabled ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(true)}>{value ? "Trocar" : "Escolher"}</Button>
          {value ? <Button type="button" size="sm" variant="ghost" onClick={() => onChange(null)}>Remover</Button> : null}
          <Button type="button" size="sm" variant="ghost" onClick={() => setManual((m) => !m)}>Link</Button>
        </div>
      ) : null}
      {manual ? <Input placeholder="https://…" value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} /> : null}
      {open ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Biblioteca de mídia">
          <button type="button" aria-label="Fechar" className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative flex max-h-[92dvh] w-full max-w-5xl flex-col rounded-t-2xl bg-paper shadow-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-2xl">Escolher {kind === "image" ? "imagem" : "vídeo"}</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-mute hover:text-ink">Fechar</button>
            </div>
            <div className="overflow-y-auto p-5 adm-scroll">
              <MediaLibrary eventId={eventId} initial={media} canWrite selectKind={kind} defaultFolder={folder} onSelect={(m) => { onChange(m.url); setOpen(false); }} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
