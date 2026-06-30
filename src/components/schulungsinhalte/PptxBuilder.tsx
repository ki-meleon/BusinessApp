"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SortableList } from "@/components/shared/SortableList";
import type { Database } from "@/lib/supabase/types";

type Section = Database["public"]["Tables"]["training_sections"]["Row"];
type Topic = Database["public"]["Tables"]["training_topics"]["Row"];

interface SelectedTopic {
  id: string;
  name: string;
  hasFile: boolean;
}

export function PptxBuilder({
  sections,
  topicsBySection,
}: {
  sections: Section[];
  topicsBySection: Record<string, Topic[]>;
}) {
  const [selected, setSelected] = useState<SelectedTopic[]>([]);
  const [building, setBuilding] = useState(false);
  const [result, setResult] = useState<{
    downloadUrl: string;
    filename: string;
    slideCount: number;
    skipped: string[];
  } | null>(null);

  function toggleTopic(topic: Topic) {
    setSelected((prev) => {
      const exists = prev.find((t) => t.id === topic.id);
      if (exists) return prev.filter((t) => t.id !== topic.id);
      return [...prev, { id: topic.id, name: topic.name, hasFile: !!topic.pptx_file_path }];
    });
  }

  async function onBuild() {
    if (selected.length === 0) return;
    setBuilding(true);
    setResult(null);
    try {
      const res = await fetch("/api/pptx/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicIds: selected.map((t) => t.id) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fehler beim Zusammenstellen");
      setResult(data);
      if (data.skipped?.length > 0) {
        toast.warning(`Übersprungen (keine Datei): ${data.skipped.join(", ")}`);
      } else {
        toast.success("PPTX erfolgreich zusammengestellt");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Zusammenstellen");
    } finally {
      setBuilding(false);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <h2 className="font-medium">Themen auswählen</h2>
        {sections.map((section) => (
          <div key={section.id} className="space-y-1">
            <p className="text-sm font-medium text-zinc-700">{section.name}</p>
            {(topicsBySection[section.id] ?? []).map((topic) => {
              const isSelected = selected.some((t) => t.id === topic.id);
              return (
                <label
                  key={topic.id}
                  className="flex items-center gap-2 text-sm pl-2 py-1 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleTopic(topic)}
                  />
                  <span className={!topic.pptx_file_path ? "text-zinc-400" : ""}>
                    {topic.name}
                    {!topic.pptx_file_path && " (keine PPTX)"}
                  </span>
                </label>
              );
            })}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="font-medium">Reihenfolge festlegen</h2>
        {selected.length === 0 ? (
          <p className="text-sm text-zinc-500">Wähle links Themen aus.</p>
        ) : (
          <SortableList
            items={selected}
            onReorder={(orderedIds) =>
              setSelected((prev) =>
                orderedIds.map((id) => prev.find((t) => t.id === id)!).filter(Boolean),
              )
            }
            className="space-y-2"
            renderItem={(item, dragHandle) => (
              <div className="flex items-center gap-3 rounded-md border bg-white p-2">
                {dragHandle}
                <span className="flex-1 text-sm">{item.name}</span>
              </div>
            )}
          />
        )}

        <Button onClick={onBuild} disabled={building || selected.length === 0}>
          {building ? "Wird zusammengestellt..." : "PPT zusammenstellen"}
        </Button>

        {result && (
          <div className="rounded-md border bg-white p-3 space-y-1">
            <p className="text-sm">
              Fertig: <strong>{result.slideCount}</strong> Folien
            </p>
            <a href={result.downloadUrl} className="text-sm text-blue-600 hover:underline">
              {result.filename} herunterladen
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
