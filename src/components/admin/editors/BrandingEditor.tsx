"use client";
import { updateBranding } from "@/actions/events";
import type { BrandingRow, EventRow, MediaRow } from "@/lib/types";
import { FONT_OPTIONS, googleFontsHref } from "@/lib/fonts";
import { brandVars } from "@/lib/theme";
import { contrastRatio } from "@/lib/color";
import { EvImage } from "@/components/public/EvImage";
import { Panel, cx } from "../ui";
import { Field, Input, Select, Toggle } from "../ui/fields";
import { ImageField } from "../media/ImageField";
import { SaveBar, useSaver } from "./useSaver";

const COLORS: { key: keyof BrandingRow; label: string; hint: string }[] = [
  { key: "color_background", label: "Fundo", hint: "Cor dominante da página" },
  { key: "color_text", label: "Texto", hint: "Títulos e parágrafos" },
  { key: "color_accent", label: "Destaque", hint: "Botões, números, detalhes" },
  { key: "color_primary", label: "Primária", hint: "Elementos de marca" },
  { key: "color_secondary", label: "Secundária", hint: "Superfícies e fundo do hero" },
];

const PRESETS = [
  { name: "Noite", v: { color_background: "#0D0B10", color_text: "#F5EFE6", color_accent: "#FF5B2E", color_primary: "#F5C542", color_secondary: "#1E1530" } },
  { name: "Papel", v: { color_background: "#F3EEE4", color_text: "#151412", color_accent: "#D2361E", color_primary: "#151412", color_secondary: "#E3DACB" } },
  { name: "Corporativo", v: { color_background: "#0B1220", color_text: "#EEF2F8", color_accent: "#3D7BFF", color_primary: "#9CC0FF", color_secondary: "#16213A" } },
  { name: "Esporte", v: { color_background: "#0A0A0A", color_text: "#FFFFFF", color_accent: "#C6FF00", color_primary: "#FFFFFF", color_secondary: "#1A1A1A" } },
  { name: "Gala", v: { color_background: "#120F0C", color_text: "#F1E7D6", color_accent: "#C9A25E", color_primary: "#F1E7D6", color_secondary: "#221C16" } },
];

