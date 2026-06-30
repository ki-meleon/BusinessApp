"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSetting } from "@/app/(protected)/settings/actions";

export function SettingsForm({
  initialWebhookUrl,
  envWebhookUrl,
  nextcloudFolder,
}: {
  initialWebhookUrl: string;
  envWebhookUrl: string;
  nextcloudFolder: string;
}) {
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl);
  const [saving, setSaving] = useState(false);

  async function onSave() {
    setSaving(true);
    try {
      await updateSetting("n8n_webhook_send_offer", webhookUrl);
      toast.success("Gespeichert");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="space-y-2 rounded-md border bg-white p-4">
        <Label htmlFor="webhook">n8n Webhook-URL (Angebot/Rechnung senden)</Label>
        <Input
          id="webhook"
          placeholder="https://your-n8n-host/webhook/send-offer"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
        />
        <p className="text-xs text-zinc-400">
          Leer lassen, um den Wert aus der Umgebungsvariable N8N_WEBHOOK_SEND_OFFER zu verwenden
          {envWebhookUrl && ` (aktuell: ${envWebhookUrl})`}.
        </p>
        <Button size="sm" onClick={onSave} disabled={saving}>
          {saving ? "Speichern..." : "Speichern"}
        </Button>
      </div>

      <div className="space-y-1 rounded-md border bg-white p-4">
        <Label>PPTX-Speicherort (Nextcloud)</Label>
        <p className="text-sm text-zinc-600">{nextcloudFolder || "Nicht konfiguriert"}</p>
        <p className="text-xs text-zinc-400">
          Wird über NEXTCLOUD_URL, NEXTCLOUD_USERNAME, NEXTCLOUD_APP_PASSWORD und
          NEXTCLOUD_PPTX_FOLDER gesetzt (.env.local bzw. Vercel-Umgebungsvariablen).
        </p>
      </div>
    </div>
  );
}
