"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateOffer, deleteOffer } from "@/app/(protected)/angebote/actions";
import type { Database } from "@/lib/supabase/types";

type Offer = Database["public"]["Tables"]["offers"]["Row"];

export function OfferEditForm({ offer }: { offer: Offer }) {
  const router = useRouter();
  const [values, setValues] = useState({
    name: offer.name,
    description: offer.description ?? "",
    price_cents: offer.price_cents,
  });
  const [saving, setSaving] = useState(false);

  async function onSave() {
    setSaving(true);
    try {
      await updateOffer(offer.id, values);
      toast.success("Gespeichert");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm(`Angebot "${offer.name}" wirklich löschen?`)) return;
    try {
      await deleteOffer(offer.id);
      router.push("/angebote");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Löschen");
    }
  }

  return (
    <div className="space-y-3 rounded-md border bg-white p-4">
      <div className="space-y-1">
        <Label>Name</Label>
        <Input
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
      </div>
      <div className="space-y-1">
        <Label>Beschreibung</Label>
        <Textarea
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
        />
      </div>
      <div className="space-y-1">
        <Label>Preis (in Cent)</Label>
        <Input
          type="number"
          min={0}
          value={values.price_cents}
          onChange={(e) => setValues((v) => ({ ...v, price_cents: Number(e.target.value) }))}
        />
      </div>
      <div className="flex justify-between pt-2">
        <Button variant="outline" className="text-red-600" onClick={onDelete}>
          Angebot löschen
        </Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Speichern..." : "Speichern"}
        </Button>
      </div>
    </div>
  );
}
