export interface WebhookResult {
  ok: boolean;
  status: number;
  body: string;
}

export async function postJsonToWebhook(
  url: string,
  json: Record<string, unknown>,
): Promise<WebhookResult> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

export async function postMultipartToWebhook(
  url: string,
  json: Record<string, unknown>,
  audio: File,
): Promise<WebhookResult> {
  const formData = new FormData();
  for (const [key, value] of Object.entries(json)) {
    formData.append(key, typeof value === "string" ? value : JSON.stringify(value));
  }
  formData.append("audio", audio, audio.name || "recording.webm");

  const res = await fetch(url, { method: "POST", body: formData });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}
