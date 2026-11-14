import "server-only";
import type { ComponentProps, ReactNode } from "react";
import {
  Circle, Defs, Document, Image, LinearGradient, Link, Page, Path, Rect, Stop, Svg, Text, View, renderToBuffer,
} from "@react-pdf/renderer";
import type {
  AudienceDatum, AudienceRow, CtaSettings, EventBundle, GrandeurSettings, HeroSettings, MediaRow, MetricRow,
  NextEditionSettings, OpportunityRow, ResultRow, ResultsSettings, SectionRow, SectionType, SponsorRelation, TestimonialRow,
  TierRow, TiersSettings, AudienceSettings,
} from "@/lib/types";
import { compactNumber, editionLabel, eventDateLabel, formatCurrency, formatNumber, growth } from "@/lib/format";
import { OPPORTUNITY_LABEL, RELATION_LABEL, RESULT_CATEGORY_LABEL, SECTION_LABEL } from "@/lib/labels";
import { mix, readableOn } from "@/lib/color";
import { siteUrl } from "@/lib/env";
import { loadDeckFonts, type DeckFonts } from "./fonts";
import { imageKey, loadImages, type ImageRequest, type PdfImage } from "./images";

/* ============================================================================
 * Apresentação comercial em PDF (16:9, 1280×720 pt), com a identidade do evento.
 * ========================================================================== */

const W = 1280;
const H = 720;
const PX = 64; // margem lateral
const PT = 56; // margem superior
const PB = 84; // margem inferior (reserva o rodapé)
const CONTENT_W = W - PX * 2;
const CONTENT_H = H - PT - PB;
const GAP = 16;

type Style = ComponentProps<typeof View>["style"];
function toArr(style: Style): Style[] {
  return (Array.isArray(style) ? [...style] : style ? [style] : []) as Style[];
}

/** <Text> com `maxLines` (no react-pdf v4 é uma propriedade de estilo) + reticências. */
function T({ maxLines, style, children }: { maxLines?: number; style?: Style; children?: ReactNode }) {
  const clamp = maxLines ? ({ maxLines, textOverflow: "ellipsis" } as unknown as Style) : undefined;
  return <Text style={(clamp ? [...toArr(style), clamp] : style) as Style}>{children}</Text>;
}

type Theme = {
  bg: string; fg: string; muted: string; faint: string; line: string; card: string;
  accent: string; onAccent: string; primary: string;
};

type Ctx = {
  fonts: DeckFonts;
  upper: boolean;
  radius: number;
  base: Theme;
  inverse: Theme;
  images: Map<string, PdfImage>;
  eventName: string;
  demo: boolean;
  total: number;
};


/* ---------- utilidades ---------- */

function safeHex(value: string | null | undefined, fallback: string) {
  const v = (value ?? "").trim();
  if (/^#[0-9a-f]{6}$/i.test(v)) return v;
  if (/^#[0-9a-f]{3}$/i.test(v)) return `#${v.slice(1).split("").map((c) => c + c).join("")}`;
  return fallback;
}

function makeTheme(bg: string, fg: string, accent: string, primary: string): Theme {
  return {
    bg, fg, accent, primary,
    muted: mix(bg, fg, 0.7),
    faint: mix(bg, fg, 0.48),
    line: mix(bg, fg, 0.2),
    card: mix(bg, fg, 0.05),
    onAccent: readableOn(accent),
  };
}

const pad2 = (n: number) => String(n).padStart(2, "0");

function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

/** Número editorial: "18,4" + "mi". Mantém 1 casa decimal para valores pequenos não inteiros. */
function numParts(value: number) {
  const c = compactNumber(value);
  if (!c.suffix && !Number.isInteger(value)) return { number: formatNumber(value, 1), suffix: "" };
  return c;
}

function shortValue(value: number, unit?: string | null, prefix?: string | null) {
  const p = numParts(value);
  const u = unit && unit.length <= 2 ? unit : "";
  return `${prefix ? `${prefix} ` : ""}${p.number}${p.suffix ? ` ${p.suffix}` : ""}${u}`;
}

function audienceData(row: AudienceRow): AudienceDatum[] {
  if (!Array.isArray(row.data)) return [];
  return row.data
    .map((d) => {
      const o = (d ?? {}) as Record<string, unknown>;
      return { label: String(o.label ?? ""), value: Number(o.value ?? 0), code: o.code ? String(o.code) : undefined };
    })
    .filter((d) => d.label && Number.isFinite(d.value));
}

function formatPhone(raw: string | null | undefined) {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (raw.trim().startsWith("+") || digits.length < 12) return raw.trim();
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    const ddd = digits.slice(2, 4);
    const rest = digits.slice(4);
    return `+55 ${ddd} ${rest.slice(0, rest.length - 4)}-${rest.slice(-4)}`;
  }
  return raw.trim();
}

function sourceLine(source?: string | null, period?: string | null) {
  return [source, period].filter(Boolean).join(" · ");
}

/* ---------- primitivos visuais ---------- */

function Img({ src, style }: { src: PdfImage | undefined; style: Style }) {
  if (!src) return null;
  // eslint-disable-next-line jsx-a11y/alt-text -- <Image> do react-pdf não tem alt
  return <Image src={{ data: src.data, format: src.format }} style={[{ objectFit: "cover" }, ...(Array.isArray(style) ? style : [style])]} />;
}

function Eyebrow({ c, t, index, label, color }: { c: Ctx; t: Theme; index?: number; label: string; color?: string }) {
  const { fonts } = c;
  return (
    <T style={{ fontFamily: fonts.body, fontWeight: fonts.bodyBold, fontSize: 11.5, letterSpacing: 2.6, textTransform: "uppercase", color: color ?? t.accent }}>
      {index != null ? `${pad2(index)}  —  ` : ""}{label}
    </T>
  );
}

function Heading({ c, t, children, size = 50, style, maxLines }: { c: Ctx; t: Theme; children: ReactNode; size?: number; style?: Style; maxLines?: number }) {
  const { fonts, upper } = c;
  return (
    <T
      maxLines={maxLines}
      style={[
        { fontFamily: fonts.heading, fontWeight: 700, fontSize: size, lineHeight: 1.04, paddingBottom: size * 0.16, color: t.fg, textTransform: upper ? "uppercase" : "none", letterSpacing: upper ? 0.2 : -0.4 },
        ...(Array.isArray(style) ? style : style ? [style] : []),
      ]}
    >
      {children}
    </T>
  );
}

function Body({ c, t, children, size = 15, color, style, maxLines }: { c: Ctx; t: Theme; children: ReactNode; size?: number; color?: string; style?: Style; maxLines?: number }) {
  const { fonts } = c;
  return (
    <T maxLines={maxLines} style={[{ fontFamily: fonts.body, fontSize: size, lineHeight: 1.45, color: color ?? t.muted }, ...(Array.isArray(style) ? style : style ? [style] : [])]}>
      {children}
    </T>
  );
}

function Strong({ c, t, children, size = 15, color, style, maxLines }: { c: Ctx; t: Theme; children: ReactNode; size?: number; color?: string; style?: Style; maxLines?: number }) {
  const { fonts } = c;
  return (
    <T maxLines={maxLines} style={[{ fontFamily: fonts.body, fontWeight: fonts.bodyBold, fontSize: size, lineHeight: 1.3, color: color ?? t.fg }, ...(Array.isArray(style) ? style : style ? [style] : [])]}>
      {children}
    </T>
  );
}

function Small({ c, t, children, color, style, maxLines }: { c: Ctx; t: Theme; children: ReactNode; color?: string; style?: Style; maxLines?: number }) {
  const { fonts } = c;
  return (
    <T maxLines={maxLines} style={[{ fontFamily: fonts.body, fontSize: 9.5, lineHeight: 1.35, letterSpacing: 0.3, color: color ?? t.faint }, ...(Array.isArray(style) ? style : style ? [style] : [])]}>
      {children}
    </T>
  );
}

/** Valor grande: prefixo + número + sufixo (mil/mi) + unidade. */
function BigNumber({ c, t, value, prefix, unit, size, color, unitColor }: { c: Ctx; t: Theme; value: number; prefix?: string | null; unit?: string | null; size: number; color?: string; unitColor?: string }) {
  const { fonts, upper } = c;
  const p = numParts(value);
  const shortUnit = unit && unit.length <= 2 ? unit : null;
  const longUnit = unit && unit.length > 2 ? unit : null;
  const small = { fontSize: size * 0.5, color: unitColor ?? t.accent };
  return (
    <T style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: size, lineHeight: 1.12, color: color ?? t.fg, textTransform: upper ? "uppercase" : "none" }}>
      {prefix ? <T style={{ fontSize: size * 0.5 }}>{`${prefix} `}</T> : null}
      {p.number}
      {p.suffix ? <T style={small}>{` ${p.suffix}`}</T> : null}
      {shortUnit ? <T style={small}>{shortUnit}</T> : null}
      {longUnit ? (
        <T style={{ fontFamily: fonts.body, fontWeight: 400, fontSize: Math.max(11, size * 0.2), color: unitColor ?? t.accent, textTransform: "none" }}>{`  ${longUnit}`}</T>
      ) : null}
    </T>
  );
}

