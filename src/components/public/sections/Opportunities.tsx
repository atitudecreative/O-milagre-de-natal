import type { EventBundle, SectionRow } from "@/lib/types";
import { SectionHeader } from "../SectionHeader";
import { OpportunitiesList } from "./OpportunitiesList";

export function Opportunities({ bundle, section, index }: { bundle: EventBundle; section: SectionRow; index: number }) {
  const items = bundle.opportunities.filter((o) => o.enabled);
  if (!items.length) return null;
  return (
    <section id="oportunidades" className="ev-section">
      <div className="ev-container">
        <SectionHeader index={index} eyebrow={section.eyebrow} title={section.title} body={section.body} align="split" className="mb-16 md:mb-24" />
        <OpportunitiesList items={items} />
      </div>
    </section>
  );
}
