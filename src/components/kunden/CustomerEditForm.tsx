"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCustomer, deleteCustomer } from "@/app/(protected)/kunden/actions";
import type { Database } from "@/lib/supabase/types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];

export function CustomerEditForm({ customer }: { customer: Customer }) {
  const router = useRouter();
  const [values, setValues] = useState({
    name: customer.name,
    company: customer.company ?? "",
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    address: customer.address ?? "",
    source: customer.source ?? "",
  });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof values>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function onSave() {
    setSaving(true);
    try {
      await updateCustomer(customer.id, values);
      toast.success("Gespeichert");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm(`Kunde "${customer.name}" wirklich löschen?`)) return;
    try {
      await deleteCustomer(customer.id);
      router.push("/kunden");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Löschen");
    }
  }

  return (
    <div className="space-y-3 rounded-md border bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Name</Label>
          <Input value={values.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Firma</Label>
          <Input value={values.company} onChange={(e) => set("company", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>E-Mail</Label>
          <Input value={values.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Telefon</Label>
          <Input value={values.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Adresse</Label>
          <Input value={values.address} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Quelle</Label>
          <Input value={values.source} onChange={(e) => set("source", e.target.value)} />
        </div>
      </div>
      <div className="flex justify-between pt-2">
        <Button variant="outline" className="text-red-600" onClick={onDelete}>
          Kunde löschen
        </Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Speichern..." : "Speichern"}
        </Button>
      </div>
    </div>
  );
}