function Footer({ c, t, n, onImage }: { c: Ctx; t: Theme; n: number; onImage?: boolean }) {
  const { fonts, eventName, demo, total } = c;
  const color = onImage ? mix(t.bg, t.fg, 0.75) : t.faint;
  const txt = { fontFamily: fonts.body, fontSize: 9, letterSpacing: 1.4, textTransform: "uppercase" as const, color };
  return (
    <View fixed style={{ position: "absolute", left: PX, right: PX, bottom: 28, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <T style={[txt, { width: 360 }]}>{n > 1 ? `${eventName}  ·  Apresentação comercial` : ""}</T>
      <T style={[txt, { flex: 1, textAlign: "center", letterSpacing: 0.6, textTransform: "none", fontSize: 9.5, color: onImage ? t.fg : t.muted }]}>
        {demo ? "Evento demonstrativo — dados fictícios" : ""}
      </T>
      <T style={[txt, { width: 360, textAlign: "right" }]}>{`${pad2(n)} / ${pad2(total)}`}</T>
    </View>
  );
}

function Slide({ c, t, n, children, padded = true }: { c: Ctx; t: Theme; n: number; children: ReactNode; padded?: boolean }) {
  const { fonts } = c;
  return (
    <Page
      size={[W, H]}
      style={{ backgroundColor: t.bg, color: t.fg, fontFamily: fonts.body, ...(padded ? { paddingTop: PT, paddingBottom: PB, paddingHorizontal: PX } : {}) }}
    >
      {children}
      <Footer c={c} t={t} n={n} onImage={!padded} />
    </Page>
  );
}

/** Cabeçalho de seção: título à esquerda, texto de apoio à direita (como na página pública). */
function SectionHead({ c, t, index, eyebrow, title, body, titleSize = 46, aside }: { c: Ctx; t: Theme; index: number; eyebrow: string; title?: string | null; body?: string | null; titleSize?: number; aside?: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
      <View style={{ width: 700 }}>
        <Eyebrow c={c} t={t} index={index} label={eyebrow} />
        {title ? <Heading c={c} t={t} size={titleSize} style={{ marginTop: 14 }} maxLines={2}>{title}</Heading> : null}
      </View>
      {body || aside ? (
        <View style={{ width: 380, paddingBottom: 4 }}>
          {body ? <Body c={c} t={t} size={13.5} maxLines={5}>{body}</Body> : null}
          {aside}
        </View>
      ) : null}
    </View>
  );
}

/** Véu sobre fotos: cor do fundo do evento com degradê mais denso embaixo. */
function Veil({ color, top, bottom }: { color: string; top: number; bottom: number }) {
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0 }}>
      <Defs>
        <LinearGradient id="veil" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={top} />
          <Stop offset="0.45" stopColor={color} stopOpacity={(top + bottom) / 2.4} />
          <Stop offset="1" stopColor={color} stopOpacity={bottom} />
        </LinearGradient>
        <LinearGradient id="side" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={color} stopOpacity={0.55} />
          <Stop offset="0.6" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={W} height={H} fill="url(#veil)" />
      <Rect x={0} y={0} width={W} height={H} fill="url(#side)" />
    </Svg>
  );
}

/* ============================================================================
 * Páginas
 * ========================================================================== */

type PageProps = { c: Ctx; n: number; t: Theme };

