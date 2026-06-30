"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addCustomerNote, deleteCustomerNote } from "@/app/(protected)/kunden/actions";
import type { Database } from "@/lib/supabase/types";

type Note = Database["public"]["Tables"]["customer_notes"]["Row"];

export function NotesPanel({ customerId, notes }: { customerId: string; notes: Note[] }) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function onAdd() {
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await addCustomerNote(customerId, body);
      setBody("");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Speichern");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(noteId: string) {
    try {
      await deleteCustomerNote(noteId, customerId);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Löschen");
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Notiz hinzufügen..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button size="sm" onClick={onAdd} disabled={submitting || !body.trim()}>
          {submitting ? "Speichern..." : "Notiz speichern"}
        </Button>
      </div>
      <div className="space-y-3">
        {notes.length === 0 && <p className="text-sm text-zinc-500">Noch keine Notizen.</p>}
        {notes.map((note) => (
          <div key={note.id} className="rounded-md border p-3 bg-white">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm whitespace-pre-wrap">{note.body}</p>
              <button
                onClick={() => onDelete(note.id)}
                className="text-xs text-zinc-400 hover:text-red-600"
              >
                Löschen
              </button>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              {new Date(note.created_at).toLocaleString("de-DE")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
