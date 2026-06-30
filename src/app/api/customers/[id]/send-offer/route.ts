import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getSetting } from "@/lib/env";
import { postJsonToWebhook, postMultipartToWebhook } from "@/lib/n8n/client";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: customerId } = await params;
  const supabase = createServerClient();

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .single();
  if (customerError || !customer) {
    return NextResponse.json({ error: "Kunde nicht gefunden" }, { status: 404 });
  }

  const webhookUrl = await getSetting("n8n_webhook_send_offer");
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "Keine n8n-Webhook-URL konfiguriert (siehe Einstellungen)" },
      { status: 400 },
    );
  }

  const formData = await req.formData();
  const offerId = (formData.get("offerId") as string | null) || null;
  const freeText = (formData.get("freeText") as string | null) || null;
  const audio = formData.get("audio");
  const hasAudio = audio instanceof File && audio.size > 0;

  let offer = null;
  if (offerId) {
    const { data } = await supabase.from("offers").select("*").eq("id", offerId).single();
    offer = data;
  }

  const { data: sentOfferRow, error: insertError } = await supabase
    .from("sent_offers")
    .insert({
      customer_id: customerId,
      offer_id: offerId,
      free_text: freeText,
      has_audio: hasAudio,
      webhook_url: webhookUrl,
      status: "pending",
    })
    .select("id")
    .single();
  if (insertError || !sentOfferRow) {
    return NextResponse.json({ error: insertError?.message ?? "Fehler beim Anlegen" }, { status: 500 });
  }

  const jsonPayload = {
    customer: {
      id: customer.id,
      name: customer.name,
      company: customer.company,
      email: customer.email,
      phone: customer.phone,
    },
    offer: offer
      ? { id: offer.id, name: offer.name, category: offer.category, price_cents: offer.price_cents }
      : null,
    freeText,
    sentOfferId: sentOfferRow.id,
  };

  try {
    const result = hasAudio
      ? await postMultipartToWebhook(webhookUrl, jsonPayload, audio as File)
      : await postJsonToWebhook(webhookUrl, jsonPayload);

    await supabase
      .from("sent_offers")
      .update({
        status: result.ok ? "sent" : "failed",
        response_status_code: result.status,
        response_body: result.body.slice(0, 2000),
      })
      .eq("id", sentOfferRow.id);

    if (!result.ok) {
      return NextResponse.json(
        { error: `n8n hat mit Status ${result.status} geantwortet`, sentOfferId: sentOfferRow.id },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, sentOfferId: sentOfferRow.id });
  } catch (e) {
    await supabase
      .from("sent_offers")
      .update({
        status: "failed",
        response_body: e instanceof Error ? e.message : "Unbekannter Fehler",
      })
      .eq("id", sentOfferRow.id);

    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Webhook nicht erreichbar" },
      { status: 502 },
    );
  }
}