function CoverPage({ c, n, bundle, image }: PageProps & { bundle: EventBundle; image?: PdfImage }) {
  const { base, fonts, upper } = c;
  const { event } = bundle;
  const t = base;
  const hero = bundle.sections.find((s) => s.type === "hero");
  const overlay = Math.min(Math.max(Number((hero?.settings as HeroSettings | undefined)?.overlay ?? 0.35), 0.2), 0.8);
  const date = eventDateLabel(event.starts_on, event.ends_on, event.date_label);
  const place = [event.venue, [event.city, event.state].filter(Boolean).join("/")].filter(Boolean).join(" · ");
  const edition = editionLabel(event.edition_number, event.edition_label);
  const name = event.name;
  const size = name.length <= 10 ? 168 : name.length <= 16 ? 140 : name.length <= 24 ? 112 : name.length <= 36 ? 84 : 64;
  const meta = [
    { k: "Data", v: date },
    { k: "Local", v: place },
    { k: "Edição", v: edition },
  ].filter((m) => m.v);

  return (
    <Slide c={c} t={t} n={n} padded={false}>
      {image ? <Img src={image} style={{ position: "absolute", left: 0, top: 0, width: W, height: H }} /> : null}
      {image ? <Veil color={t.bg} top={overlay} bottom={Math.min(overlay + 0.55, 0.96)} /> : null}

      <View style={{ position: "absolute", left: PX, right: PX, top: 48, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 10, height: 10, backgroundColor: t.accent, marginRight: 12 }} />
          <T style={{ fontFamily: fonts.body, fontWeight: fonts.bodyBold, fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: t.fg }}>Apresentação comercial</T>
        </View>
        <T style={{ fontFamily: fonts.body, fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: t.fg }}>
          {[edition, event.starts_on ? event.starts_on.slice(0, 4) : null].filter(Boolean).join("  ·  ")}
        </T>
      </View>

      <View style={{ position: "absolute", left: PX, right: PX, bottom: 84 }}>
        {event.tagline ? (
          <T style={{ fontFamily: fonts.body, fontWeight: fonts.bodyBold, fontSize: 14, letterSpacing: 3.2, textTransform: "uppercase", color: t.accent, marginBottom: 14 }}>{event.tagline}</T>
        ) : null}
        <T style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: size, lineHeight: 1.08, color: t.fg, textTransform: upper ? "uppercase" : "none", maxWidth: 1080, marginTop: -size * 0.06, paddingBottom: size * 0.12 }}>
          {name}
        </T>
        {event.short_description ? (
          <T style={{ fontFamily: fonts.body, fontSize: 17, lineHeight: 1.45, color: mix(t.bg, t.fg, 0.86), marginTop: 26, maxWidth: 720 }} maxLines={3}>
            {event.short_description}
          </T>
        ) : null}
        {meta.length ? (
          <View style={{ flexDirection: "row", marginTop: 34, borderTopWidth: 1, borderTopColor: mix(t.bg, t.fg, 0.35), paddingTop: 16 }}>
            {meta.map((m) => (
              <View key={m.k} style={{ marginRight: 56, maxWidth: 420 }}>
                <T style={{ fontFamily: fonts.body, fontSize: 10, letterSpacing: 2.2, textTransform: "uppercase", color: mix(t.bg, t.fg, 0.7) }}>{m.k}</T>
                <T style={{ fontFamily: fonts.body, fontWeight: fonts.bodyBold, fontSize: 16, color: t.fg, marginTop: 6 }}>{m.v}</T>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Slide>
  );
}

function AboutPage({ c, n, t, index, bundle, section, photos }: PageProps & { index: number; bundle: EventBundle; section?: SectionRow; photos: PdfImage[] }) {
  const { radius } = c;
  const { event } = bundle;
  const g = (section?.settings ?? {}) as GrandeurSettings;
  const title = section?.title || event.name;
  const lead = event.short_description;
  const desc = event.description && event.description !== lead ? event.description : section?.body ?? null;
  const textW = photos.length ? 520 : CONTENT_W;
  const photoW = CONTENT_W - textW - 40;
  const bigH = 340;
  return (
    <Slide c={c} t={t} n={n}>
      <View style={{ flexDirection: "row", flex: 1 }}>
        <View style={{ width: textW, justifyContent: "space-between", paddingRight: photos.length ? 24 : 0 }}>
          <View>
            <Eyebrow c={c} t={t} index={index} label="O evento" />
            <Heading c={c} t={t} size={photos.length ? 44 : 56} style={{ marginTop: 16 }} maxLines={4}>{title}</Heading>
            {lead ? <Body c={c} t={t} size={17} color={t.fg} style={{ marginTop: 22 }} maxLines={5}>{lead}</Body> : null}
            {desc ? <Body c={c} t={t} size={13.5} style={{ marginTop: 14 }} maxLines={7}>{desc}</Body> : null}
          </View>
          <View>
            {g.statement ? (
              <View style={{ borderLeftWidth: 3, borderLeftColor: t.accent, paddingLeft: 16, marginTop: 18 }}>
                <Strong c={c} t={t} size={14} style={{ lineHeight: 1.45 }} maxLines={4}>{g.statement}</Strong>
              </View>
            ) : null}
            {event.organizer_name ? (
              <Small c={c} t={t} style={{ marginTop: 18, letterSpacing: 1.2, textTransform: "uppercase" }}>Realização: {event.organizer_name}</Small>
            ) : null}
          </View>
        </View>
        {photos.length ? (
          <View style={{ width: photoW, marginLeft: 40 }}>
            <Img src={photos[0]} style={{ width: photoW, height: photos.length > 1 ? bigH : CONTENT_H, borderRadius: radius }} />
            {photos.length > 1 ? (
              <View style={{ flexDirection: "row", marginTop: GAP }}>
                {photos.slice(1, 3).map((p, i, arr) => (
                  <Img key={i} src={p} style={{ width: arr.length > 1 ? (photoW - GAP) / 2 : photoW, height: CONTENT_H - bigH - GAP, marginLeft: i ? GAP : 0, borderRadius: radius }} />
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </Slide>
  );
}

function MetricCell({ c, t, m }: { c: Ctx; t: Theme; m: MetricRow }) {
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: t.line, paddingTop: 14, paddingRight: 20, flex: 1 }}>
      <BigNumber c={c} t={t} value={Number(m.value)} prefix={m.prefix} unit={m.unit} size={52} />
      <View style={{ marginTop: 8 }}>
        <Strong c={c} t={t} size={14.5} maxLines={2}>{m.label}</Strong>
        {m.description ? <Body c={c} t={t} size={11.5} style={{ marginTop: 3, lineHeight: 1.35 }} maxLines={2}>{m.description}</Body> : null}
        {sourceLine(m.source, m.period) ? <Small c={c} t={t} style={{ marginTop: 6 }} maxLines={2}>{sourceLine(m.source, m.period)}</Small> : null}
      </View>
    </View>
  );
}

function MetricsPage({ c, n, t, index, section, featured, rest }: PageProps & { index: number; section?: SectionRow; featured?: MetricRow; rest: MetricRow[] }) {
  const { radius } = c;
  const rows = chunk(rest, 3);
  return (
    <Slide c={c} t={t} n={n}>
      <SectionHead c={c} t={t} index={index} eyebrow={section?.eyebrow || SECTION_LABEL.metrics} title={section?.title} body={section?.body} titleSize={44} />
      <View style={{ flexDirection: "row", flex: 1 }}>
        {featured ? (
          <View style={{ width: 380, backgroundColor: t.accent, padding: 28, justifyContent: "space-between", borderRadius: radius, marginRight: rest.length ? 36 : 0 }}>
            <T style={{ fontSize: 10, letterSpacing: 2.4, textTransform: "uppercase", color: t.onAccent }}>Destaque</T>
            <View>
              <BigNumber c={c} t={t} value={Number(featured.value)} prefix={featured.prefix} unit={featured.unit} size={96} color={t.onAccent} unitColor={t.onAccent} />
              <Strong c={c} t={t} size={20} color={t.onAccent} style={{ marginTop: 8 }}>{featured.label}</Strong>
              {featured.description ? <Body c={c} t={t} size={13} color={t.onAccent} style={{ marginTop: 6, opacity: 0.85 }} maxLines={3}>{featured.description}</Body> : null}
              {sourceLine(featured.source, featured.period) ? (
                <Small c={c} t={t} color={t.onAccent} style={{ marginTop: 12, opacity: 0.75 }}>{sourceLine(featured.source, featured.period)}</Small>
              ) : null}
            </View>
          </View>
        ) : null}
        {rows.length ? (
          <View style={{ flex: 1 }}>
            {rows.map((row, ri) => (
              <View key={ri} style={{ flexDirection: "row", flex: 1, marginTop: ri ? 20 : 0 }}>
                {row.map((m) => <MetricCell c={c} key={m.id} t={t} m={m} />)}
                {Array.from({ length: 3 - row.length }).map((_, i) => <View key={`e${i}`} style={{ flex: 1 }} />)}
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Slide>
  );
}

/* ---------- Público ---------- */

function BarList({ c, t, data, unit, limit }: { c: Ctx; t: Theme; data: AudienceDatum[]; unit: string; limit: number }) {
  const { fonts } = c;
  const sorted = data.length > limit ? [...data].sort((a, b) => b.value - a.value) : data;
  const shown = sorted.slice(0, limit);
  const hidden = sorted.slice(limit);
  const max = Math.max(...shown.map((d) => d.value), 1);
  const top = Math.max(...shown.map((d) => d.value));
  return (
    <View>
      {shown.map((d, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", marginTop: i ? 7 : 0 }}>
          <T style={{ fontFamily: fonts.body, fontSize: 11, color: t.fg, width: 92 }} maxLines={1}>{d.label}</T>
          <View style={{ flex: 1, height: 9, backgroundColor: t.line }}>
            <View style={{ width: `${Math.max((d.value / max) * 100, 2)}%`, height: 9, backgroundColor: d.value === top ? t.accent : t.fg }} />
          </View>
          <T style={{ fontFamily: fonts.body, fontWeight: fonts.bodyBold, fontSize: 11, color: t.fg, width: 46, textAlign: "right" }}>{`${formatNumber(d.value, 1)}${unit}`}</T>
        </View>
      ))}
      {hidden.length ? (
        <Small c={c} t={t} style={{ marginTop: 8 }}>
          {`+ ${hidden.length} ${hidden.length === 1 ? "outro" : "outros"} (${formatNumber(hidden.reduce((s, d) => s + d.value, 0), 1)}${unit})`}
        </Small>
      ) : null}
    </View>
  );
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p = (a: number) => [cx + r * Math.cos(a - Math.PI / 2), cy + r * Math.sin(a - Math.PI / 2)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

function Donut({ c, t, data, unit }: { c: Ctx; t: Theme; data: AudienceDatum[]; unit: string }) {
  const { fonts } = c;
  const palette = [t.accent, t.fg, t.primary, t.faint, mix(t.accent, t.bg, 0.5), t.muted];
  const total = data.reduce((s, d) => s + Math.max(d.value, 0), 0) || 1;
  const size = 116;
  const r = 46;
  const sw = 16;
  const gap = data.length > 1 ? 0.03 : 0;
  // Ângulos acumulados calculados fora da renderização.
  const bounds = data.reduce<number[]>((acc, d) => [...acc, acc[acc.length - 1] + Math.max(d.value, 0)], [0]);
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={t.line} strokeWidth={sw} fill="none" />
        {data.map((d, i) => {
          const a0 = (bounds[i] / total) * Math.PI * 2;
          const a1 = (bounds[i + 1] / total) * Math.PI * 2;
          if (a1 - a0 <= gap) return null;
          if (a1 - a0 >= Math.PI * 2 - 0.001) return <Circle key={i} cx={size / 2} cy={size / 2} r={r} stroke={palette[i % palette.length]} strokeWidth={sw} fill="none" />;
          return <Path key={i} d={arc(size / 2, size / 2, r, a0 + gap / 2, a1 - gap / 2)} stroke={palette[i % palette.length]} strokeWidth={sw} fill="none" />;
        })}
      </Svg>
      <View style={{ flex: 1, marginLeft: 18 }}>
        {data.slice(0, 6).map((d, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", marginTop: i ? 8 : 0 }}>
            <View style={{ width: 9, height: 9, backgroundColor: palette[i % palette.length], marginRight: 8 }} />
            <T style={{ fontFamily: fonts.body, fontSize: 11, color: t.fg, flex: 1 }} maxLines={2}>{d.label}</T>
            <T style={{ fontFamily: fonts.body, fontWeight: fonts.bodyBold, fontSize: 11, color: t.fg, marginLeft: 6 }}>{`${formatNumber(d.value, 1)}${unit}`}</T>
          </View>
        ))}
      </View>
    </View>
  );
}

function Stats({ c, t, data, unit }: { c: Ctx; t: Theme; data: AudienceDatum[]; unit: string }) {
  const { fonts, upper } = c;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {data.slice(0, 4).map((d, i) => (
        <View key={i} style={{ width: "50%", paddingRight: 10, marginTop: i > 1 ? 12 : 0 }}>
          <T style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 34, lineHeight: 1.15, color: i === 0 ? t.accent : t.fg, textTransform: upper ? "uppercase" : "none" }}>
            {formatNumber(d.value, 1)}<T style={{ fontSize: 18 }}>{unit}</T>
          </T>
          <T style={{ fontFamily: fonts.body, fontSize: 10.5, color: t.muted, marginTop: 5 }} maxLines={2}>{d.label}</T>
        </View>
      ))}
    </View>
  );
}

function AudienceCard({ c, t, row, compact }: { c: Ctx; t: Theme; row: AudienceRow; compact: boolean }) {
  const { radius } = c;
  const data = audienceData(row);
  const unit = row.unit && row.unit.length <= 2 ? row.unit : "";
  const note = [row.note, sourceLine(row.source, row.period)].filter(Boolean).join(" — ");
  return (
    <View style={{ flex: 1, borderWidth: 1, borderColor: t.line, borderRadius: radius, padding: 18, justifyContent: "space-between", backgroundColor: t.card }}>
      <View>
        <Strong c={c} t={t} size={14} style={{ marginBottom: 14 }} maxLines={1}>{row.title}</Strong>
        {row.chart_type === "donut" ? <Donut c={c} t={t} data={data} unit={unit} />
          : row.chart_type === "stat" ? <Stats c={c} t={t} data={data} unit={unit} />
          : <BarList c={c} t={t} data={data} unit={unit} limit={compact ? 5 : 8} />}
      </View>
      {note ? <Small c={c} t={t} style={{ marginTop: 10 }} maxLines={2}>{note}</Small> : null}
    </View>
  );
}

function AudiencePage({ c, n, t, index, section, rows, statement }: PageProps & { index: number; section?: SectionRow; rows: AudienceRow[]; statement?: string | null }) {
  const { fonts, radius } = c;
  type Cell = { kind: "row"; row: AudienceRow } | { kind: "statement"; text: string };
  const cells: Cell[] = rows.map((row) => ({ kind: "row", row }));
  if (statement) cells.push({ kind: "statement", text: statement });
  const lines = cells.length <= 3 ? [cells] : chunk(cells, 3);
  const compact = lines.length > 1;
  return (
    <Slide c={c} t={t} n={n}>
      <SectionHead c={c} t={t} index={index} eyebrow={section?.eyebrow || SECTION_LABEL.audience} title={section?.title} body={section?.body} titleSize={40} />
      <View style={{ flex: 1 }}>
        {lines.map((line, li) => (
          <View key={li} style={{ flexDirection: "row", flex: 1, marginTop: li ? GAP : 0 }}>
            {line.map((cell, ci) => (
              <View key={ci} style={{ flex: 1, marginLeft: ci ? GAP : 0 }}>
                {cell.kind === "row" ? (
                  <AudienceCard c={c} t={t} row={cell.row} compact={compact} />
                ) : (
                  <View style={{ flex: 1, backgroundColor: t.accent, borderRadius: radius, padding: 22, justifyContent: "space-between" }}>
                    <T style={{ fontFamily: fonts.body, fontSize: 30, lineHeight: 1, color: t.onAccent }}>“</T>
                    <T style={{ fontFamily: fonts.body, fontWeight: fonts.bodyBold, fontSize: 17, lineHeight: 1.35, color: t.onAccent }}>{cell.text}</T>
                  </View>
                )}
              </View>
            ))}
            {Array.from({ length: 3 - line.length }).map((_, i) => <View key={`e${i}`} style={{ flex: 1, marginLeft: GAP }} />)}
          </View>
        ))}
      </View>
    </Slide>
  );
}

/* ---------- Resultados ---------- */

function ResultsPage({ c, n, t, index, section, results, quote }: PageProps & { index: number; section?: SectionRow; results: ResultRow[]; quote?: TestimonialRow }) {
  const { fonts, radius } = c;
  const s = (section?.settings ?? {}) as ResultsSettings;
  const compare = s.show_comparison !== false && results.some((r) => r.previous_value != null);
  const cur = s.edition_label || "Última edição";
  const prev = s.previous_edition_label || "Edição anterior";
  return (
    <Slide c={c} t={t} n={n}>
      <View style={{ flexDirection: "row", flex: 1 }}>
        <View style={{ width: 340, marginRight: 48, justifyContent: "space-between" }}>
          <View>
            <Eyebrow c={c} t={t} index={index} label={section?.eyebrow || SECTION_LABEL.results} />
            {section?.title ? <Heading c={c} t={t} size={40} style={{ marginTop: 14 }} maxLines={4}>{section.title}</Heading> : null}
            {section?.body ? <Body c={c} t={t} size={13} style={{ marginTop: 14 }} maxLines={5}>{section.body}</Body> : null}
            {compare ? (
              <View style={{ marginTop: 22 }}>
                {[{ c: t.accent, l: cur }, { c: t.faint, l: prev }].map((x) => (
                  <View key={x.l} style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                    <View style={{ width: 18, height: 6, backgroundColor: x.c, marginRight: 10 }} />
                    <T style={{ fontFamily: fonts.body, fontSize: 11, color: t.muted }}>{x.l}</T>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
          {quote ? (
            <View style={{ backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: radius, padding: 18 }}>
              <Body c={c} t={t} size={12.5} color={t.fg} maxLines={5}>{`“${quote.quote}”`}</Body>
              <Small c={c} t={t} style={{ marginTop: 10 }}>{[quote.author, quote.role, quote.company].filter(Boolean).join(" · ")}</Small>
            </View>
          ) : null}
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", paddingBottom: 8 }}>
            <Small c={c} t={t} style={{ flex: 1, textTransform: "uppercase", letterSpacing: 1.6 }}>Indicador</Small>
            <Small c={c} t={t} style={{ width: 190, textTransform: "uppercase", letterSpacing: 1.6 }}>{cur}</Small>
            {compare ? <Small c={c} t={t} style={{ width: 170, textTransform: "uppercase", letterSpacing: 1.6 }}>{`vs. ${prev}`}</Small> : null}
            {compare ? <Small c={c} t={t} style={{ width: 84, textAlign: "right", textTransform: "uppercase", letterSpacing: 1.6 }}>Cresc.</Small> : null}
          </View>
          {results.map((r) => {
            const g = compare ? growth(Number(r.value), r.previous_value) : null;
            const max = Math.max(Number(r.value), Number(r.previous_value ?? 0), 1);
            return (
              <View key={r.id} style={{ flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: t.line, flex: 1, maxHeight: 96 }}>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Small c={c} t={t} color={t.accent} style={{ textTransform: "uppercase", letterSpacing: 1.6 }}>{RESULT_CATEGORY_LABEL[r.category] ?? r.category}</Small>
                  <Strong c={c} t={t} size={15} style={{ marginTop: 3 }} maxLines={2}>{r.label}</Strong>
                  {r.description ? <Small c={c} t={t} style={{ marginTop: 2 }} maxLines={1}>{r.description}</Small> : null}
                </View>
                <View style={{ width: 190 }}>
                  <BigNumber c={c} t={t} value={Number(r.value)} prefix={r.prefix} unit={r.unit} size={38} />
                </View>
                {compare ? (
                  <View style={{ width: 170, paddingRight: 18 }}>
                    {r.previous_value != null ? (
                      <>
                        <View style={{ height: 6, backgroundColor: t.accent, width: `${(Number(r.value) / max) * 100}%` }} />
                        <View style={{ height: 6, backgroundColor: t.faint, width: `${(Number(r.previous_value) / max) * 100}%`, marginTop: 4 }} />
                        <Small c={c} t={t} style={{ marginTop: 6 }}>{`Antes: ${shortValue(Number(r.previous_value), r.unit, r.prefix)}`}</Small>
                      </>
                    ) : <Small c={c} t={t}>—</Small>}
                  </View>
                ) : null}
                {compare ? (
                  <View style={{ width: 84, alignItems: "flex-end" }}>
                    {g != null ? (
                      <T style={{ fontFamily: fonts.body, fontWeight: fonts.bodyBold, fontSize: 18, color: g >= 0 ? t.accent : t.muted }}>
                        {`${g >= 0 ? "+" : "−"}${formatNumber(Math.abs(g), Math.abs(g) < 10 ? 1 : 0)}%`}
                      </T>
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          })}
          <View style={{ borderTopWidth: 1, borderTopColor: t.line }} />
          {results[0] && sourceLine(results[0].source, null) ? <Small c={c} t={t} style={{ marginTop: 8 }}>{`Fonte: ${results[0].source}`}</Small> : null}
        </View>
      </View>
    </Slide>
  );
}

/* ---------- Oportunidades ---------- */

function OpportunityCard({ c, t, o, i, image }: { c: Ctx; t: Theme; o: OpportunityRow; i: number; image?: PdfImage }) {
  const { fonts, radius } = c;
  const label = OPPORTUNITY_LABEL[o.category] ?? o.category;
  // Evita repetir o título quando a categoria tem o mesmo nome (ex.: "Mídia digital").
  const category = label.toLowerCase() === o.title.toLowerCase() ? "Formato" : label;
  return (
    <View style={{ flex: 1, flexDirection: "row", borderWidth: 1, borderColor: t.line, borderRadius: radius, backgroundColor: t.card, overflow: "hidden" }}>
      {image ? <Img src={image} style={{ width: 180, height: "100%" }} /> : null}
      <View style={{ flex: 1, padding: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Small c={c} t={t} color={t.accent} style={{ textTransform: "uppercase", letterSpacing: 1.8, fontFamily: fonts.body }}>{category}</Small>
          <Small c={c} t={t}>{pad2(i + 1)}</Small>
        </View>
        <Heading c={c} t={t} size={22} style={{ marginTop: 6 }} maxLines={2}>{o.title}</Heading>
        {o.description ? <Body c={c} t={t} size={11.5} style={{ marginTop: 6, lineHeight: 1.4 }} maxLines={3}>{o.description}</Body> : null}
        {o.deliverables.length ? (
          <View style={{ marginTop: 10 }}>
            {o.deliverables.slice(0, 4).map((d, k) => (
              <View key={k} style={{ flexDirection: "row", marginTop: k ? 3 : 0 }}>
                <View style={{ width: 5, height: 5, backgroundColor: t.accent, marginTop: 4.5, marginRight: 8 }} />
                <T style={{ fontFamily: fonts.body, fontSize: 11, lineHeight: 1.3, color: t.fg, flex: 1 }} maxLines={1}>{d}</T>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function OpportunitiesPage({ c, n, t, index, section, items, offset, page, pages }: PageProps & { index: number; section?: SectionRow; items: OpportunityRow[]; offset: number; page: number; pages: number }) {
  const { images } = c;
  const rows = chunk(items, 2);
  return (
    <Slide c={c} t={t} n={n}>
      <SectionHead c={c}
        t={t}
        index={index}
        eyebrow={`${section?.eyebrow || SECTION_LABEL.opportunities}${pages > 1 ? `  ·  ${page}/${pages}` : ""}`}
        title={section?.title}
        body={page === 1 ? section?.body : "Contrapartidas listadas são ponto de partida: cada formato pode ser combinado e ajustado em proposta."}
        titleSize={40}
      />
      <View style={{ flex: 1 }}>
        {rows.map((row, ri) => (
          <View key={ri} style={{ flexDirection: "row", flex: 1, marginTop: ri ? GAP : 0, maxHeight: rows.length === 1 ? 260 : undefined }}>
            {row.map((o, ci) => (
              <View key={o.id} style={{ flex: 1, marginLeft: ci ? GAP : 0 }}>
                <OpportunityCard c={c} t={t} o={o} i={offset + ri * 2 + ci} image={o.image_url ? images.get(imageKey(o.image_url, "photo", 700)) : undefined} />
              </View>
            ))}
            {row.length === 1 ? <View style={{ flex: 1, marginLeft: GAP }} /> : null}
          </View>
        ))}
      </View>
    </Slide>
  );
}

/* ---------- Cotas ---------- */

function TierCard({ c, t, tier, i }: { c: Ctx; t: Theme; tier: TierRow; i: number }) {
  const { fonts, radius } = c;
  const hl = tier.highlight;
  const fg = hl ? t.onAccent : t.fg;
  const muted = hl ? mix(t.accent, t.onAccent, 0.78) : t.muted;
  const line = hl ? mix(t.accent, t.onAccent, 0.3) : t.line;
  const left = tier.quantity_total == null ? null : Math.max(tier.quantity_total - tier.quantity_sold, 0);
  const soldOut = left === 0;
  const label = { fontFamily: fonts.body, fontWeight: fonts.bodyBold, fontSize: 9.5, letterSpacing: 1.8, textTransform: "uppercase" as const, color: muted };
  const bullet = (d: string, k: number) => (
    <View key={k} style={{ flexDirection: "row", marginTop: k ? 4 : 0 }}>
      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: hl ? fg : t.accent, marginTop: 5, marginRight: 8 }} />
      <T style={{ fontFamily: fonts.body, fontSize: 11, lineHeight: 1.3, color: fg, flex: 1 }}>{d}</T>
    </View>
  );
  return (
    <View style={{ flex: 1, padding: 22, borderRadius: radius, backgroundColor: hl ? t.accent : t.card, borderWidth: hl ? 0 : 1, borderColor: t.line, opacity: soldOut ? 0.6 : 1 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <T style={label}>{`Cota ${pad2(i + 1)}`}</T>
        {hl ? <T style={[label, { color: fg, borderWidth: 1, borderColor: fg, paddingHorizontal: 6, paddingVertical: 2 }]}>Destaque</T> : null}
      </View>
      <Heading c={c} t={t} size={34} style={{ marginTop: 8, color: fg }} maxLines={1}>{tier.name}</Heading>
      {tier.tagline ? <T style={{ fontFamily: fonts.body, fontSize: 11.5, lineHeight: 1.35, color: muted, marginTop: 4 }} maxLines={2}>{tier.tagline}</T> : null}

      <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: line, paddingVertical: 10, marginTop: 12 }}>
        <T style={label}>Investimento</T>
        {tier.show_price && tier.price != null ? (
          <T style={{ fontFamily: fonts.body, fontWeight: fonts.bodyBold, fontSize: 22, color: fg, marginTop: 3 }}>{formatCurrency(Number(tier.price), tier.currency || "BRL")}</T>
        ) : (
          <T style={{ fontFamily: fonts.body, fontWeight: fonts.bodyBold, fontSize: 18, color: fg, marginTop: 5 }}>Sob consulta</T>
        )}
        {tier.quantity_total != null ? (
          <View style={{ marginTop: 8 }}>
            <T style={{ fontFamily: fonts.body, fontSize: 10, color: muted }}>
              {soldOut ? "Esgotada" : `${left} de ${tier.quantity_total} disponíveis`}
            </T>
            <View style={{ flexDirection: "row", marginTop: 4 }}>
              {Array.from({ length: Math.min(tier.quantity_total, 20) }).map((_, k) => (
                <View key={k} style={{ flex: 1, height: 4, marginLeft: k ? 2 : 0, backgroundColor: k < tier.quantity_sold ? line : fg }} />
              ))}
            </View>
          </View>
        ) : null}
      </View>

      {tier.deliverables.length ? (
        <View style={{ marginTop: 12 }}>
          <T style={[label, { marginBottom: 6 }]}>Contrapartidas</T>
          {tier.deliverables.slice(0, 7).map(bullet)}
        </View>
      ) : null}
      {tier.benefits.length ? (
        <View style={{ marginTop: 12 }}>
          <T style={[label, { marginBottom: 6 }]}>Benefícios</T>
          {tier.benefits.slice(0, 5).map(bullet)}
        </View>
      ) : null}
    </View>
  );
}

function TiersPage({ c, n, t, index, section, tiers, offset }: PageProps & { index: number; section?: SectionRow; tiers: TierRow[]; offset: number }) {
  const s = (section?.settings ?? {}) as TiersSettings;
  return (
    <Slide c={c} t={t} n={n}>
      <SectionHead c={c}
        t={t}
        index={index}
        eyebrow={section?.eyebrow || SECTION_LABEL.tiers}
        title={section?.title}
        body={section?.body}
        titleSize={36}
        aside={s.note ? <Small c={c} t={t} style={{ marginTop: 8 }} maxLines={3}>{s.note}</Small> : null}
      />
      <View style={{ flexDirection: "row", flex: 1 }}>
        {tiers.map((tier, i) => (
          <View key={tier.id} style={{ flex: 1, marginLeft: i ? GAP : 0 }}>
            <TierCard c={c} t={t} tier={tier} i={offset + i} />
          </View>
        ))}
        {tiers.length < 3 ? Array.from({ length: 3 - tiers.length }).map((_, i) => <View key={`e${i}`} style={{ flex: 1, marginLeft: GAP }} />) : null}
      </View>
    </Slide>
  );
}

/* ---------- Patrocinadores ---------- */

const RELATION_ORDER: SponsorRelation[] = ["current", "past", "institutional", "supporter", "media"];
type SponsorGroup = { rel: SponsorRelation; items: EventBundle["sponsors"] };
const LOGOS_PER_ROW = 5;

function SponsorsPage({ c, n, t, index, section, groups, page, pages }: PageProps & { index: number; section?: SectionRow; groups: SponsorGroup[]; page: number; pages: number }) {
  const { images, fonts, radius, inverse, base } = c;
  // Logos costumam ser escuros: o "azulejo" usa sempre a cor clara do par de temas.
  const light = readableOn(base.bg) === "#FFFFFF" ? base.fg : base.bg;
  const tileBg = mix(light, "#FFFFFF", 0.65);
  const tileBorder = mix(tileBg, inverse.fg === tileBg ? inverse.bg : inverse.fg, 0.12);
  return (
    <Slide c={c} t={t} n={n}>
      <SectionHead c={c}
        t={t}
        index={index}
        eyebrow={`${section?.eyebrow || SECTION_LABEL.sponsors}${pages > 1 ? `  ·  ${page}/${pages}` : ""}`}
        title={section?.title}
        body={section?.body}
        titleSize={40}
      />
      <View style={{ flex: 1 }}>
        {groups.map((g, gi) => (
          <View key={g.rel} style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: t.line, paddingTop: 10, marginTop: gi ? 10 : 0 }}>
            <View style={{ width: 210, paddingRight: 20 }}>
              <Strong c={c} t={t} size={13}>{RELATION_LABEL[g.rel]}</Strong>
              <Small c={c} t={t} style={{ marginTop: 3 }}>{`${g.items.length} ${g.items.length === 1 ? "marca" : "marcas"}`}</Small>
            </View>
            <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap" }}>
              {g.items.map((s, i) => {
                const logo = s.sponsor.logo_url ? images.get(imageKey(s.sponsor.logo_url, "logo")) : undefined;
                return (
                  <View key={s.id} style={{ width: `${100 / LOGOS_PER_ROW}%`, paddingRight: 10, marginTop: i >= LOGOS_PER_ROW ? 10 : 0 }}>
                    <View style={{ height: 56, backgroundColor: tileBg, borderWidth: 1, borderColor: tileBorder, borderRadius: radius, alignItems: "center", justifyContent: "center", padding: 12 }}>
                      {logo ? (
                        <Img src={logo} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      ) : (
                        <T style={{ fontFamily: fonts.body, fontWeight: fonts.bodyBold, fontSize: 11, color: readableOn(tileBg), textAlign: "center" }} maxLines={2}>{s.sponsor.name}</T>
                      )}
                    </View>
                    <Small c={c} t={t} style={{ marginTop: 4 }} maxLines={1}>{s.sponsor.name}</Small>
                    {s.tier_label ? <Small c={c} t={t} color={t.accent} style={{ textTransform: "uppercase", letterSpacing: 1.2 }} maxLines={1}>{`Cota ${s.tier_label}`}</Small> : null}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </Slide>
  );
}

/* ---------- Próxima edição ---------- */

function ProjectionCard({ c, t, m }: { c: Ctx; t: Theme; m: MetricRow }) {
  const { fonts, radius } = c;
  return (
    <View style={{ flex: 1, borderWidth: 1.2, borderStyle: "dashed", borderColor: t.faint, borderRadius: radius, padding: 16, justifyContent: "space-between" }}>
      <T style={{ fontFamily: fonts.body, fontWeight: fonts.bodyBold, fontSize: 8.5, letterSpacing: 2, textTransform: "uppercase", color: t.accent }}>Projeção</T>
      <View style={{ flex: 1, marginTop: 10 }}>
        <BigNumber c={c} t={t} value={Number(m.value)} prefix={m.prefix} unit={m.unit} size={46} color={t.muted} unitColor={t.faint} />
        <Strong c={c} t={t} size={13.5} style={{ marginTop: 4 }} maxLines={2}>{m.label}</Strong>
        {m.description ? <Small c={c} t={t} style={{ marginTop: 3 }} color={t.muted} maxLines={2}>{m.description}</Small> : null}
      </View>
      {sourceLine(m.source, m.period) ? <Small c={c} t={t} maxLines={2}>{sourceLine(m.source, m.period)}</Small> : null}
    </View>
  );
}

function NextEditionPage({ c, n, t, index, section, projections, items }: PageProps & { index: number; section?: SectionRow; projections: MetricRow[]; items: { title: string; description?: string; image?: PdfImage }[] }) {
  const { fonts, radius } = c;
  const s = (section?.settings ?? {}) as NextEditionSettings;
  const proj = projections.slice(0, 4);
  const projRows = chunk(proj, 2);
  const its = items.slice(0, 3);
  return (
    <Slide c={c} t={t} n={n}>
      <SectionHead c={c}
        t={t}
        index={index}
        eyebrow={section?.eyebrow || SECTION_LABEL.next_edition}
        title={section?.title}
        body={section?.body}
        titleSize={40}
        aside={s.date_label ? (
          <View style={{ flexDirection: "row", marginTop: 12 }}>
            <T style={{ fontFamily: fonts.body, fontWeight: fonts.bodyBold, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: t.onAccent, backgroundColor: t.accent, paddingHorizontal: 10, paddingVertical: 5 }}>{s.date_label}</T>
          </View>
        ) : null}
      />
      <View style={{ flexDirection: "row", flex: 1 }}>
        {proj.length ? (
          <View style={{ width: its.length ? 540 : CONTENT_W, marginRight: its.length ? 40 : 0 }}>
            <Small c={c} t={t} style={{ textTransform: "uppercase", letterSpacing: 1.6, marginBottom: 10 }}>Projeções da organização — não são resultados apurados</Small>
            <View style={{ flex: 1, flexDirection: its.length ? "column" : "row" }}>
              {its.length
                ? projRows.map((row, ri) => (
                    <View key={ri} style={{ flexDirection: "row", flex: 1, marginTop: ri ? GAP : 0 }}>
                      {row.map((m, ci) => <View key={m.id} style={{ flex: 1, marginLeft: ci ? GAP : 0 }}><ProjectionCard c={c} t={t} m={m} /></View>)}
                      {row.length === 1 ? <View style={{ flex: 1, marginLeft: GAP }} /> : null}
                    </View>
                  ))
                : proj.map((m, i) => <View key={m.id} style={{ flex: 1, marginLeft: i ? GAP : 0, maxHeight: 220 }}><ProjectionCard c={c} t={t} m={m} /></View>)}
            </View>
          </View>
        ) : null}
        {its.length ? (
          <View style={{ flex: 1, flexDirection: proj.length ? "column" : "row" }}>
            {its.map((it, i) => (
              <View
                key={i}
                style={proj.length
                  ? { flexDirection: "row", flex: 1, borderTopWidth: 1, borderTopColor: t.line, paddingTop: 14, marginTop: i ? 12 : 0 }
                  : { flex: 1, marginLeft: i ? GAP : 0 }}
              >
                {it.image ? <Img src={it.image} style={proj.length ? { width: 200, height: 124, marginRight: 22, borderRadius: radius } : { width: "100%", height: 220, marginBottom: 14, borderRadius: radius }} /> : null}
                <View style={{ flex: 1 }}>
                  <Small c={c} t={t} color={t.accent} style={{ letterSpacing: 1.6 }}>{pad2(i + 1)}</Small>
                  <Strong c={c} t={t} size={16} style={{ marginTop: 2 }} maxLines={2}>{it.title}</Strong>
                  {it.description ? <Body c={c} t={t} size={11.5} style={{ marginTop: 4, lineHeight: 1.4 }} maxLines={3}>{it.description}</Body> : null}
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Slide>
  );
}

/* ---------- Contato ---------- */

function ContactPage({ c, n, bundle, section, image }: PageProps & { bundle: EventBundle; section?: SectionRow; image?: PdfImage }) {
  const { base, fonts, radius } = c;
  const t = base;
  const { event } = bundle;
  const url = `${siteUrl()}/eventos/${event.slug}`;
  const wa = event.whatsapp ? event.whatsapp.replace(/\D/g, "") : "";
  const rows = [
    { k: "Contato", v: event.contact_name, href: undefined },
    { k: "E-mail", v: event.contact_email, href: event.contact_email ? `mailto:${event.contact_email}` : undefined },
    { k: "Telefone", v: formatPhone(event.contact_phone), href: undefined },
    { k: "WhatsApp", v: formatPhone(event.whatsapp), href: wa ? `https://wa.me/${wa}` : undefined },
  ].filter((r) => r.v);
  const title = section?.title || "Vamos conversar sobre a sua marca no evento.";
  return (
    <Slide c={c} t={t} n={n} padded={false}>
      {image ? <Img src={image} style={{ position: "absolute", left: 0, top: 0, width: W, height: H }} /> : null}
      {image ? <Veil color={t.bg} top={0.72} bottom={0.94} /> : null}
      <View style={{ position: "absolute", left: PX, right: PX, top: PT, bottom: PB, flexDirection: "row", alignItems: "flex-end" }}>
        <View style={{ flex: 1, paddingRight: 56 }}>
          <Eyebrow c={c} t={t} label={section?.eyebrow || "Próximos passos"} />
          <Heading c={c} t={t} size={title.length > 60 ? 50 : 60} style={{ marginTop: 18 }} maxLines={4}>{title}</Heading>
          {section?.body ? <Body c={c} t={t} size={15} color={mix(t.bg, t.fg, 0.82)} style={{ marginTop: 20, maxWidth: 620 }} maxLines={5}>{section.body}</Body> : null}
          <Link src={url} style={{ marginTop: 30, textDecoration: "none" }}>
            <T style={{ fontFamily: fonts.body, fontSize: 10, letterSpacing: 2.2, textTransform: "uppercase", color: mix(t.bg, t.fg, 0.7) }}>Página do evento</T>
            <T style={{ fontFamily: fonts.body, fontWeight: fonts.bodyBold, fontSize: 18, color: t.accent, marginTop: 6 }}>{url.replace(/^https?:\/\//, "")}</T>
          </Link>
        </View>
        {rows.length ? (
          <View style={{ width: 400, backgroundColor: t.accent, borderRadius: radius, padding: 28 }}>
            <T style={{ fontFamily: fonts.body, fontWeight: fonts.bodyBold, fontSize: 10.5, letterSpacing: 2.2, textTransform: "uppercase", color: t.onAccent }}>Fale com o time comercial</T>
            {rows.map((r, i) => (
              <View key={r.k} style={{ borderTopWidth: 1, borderTopColor: mix(t.accent, t.onAccent, 0.3), paddingTop: 10, marginTop: i ? 12 : 18 }}>
                <T style={{ fontFamily: fonts.body, fontSize: 9.5, letterSpacing: 1.8, textTransform: "uppercase", color: mix(t.accent, t.onAccent, 0.72) }}>{r.k}</T>
                {r.href ? (
                  <Link src={r.href} style={{ fontFamily: fonts.body, fontWeight: fonts.bodyBold, fontSize: 16, color: t.onAccent, textDecoration: "none", marginTop: 3 }}>{r.v as string}</Link>
                ) : (
                  <T style={{ fontFamily: fonts.body, fontWeight: fonts.bodyBold, fontSize: 16, color: t.onAccent, marginTop: 3 }}>{r.v}</T>
                )}
              </View>
            ))}
            {event.organizer_name ? (
              <T style={{ fontFamily: fonts.body, fontSize: 10, color: mix(t.accent, t.onAccent, 0.72), marginTop: 18 }}>{`Realização: ${event.organizer_name}`}</T>
            ) : null}
          </View>
        ) : null}
      </View>
    </Slide>
  );
}

/* ============================================================================
 * Montagem
 * ========================================================================== */

function sectionOf(bundle: EventBundle, type: SectionType) {
  return bundle.sections.find((s) => s.type === type);
}
/** Seção desligada no editor = página omitida também no PDF. Sem linha de seção, usa o padrão. */
function isOn(section: SectionRow | undefined) {
  return section ? section.enabled : true;
}

function pickGallery(media: MediaRow[]) {
  const imgs = media.filter((m) => m.kind === "image" && m.in_gallery && m.url);
  return [...imgs.filter((m) => m.featured), ...imgs.filter((m) => !m.featured)].slice(0, 3);
}

async function buildDeck(bundle: EventBundle, fonts: DeckFonts) {
  const { event, branding } = bundle;
  const bg = safeHex(branding.color_background, "#0E0D0C");
  const fg = safeHex(branding.color_text, "#F4F1EA");
  const accent = safeHex(branding.color_accent, "#E8572A");
  const primary = safeHex(branding.color_primary, accent);
  const base = makeTheme(bg, fg, accent, primary);
  const inverse = makeTheme(fg, bg, accent, mix(primary, bg, 0.35));

  const hero = sectionOf(bundle, "hero");
  const grandeur = sectionOf(bundle, "grandeur");
  const metricsS = sectionOf(bundle, "metrics");
  const audienceS = sectionOf(bundle, "audience");
  const resultsS = sectionOf(bundle, "results");
  const oppS = sectionOf(bundle, "opportunities");
  const tiersS = sectionOf(bundle, "tiers");
  const sponsorsS = sectionOf(bundle, "sponsors");
  const nextS = sectionOf(bundle, "next_edition");
  const ctaS = sectionOf(bundle, "cta");

  const heroSet = (hero?.settings ?? {}) as HeroSettings;
  const ctaSet = (ctaS?.settings ?? {}) as CtaSettings;
  const nextSet = (nextS?.settings ?? {}) as NextEditionSettings;

  const gallery = pickGallery(bundle.media);
  const coverUrl = heroSet.image_desktop || gallery[0]?.url || event.og_image_url || null;
  const ctaUrl = ctaSet.background_image || null;
  const opportunities = isOn(oppS) ? bundle.opportunities.filter((o) => o.enabled) : [];
  const nextItems = isOn(nextS) ? (nextSet.items ?? []).filter((i) => i?.title) : [];

  // Imagens: tudo em paralelo antes de montar o documento.
  const requests: ImageRequest[] = [];
  if (coverUrl) requests.push({ url: coverUrl, kind: "photo", maxWidth: 1800 });
  if (ctaUrl) requests.push({ url: ctaUrl, kind: "photo", maxWidth: 1800 });
  gallery.forEach((m, i) => requests.push({ url: m.url, kind: "photo", maxWidth: i === 0 ? 1200 : 700 }));
  opportunities.forEach((o) => o.image_url && requests.push({ url: o.image_url, kind: "photo", maxWidth: 700 }));
  nextItems.slice(0, 3).forEach((it) => it.image_url && requests.push({ url: it.image_url, kind: "photo", maxWidth: 800 }));
  if (isOn(sponsorsS)) bundle.sponsors.forEach((s) => s.sponsor.logo_url && requests.push({ url: s.sponsor.logo_url, kind: "logo" }));
  const images = await loadImages(requests);

  const pages: { group: number; make: (n: number, t: Theme, c: Ctx) => ReactNode }[] = [];
  let sectionNo = 0;

  // Capa
  pages.push({ group: 0, make: (n, t, c) => <CoverPage c={c} key="cover" n={n} t={t} bundle={bundle} image={coverUrl ? images.get(imageKey(coverUrl, "photo", 1800)) : undefined} /> });

  // O evento
  const photos = gallery
    .map((m, i) => images.get(imageKey(m.url, "photo", i === 0 ? 1200 : 700)))
    .filter((p): p is PdfImage => Boolean(p));
  if (isOn(grandeur) && (event.description || event.short_description || photos.length)) {
    const idx = ++sectionNo;
    pages.push({ group: idx, make: (n, t, c) => <AboutPage c={c} key="about" n={n} t={t} index={idx} bundle={bundle} section={grandeur} photos={photos} /> });
  }

  // Números (somente resultados apurados)
  const actual = isOn(metricsS) ? bundle.metrics.filter((m) => m.kind === "actual") : [];
  if (actual.length) {
    const idx = ++sectionNo;
    const featured = actual.find((m) => m.featured) ?? actual[0];
    const rest = actual.filter((m) => m !== featured);
    const restPages = rest.length ? chunk(rest, 6) : [[]];
    restPages.forEach((r, i) =>
      pages.push({ group: idx, make: (n, t, c) => <MetricsPage c={c} key={`metrics${i}`} n={n} t={t} index={idx} section={metricsS} featured={i === 0 ? featured : undefined} rest={r} /> }),
    );
  }

  // Público
  const audience = isOn(audienceS) ? bundle.audience.filter((a) => audienceData(a).length) : [];
  if (audience.length) {
    const idx = ++sectionNo;
    const statement = ((audienceS?.settings ?? {}) as AudienceSettings).statement ?? null;
    const perPage = 6;
    const withStatement = statement && audience.length % perPage !== 0;
    chunk(audience, perPage).forEach((rows, i, all) =>
      pages.push({
        group: idx,
        make: (n, t, c) => (
          <AudiencePage c={c} key={`aud${i}`} n={n} t={t} index={idx} section={audienceS} rows={rows} statement={withStatement && i === all.length - 1 ? statement : null} />
        ),
      }),
    );
  }

  // Resultados
  const results = isOn(resultsS) ? bundle.results : [];
  if (results.length) {
    const idx = ++sectionNo;
    const quote = bundle.testimonials.find((q) => q.context === "results");
    chunk(results, 6).forEach((r, i) =>
      pages.push({ group: idx, make: (n, t, c) => <ResultsPage c={c} key={`res${i}`} n={n} t={t} index={idx} section={resultsS} results={r} quote={i === 0 ? quote : undefined} /> }),
    );
  }

  // Oportunidades
  if (opportunities.length) {
    const idx = ++sectionNo;
    const groups = chunk(opportunities, 4);
    groups.forEach((items, i) =>
      pages.push({
        group: idx,
        make: (n, t, c) => <OpportunitiesPage c={c} key={`opp${i}`} n={n} t={t} index={idx} section={oppS} items={items} offset={i * 4} page={i + 1} pages={groups.length} />,
      }),
    );
  }

  // Cotas
  const tiers = isOn(tiersS) ? bundle.tiers.filter((x) => x.enabled) : [];
  if (tiers.length) {
    const idx = ++sectionNo;
    chunk(tiers, 4).forEach((list, i) =>
      pages.push({ group: idx, make: (n, t, c) => <TiersPage c={c} key={`tiers${i}`} n={n} t={t} index={idx} section={tiersS} tiers={list} offset={i * 4} /> }),
    );
  }

  // Patrocinadores
  const sponsorGroups: SponsorGroup[] = isOn(sponsorsS)
    ? RELATION_ORDER.map((rel) => ({ rel, items: bundle.sponsors.filter((s) => s.relation === rel) })).filter((g) => g.items.length)
    : [];
  if (sponsorGroups.length) {
    const idx = ++sectionNo;
    // Cabem ~4 linhas de logos por página.
    const sponsorPages: SponsorGroup[][] = [];
    let current: SponsorGroup[] = [];
    let used = 0;
    for (const g of sponsorGroups) {
      for (const part of chunk(g.items, LOGOS_PER_ROW * 4)) {
        const rows = Math.ceil(part.length / LOGOS_PER_ROW);
        if (used + rows > 4 && current.length) {
          sponsorPages.push(current);
          current = [];
          used = 0;
        }
        current.push({ rel: g.rel, items: part });
        used += rows;
      }
    }
    if (current.length) sponsorPages.push(current);
    sponsorPages.forEach((groups, i) =>
      pages.push({ group: idx, make: (n, t, c) => <SponsorsPage c={c} key={`sp${i}`} n={n} t={t} index={idx} section={sponsorsS} groups={groups} page={i + 1} pages={sponsorPages.length} /> }),
    );
  }

  // Próxima edição (projeções nunca se misturam aos números apurados)
  const projections = isOn(nextS) ? bundle.metrics.filter((m) => m.kind === "projection") : [];
  if (projections.length || nextItems.length) {
    const idx = ++sectionNo;
    const items = nextItems.map((it) => ({ title: it.title, description: it.description, image: it.image_url ? images.get(imageKey(it.image_url, "photo", 800)) : undefined }));
    pages.push({ group: idx, make: (n, t, c) => <NextEditionPage c={c} key="next" n={n} t={t} index={idx} section={nextS} projections={projections} items={items} /> });
  }

  // Contato
  pages.push({ group: 0, make: (n, t, c) => <ContactPage c={c} key="contact" n={n} t={t} bundle={bundle} section={ctaS} image={ctaUrl ? images.get(imageKey(ctaUrl, "photo", 1800)) : undefined} /> });

  // Alterna claro/escuro por seção (páginas da mesma seção compartilham o tema), para dar ritmo editorial.
  const themed = pages.map((p) => ({ make: p.make, inverse: p.group % 2 === 1 }));

  const ctx: Ctx = {
    fonts,
    upper: branding.heading_case === "upper",
    radius: branding.corner_style === "round" ? 14 : branding.corner_style === "soft" ? 6 : 0,
    base,
    inverse,
    images,
    eventName: event.name,
    demo: event.is_demo,
    total: pages.length,
  };

  return { ctx, pages: themed };
}

export async function renderEventDeck(bundle: EventBundle): Promise<Buffer> {
  const fonts = await loadDeckFonts(bundle.branding.font_heading, bundle.branding.font_body);
  const { ctx, pages } = await buildDeck(bundle, fonts);

  const doc = (c: Ctx) => (
      <Document title={`${bundle.event.name} — Apresentação comercial`} author={bundle.event.organizer_name ?? bundle.event.name} subject="Apresentação comercial para patrocinadores" creator="Plataforma de patrocínios" language="pt-BR">
        {pages.map((p, i) => p.make(i + 1, p.inverse ? c.inverse : c.base, c))}
      </Document>
  );

  try {
    return await renderToBuffer(doc(ctx));
  } catch (err) {
    // Fonte remota corrompida/incompatível: tenta de novo com a Helvetica embutida.
    if (fonts.heading === "Helvetica" && fonts.body === "Helvetica") throw err;
    return renderToBuffer(doc({ ...ctx, fonts: { heading: "Helvetica", body: "Helvetica", bodyBold: 700 } }));
  }
}
