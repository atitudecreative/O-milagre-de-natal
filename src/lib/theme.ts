import type { CSSProperties } from "react";
import type { BrandingRow } from "./types";
import { fontStack } from "./fonts";
import { mix, readableOn, rgba } from "./color";

/**
 * Converte a identidade visual do evento em variáveis CSS.
 * Todos os componentes públicos usam apenas estas variáveis — por isso
 * cada evento tem cara própria sem nenhuma página escrita à mão.
 */
export function brandVars(b: Pick<BrandingRow,
  "color_primary" | "color_secondary" | "color_accent" | "color_background" | "color_text" |
  "font_heading" | "font_body" | "heading_case" | "corner_style">): CSSProperties {
  const radius = b.corner_style === "round" ? "28px" : b.corner_style === "soft" ? "10px" : "0px";
  return {
    "--ev-bg": b.color_background,
    "--ev-fg": b.color_text,
    "--ev-primary": b.color_primary,
    "--ev-secondary": b.color_secondary,
    "--ev-accent": b.color_accent,
    "--ev-on-accent": readableOn(b.color_accent),
    "--ev-on-primary": readableOn(b.color_primary),
    "--ev-on-secondary": readableOn(b.color_secondary),
    "--ev-muted": rgba(b.color_text, 0.62),
    "--ev-subtle": rgba(b.color_text, 0.38),
    "--ev-line": rgba(b.color_text, 0.16),
    "--ev-line-strong": rgba(b.color_text, 0.32),
    "--ev-surface": mix(b.color_background, b.color_text, 0.05),
    "--ev-surface-2": mix(b.color_background, b.color_text, 0.1),
    "--ev-font-heading": fontStack(b.font_heading),
    "--ev-font-body": fontStack(b.font_body),
    "--ev-heading-case": b.heading_case === "upper" ? "uppercase" : "none",
    "--ev-radius": radius,
  } as CSSProperties;
}
