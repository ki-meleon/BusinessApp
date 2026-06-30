"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { changeCustomerStatus } from "@/app/(protected)/kunden/actions";
import type { CustomerStatus } from "@/lib/supabase/types";

const LABELS: Record<CustomerStatus, string> = {
  lead: "Potenzieller Kunde",
  active: "Aktiver Kunde",
  past: "Vergangener Kunde",
};

export function StatusSelect({ customerId, status }: { customerId: string; status: CustomerStatus }) {
  const router = useRouter();

  async function onChange(value: string | null) {
    if (!value) return;
    try {
      await changeCustomerStatus(customerId, value as CustomerStatus);
      toast.success("Status aktualisiert");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Aktualisieren");
    }
  }

  return (
    <Select defaultValue={status} onValueChange={onChange}>
      <SelectTrigger className="w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
