"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SortableList } from "@/components/shared/SortableList";
import { TopicFormDialog } from "@/components/schulungsinhalte/TopicFormDialog";
import { TopicUpload } from "@/components/schulungsinhalte/TopicUpload";
import {
  deleteSection,
  deleteTopic,
  reorderTopics,
} from "@/app/(protected)/schulungsinhalte/actions";
import type { Database } from "@/lib/supabase/types";

type Section = Database["public"]["Tables"]["training_sections"]["Row"];
type Topic = Database["public"]["Tables"]["training_topics"]["Row"];

export function SectionCard({ section, topics }: { section: Section; topics: Topic[] }) {
  const router = useRouter();

  async function onDeleteSection() {
    if (!confirm(`Abschnitt "${section.name}" inkl. aller Themen wirklich löschen?`)) return;
    try {
      await deleteSection(section.id);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Löschen");
    }
  }

  async function onDeleteTopic(topicId: string) {
    if (!confirm("Thema wirklich löschen?")) return;
    try {
      await deleteTopic(topicId);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Löschen");
    }
  }

  async function onReorderTopics(orderedIds: string[]) {
    try {
      await reorderTopics(section.id, orderedIds);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Sortieren");
    }
  }

  return (
    <div className="rounded-md border bg-white p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{section.name}</h3>
          {section.description && (
            <p className="text-sm text-zinc-500">{section.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <TopicFormDialog sectionId={section.id} />
          <Button size="sm" variant="outline" className="text-red-600" onClick={onDeleteSection}>
            Abschnitt löschen
          </Button>
        </div>
      </div>

      {topics.length === 0 ? (
        <p className="text-sm text-zinc-400">Noch keine Themen in diesem Abschnitt.</p>
      ) : (
        <SortableList
          items={topics}
          onReorder={onReorderTopics}
          className="space-y-2"
          renderItem={(topic, dragHandle) => (
            <div className="flex items-center gap-3 rounded-md border p-3">
              {dragHandle}
              <div className="flex-1">
                <p className="font-medium">{topic.name}</p>
                {topic.description && (
                  <p className="text-sm text-zinc-500">{topic.description}</p>
                )}
              </div>
              <TopicUpload topicId={topic.id} currentFilename={topic.pptx_original_filename} />
              <button
                onClick={() => onDeleteTopic(topic.id)}
                className="text-xs text-zinc-400 hover:text-red-600"
              >
                Löschen
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
}
