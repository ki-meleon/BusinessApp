"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortableList } from "@/components/shared/SortableList";
import { addOfferItem, removeOfferItem, reorderOfferItems } from "@/app/(protected)/angebote/actions";
import type { Database } from "@/lib/supabase/types";

type OfferItem = Database["public"]["Tables"]["offer_items"]["Row"];
type Topic = Database["public"]["Tables"]["training_topics"]["Row"];

export function OfferItemsEditor({
  offerId,
  items,
  topics,
}: {
  offerId: string;
  items: OfferItem[];
  topics: Topic[];
}) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [topicId, setTopicId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onAdd() {
    if (!label.trim()) return;
    setSubmitting(true);
    try {
      await addOfferItem(offerId, { label: label.trim(), topic_id: topicId });
      setLabel("");
      setTopicId(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Hinzufügen");
    } finally {
      setSubmitting(false);
    }
  }

  async function onRemove(itemId: string) {
    try {
      await removeOfferItem(itemId, offerId);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Entfernen");
    }
  }

  async function onReorder(orderedIds: string[]) {
    try {
      await reorderOfferItems(offerId, orderedIds);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Sortieren");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Inhalt / Leistung hinzufügen..."
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        {topics.length > 0 && (
          <Select value={topicId ?? undefined} onValueChange={(v) => setTopicId(v)}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Thema verknüpfen (optional)" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button onClick={onAdd} disabled={submitting || !label.trim()}>
          Hinzufügen
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">Noch keine Inhalte hinzugefügt.</p>
      ) : (
        <SortableList
          items={items}
          onReorder={onReorder}
          className="space-y-2"
          renderItem={(item, dragHandle) => (
            <div className="flex items-center gap-3 rounded-md border bg-white p-3">
              {dragHandle}
              <span className="flex-1">{item.label}</span>
              <button
                onClick={() => onRemove(item.id)}
                className="text-xs text-zinc-400 hover:text-red-600"
              >
                Entfernen
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
}
