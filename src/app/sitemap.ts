import type { MetadataRoute } from "next";
import { EVENTO } from "@/content/evento";
import { siteUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  if (EVENTO.event.noindex) return [];
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
