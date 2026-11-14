import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const { data } = await createPublicClient().from("events").select("slug, updated_at, noindex, is_demo").eq("status", "published");
  return [
    { url: base, changeFrequency: "weekly", priority: 0.5 },
    ...(data ?? [])
      .filter((e) => !e.noindex && !e.is_demo)
      .map((e) => ({ url: `${base}/eventos/${e.slug}`, lastModified: e.updated_at, changeFrequency: "weekly" as const, priority: 0.9 })),
  ];
}
