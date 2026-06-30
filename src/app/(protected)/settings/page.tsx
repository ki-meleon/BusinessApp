import { getSettings } from "@/app/(protected)/settings/actions";
import { SettingsForm } from "@/components/settings/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Einstellungen</h1>
      <SettingsForm
        initialWebhookUrl={settings.n8n_webhook_send_offer ?? ""}
        envWebhookUrl={process.env.N8N_WEBHOOK_SEND_OFFER ?? ""}
        nextcloudFolder={process.env.NEXTCLOUD_PPTX_FOLDER ?? ""}
      />
    </div>
  );
}
