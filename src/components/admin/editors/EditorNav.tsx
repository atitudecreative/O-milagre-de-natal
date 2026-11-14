"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cx } from "../ui";
import { EDITOR_TABS } from "./tabs";

export function EditorNav({ eventId }: { eventId: string }) {
  const path = usePathname();
  const router = useRouter();
  const current = path.split("/")[4] ?? "geral";
  const groups = Array.from(new Set(EDITOR_TABS.map((t) => t.group)));
  if (path.includes("/assistente/")) return null;
  return (
    <>
      <div className="mb-6 lg:hidden">
        <label htmlFor="editor-tab" className="sr-only">Seção do editor</label>
        <select id="editor-tab" className="adm-input h-11" value={current} onChange={(e) => router.push(`/admin/eventos/${eventId}/${e.target.value}`)}>
          {groups.map((g) => (
            <optgroup key={g} label={g}>
              {EDITOR_TABS.filter((t) => t.group === g).map((t) => <option key={t.slug} value={t.slug}>{t.label}</option>)}
            </optgroup>
          ))}
        </select>
      </div>
      <nav aria-label="Editor do evento" className="sticky top-6 hidden w-52 shrink-0 self-start lg:block">
        {groups.map((g) => (
          <div key={g} className="mb-5">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-faint">{g}</p>
            <ul>
              {EDITOR_TABS.filter((t) => t.group === g).map((t) => (
                <li key={t.slug}>
                  <Link href={`/admin/eventos/${eventId}/${t.slug}`} aria-current={current === t.slug ? "page" : undefined}
                    className={cx("block rounded-md px-3 py-1.5 text-sm", current === t.slug ? "bg-card font-medium text-ink ring-1 ring-line" : "text-ink-2 hover:text-ink")}>
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
}
