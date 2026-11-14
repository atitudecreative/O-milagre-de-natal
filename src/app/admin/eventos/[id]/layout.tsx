import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { getEditorData } from "@/lib/data/editor";
import { Badge, buttonClass } from "@/components/admin/ui";
import { EditorNav } from "@/components/admin/editors/EditorNav";
import { PublishButton } from "@/components/admin/editors/PublishButton";
import { EventActions } from "@/components/admin/EventActions";
import { STATUS_LABEL } from "@/lib/labels";
import { relativeTime } from "@/lib/format";

export default async function EventEditorLayout({ children, params }: LayoutProps<"/admin/eventos/[id]">) {
  const { id } = await params;
  const session = await requireStaff();
  const { bundle } = await getEditorData(id);
  const { event } = bundle;
  const can = { write: session.can("events.write"), publish: session.can("events.publish"), remove: session.can("events.delete") };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <Link href="/admin/eventos" className="text-xs text-mute hover:text-ink">← Eventos</Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="truncate font-display text-4xl leading-none md:text-5xl">{event.name}</h1>
            <Badge tone={event.status === "published" ? "ok" : event.status === "archived" ? "neutral" : "warn"}>{STATUS_LABEL[event.status]}</Badge>
          </div>
          <p className="mt-2 text-xs text-mute">
            {event.status === "published" ? <a className="hover:underline" href={`/eventos/${event.slug}`} target="_blank" rel="noreferrer">/eventos/{event.slug} ↗</a> : <>/eventos/{event.slug}</>}
            <span className="mx-2">·</span>salvo {relativeTime(event.updated_at)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href={`/preview/${event.id}`} target="_blank" rel="noreferrer" className={buttonClass("secondary")}>Pré-visualizar ↗</a>
          <a href={`/api/admin/events/${event.id}/pdf`} target="_blank" rel="noreferrer" className={buttonClass("secondary")}>PDF</a>
          {can.publish ? <PublishButton eventId={event.id} slug={event.slug} status={event.status} /> : null}
          <EventActions event={event} can={can} />
        </div>
      </div>
      <div className="lg:flex lg:gap-10">
        <EditorNav eventId={event.id} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
