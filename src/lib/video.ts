/** Converte links de YouTube/Vimeo em URLs de incorporação; MP4/WebM tocam nativamente. */
export function videoEmbed(url: string): { type: "youtube" | "vimeo" | "file"; src: string } | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return { type: "youtube", src: `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}?autoplay=1&rel=0` };
    if (host.endsWith("youtube.com")) {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").filter(Boolean).pop();
      if (id) return { type: "youtube", src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` };
    }
    if (host.endsWith("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return { type: "vimeo", src: `https://player.vimeo.com/video/${id}?autoplay=1` };
    }
    if (/\.(mp4|webm|mov)(\?|$)/i.test(u.pathname) || u.pathname.includes("/storage/v1/object/public/")) return { type: "file", src: url };
    return null;
  } catch {
    return null;
  }
}