export function BrandingEditor({ event, branding, media, canWrite }: { event: EventRow; branding: BrandingRow; media: MediaRow[]; canWrite: boolean }) {
  const s = useSaver(
    {
      logo_url: branding.logo_url ?? "", logo_alt_url: branding.logo_alt_url ?? "", favicon_url: branding.favicon_url ?? "", texture_url: branding.texture_url ?? "",
      color_primary: branding.color_primary, color_secondary: branding.color_secondary, color_accent: branding.color_accent, color_background: branding.color_background, color_text: branding.color_text,
      font_heading: branding.font_heading, font_body: branding.font_body, heading_case: branding.heading_case, texture_opacity: Number(branding.texture_opacity), grain: branding.grain, corner_style: branding.corner_style,
    } as Record<string, unknown>,
    (v) => updateBranding(event.id, v),
  );
  const v = s.values as Record<string, string> & { grain: boolean; texture_opacity: number };
  const color = (k: keyof BrandingRow) => String(s.values[k] ?? "");
  const textContrast = contrastRatio(v.color_text, v.color_background);
  const fonts = googleFontsHref([v.font_heading, v.font_body]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-6">
        <Panel title="Logotipos e ícone">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Logo principal" hint="SVG ou PNG transparente."><ImageField value={v.logo_url} onChange={(u) => s.set("logo_url", u ?? "")} eventId={event.id} media={media} folder="marcas" aspect="aspect-[3/2]" disabled={!canWrite} /></Field>
            <Field label="Logo alternativo" hint="Usado no rodapé."><ImageField value={v.logo_alt_url} onChange={(u) => s.set("logo_alt_url", u ?? "")} eventId={event.id} media={media} folder="marcas" aspect="aspect-[3/2]" disabled={!canWrite} /></Field>
            <Field label="Favicon" hint="Quadrado, 512×512."><ImageField value={v.favicon_url} onChange={(u) => s.set("favicon_url", u ?? "")} eventId={event.id} media={media} folder="marcas" aspect="aspect-square" disabled={!canWrite} /></Field>
          </div>
        </Panel>

        <Panel title="Cores" description="Comece por uma paleta e ajuste.">
          <div className="mb-5 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.name} type="button" disabled={!canWrite} onClick={() => s.setValues((x) => ({ ...x, ...p.v }))} className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-xs ring-1 ring-line hover:ring-ink disabled:opacity-50">
                <span className="flex overflow-hidden rounded-full">{[p.v.color_background, p.v.color_accent, p.v.color_text].map((c) => <span key={c} className="h-5 w-3" style={{ background: c }} />)}</span>
                {p.name}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COLORS.map((c) => (
              <Field key={c.key} label={c.label} hint={c.hint} error={s.errors[c.key]}>
                <div className="flex items-center gap-2">
                  <input type="color" aria-label={`${c.label} (seletor)`} value={color(c.key)} onChange={(e) => s.set(c.key, e.target.value.toUpperCase())} disabled={!canWrite} className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-line bg-card p-1" />
                  <Input aria-label={`${c.label} (hex)`} value={color(c.key)} onChange={(e) => s.set(c.key, e.target.value)} disabled={!canWrite} maxLength={7} className="font-mono uppercase" />
                </div>
              </Field>
            ))}
          </div>
          <p className={cx("mt-4 text-xs", textContrast < 4.5 ? "text-bad" : "text-mute")}>
            Contraste texto/fundo: {textContrast.toFixed(1)}:1 {textContrast < 4.5 ? "— abaixo do mínimo recomendado (4.5:1) para leitura." : "— adequado (WCAG AA)."}
          </p>
        </Panel>

        <Panel title="Tipografia">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Títulos">
              <Select value={v.font_heading} onChange={(e) => s.set("font_heading", e.target.value)} disabled={!canWrite}>
                {FONT_OPTIONS.map((f) => <option key={f.family} value={f.family}>{f.family} — {f.note}</option>)}
              </Select>
            </Field>
            <Field label="Parágrafos">
              <Select value={v.font_body} onChange={(e) => s.set("font_body", e.target.value)} disabled={!canWrite}>
                {FONT_OPTIONS.filter((f) => f.category !== "display").map((f) => <option key={f.family} value={f.family}>{f.family} — {f.note}</option>)}
              </Select>
            </Field>
            <Field label="Caixa dos títulos">
              <Select value={v.heading_case} onChange={(e) => s.set("heading_case", e.target.value)} disabled={!canWrite}>
                <option value="upper">MAIÚSCULAS</option>
                <option value="none">Como digitado</option>
              </Select>
            </Field>
            <Field label="Cantos">
              <Select value={v.corner_style} onChange={(e) => s.set("corner_style", e.target.value)} disabled={!canWrite}>
                <option value="square">Retos</option>
                <option value="soft">Suaves</option>
                <option value="round">Arredondados</option>
              </Select>
            </Field>
          </div>
        </Panel>

        <Panel title="Texturas e elementos gráficos">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Textura de fundo" hint="Imagem repetida sobre a página (PNG/SVG)."><ImageField value={v.texture_url} onChange={(u) => s.set("texture_url", u ?? "")} eventId={event.id} media={media} folder="texturas" disabled={!canWrite} /></Field>
            <div className="space-y-5">
              <Field label={`Intensidade da textura: ${Math.round(v.texture_opacity * 100)}%`}>
                <input type="range" min={0} max={0.5} step={0.01} value={v.texture_opacity} onChange={(e) => s.set("texture_opacity", Number(e.target.value))} disabled={!canWrite} className="w-full accent-ink" />
              </Field>
              <Toggle label="Grão analógico" description="Ruído sutil sobre a página, estilo filme." checked={v.grain} onChange={(x) => s.set("grain", x)} disabled={!canWrite} />
            </div>
          </div>
        </Panel>
        <SaveBar dirty={s.dirty} pending={s.pending} onSave={s.save} onReset={s.reset} disabled={!canWrite} />
      </div>

      {/* Pré-visualização em tempo real */}
      <aside className="xl:sticky xl:top-6 xl:self-start">
        <p className="mb-2 text-xs font-medium text-mute">Pré-visualização em tempo real</p>
        {fonts ? <link rel="stylesheet" href={fonts} /> : null}
        <div className="ev-root overflow-hidden rounded-xl shadow-xl ring-1 ring-line" style={{ ...brandVars(v as unknown as BrandingRow), minHeight: 0 }}>
          <div className="relative p-6" style={{ background: "var(--ev-secondary)" }}>
            {v.texture_url ? <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: `url(${v.texture_url})`, opacity: v.texture_opacity, backgroundSize: "300px" }} /> : null}
            <div className="relative flex items-center justify-between">
              {v.logo_url ? <EvImage src={v.logo_url} alt="" width={120} height={36} className="h-7 w-auto object-contain" /> : <span className="ev-display text-base">{event.name}</span>}
              <span className="ev-btn !min-h-7 !px-2.5 !text-[9px]">Patrocinar</span>
            </div>
            <p className="relative mt-10 text-[9px] font-semibold uppercase tracking-[0.2em] opacity-80">{event.edition_number ? `${event.edition_number}ª edição · ` : ""}{event.tagline}</p>
            <p className="ev-display relative mt-3 text-5xl">{event.name}</p>
            <div className="relative mt-5 flex gap-2">
              <span className="ev-btn !min-h-9 !px-3 !text-[9px]">Quero ser patrocinador →</span>
              <span className="ev-btn ev-btn-ghost !min-h-9 !px-3 !text-[9px]">Conheça</span>
            </div>
          </div>
          <div className="p-6" style={{ background: "var(--ev-bg)" }}>
            <p className="ev-eyebrow flex items-center gap-2 !text-[9px]"><span className="text-[var(--ev-accent)]">01</span> O evento em números</p>
            <p className="ev-display mt-3 text-3xl">Uma audiência em escala.</p>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--ev-line)] pt-4">
              <div><p className="ev-num text-5xl">62<span className="text-lg">mil</span></p><p className="mt-1 text-xs">Público presencial</p></div>
              <div><p className="ev-num text-5xl">18<span className="text-lg text-[var(--ev-accent)]">mi</span></p><p className="mt-1 text-xs">Alcance digital</p></div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-[var(--ev-muted)]">Parágrafo de exemplo com a tipografia de texto escolhida para a apresentação comercial.</p>
            <div className="mt-5 rounded-[var(--ev-radius)] bg-[var(--ev-accent)] p-4 text-[var(--ev-on-accent)]">
              <p className="ev-display text-2xl">Master</p>
              <p className="mt-1 text-xs opacity-80">Cota em destaque</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
