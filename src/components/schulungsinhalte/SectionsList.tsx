"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SortableList } from "@/components/shared/SortableList";
import { SectionCard } from "@/components/schulungsinhalte/SectionCard";
import { reorderSections } from "@/app/(protected)/schulungsinhalte/actions";
import type { Database } from "@/lib/supabase/types";

type Section = Database["public"]["Tables"]["training_sections"]["Row"];
type Topic = Database["public"]["Tables"]["training_topics"]["Row"];

export function SectionsList({
  sections,
  topicsBySection,
}: {
  sections: Section[];
  topicsBySection: Record<string, Topic[]>;
}) {
  const router = useRouter();

  async function onReorder(orderedIds: string[]) {
    try {
      await reorderSections(orderedIds);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Sortieren");
    }
  }

  if (sections.length === 0) {
    return <p className="text-sm text-zinc-500 py-6">Noch keine Abschnitte angelegt.</p>;
  }

  return (
    <SortableList
      items={sections}
      onReorder={onReorder}
      className="space-y-4"
      renderItem={(section, dragHandle) => (
        <div className="flex gap-2">
          <div className="pt-4">{dragHandle}</div>
          <div className="flex-1">
            <SectionCard section={section} topics={topicsBySection[section.id] ?? []} />
          </div>
        </div>
      )}
    />
  );
}
