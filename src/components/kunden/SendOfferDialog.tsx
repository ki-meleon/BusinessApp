"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { VoiceRecorder } from "@/components/kunden/VoiceRecorder";
import { formatPriceCents } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type Offer = Database["public"]["Tables"]["offers"]["Row"];

export function SendOfferDialog({ customerId, offers }: { customerId: string; offers: Offer[] }) {
  const [open, setOpen] = useState(false);
  const [offerId, setOfferId] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  async function onSend() {
    setSending(true);
    try {
      const formData = new FormData();
      if (offerId) formData.append("offerId", offerId);
      if (freeText.trim()) formData.append("freeText", freeText.trim());
      if (audioFile) formData.append("audio", audioFile);

      const res = await fetch(`/api/customers/${customerId}/send-offer`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Senden fehlgeschlagen");

      toast.success("Angebot/Rechnung gesendet");
      setOpen(false);
      setFreeText("");
      setOfferId(null);
      setAudioFile(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Senden fehlgeschlagen");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Angebot/Rechnung senden</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Angebot/Rechnung senden</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {offers.length > 0 && (
            <Select value={offerId ?? undefined} onValueChange={(v) => setOfferId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Angebot verknüpfen (optional)" />
              </SelectTrigger>
              <SelectContent>
                {offers.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name} ({formatPriceCents(o.price_cents)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Textarea
            placeholder="Freitext zum Angebot/zur Rechnung..."
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
          />
          <VoiceRecorder onRecorded={setAudioFile} />
          <DialogFooter>
            <Button onClick={onSend} disabled={sending}>
              {sending ? "Senden..." : "Senden"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
