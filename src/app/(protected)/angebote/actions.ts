"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { offerInputSchema, offerItemInputSchema, type OfferInput, type OfferItemInput } from "@/lib/validation/offer";
import { persistSortOrder } from "@/lib/db/reorder";
import type { OfferCategory } from "@/lib/supabase/types";

export async function createOffer(input: OfferInput) {
  const parsed = offerInputSchema.parse(input);
  const supabase = createServerClient();

  const { count } = await supabase
    .from("offers")
    .select("id", { count: "exact", head: true })
    .eq("category", parsed.category);

  const { data, error } = await supabase
    .from("offers")
    .insert({
      category: parsed.category,
      name: parsed.name,
      description: parsed.description || null,
      price_cents: parsed.price_cents,
      sort_order: count ?? 0,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/angebote");
  return { id: data.id as string };
}

export async function updateOffer(id: string, input: Partial<OfferInput>) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("offers")
    .update({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description || null } : {}),
      ...(input.price_cents !== undefined ? { price_cents: input.price_cents } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/angebote");
  revalidatePath(`/angebote/${id}`);
}

export async function deleteOffer(id: string) {
  const supabase = createServerClient();
  const { error } = await supabase.from("offers").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/angebote");
}

export async function reorderOffers(category: OfferCategory, orderedIds: string[]) {
  await persistSortOrder("offers", "category", category, orderedIds);
  revalidatePath("/angebote");
}

export async function addOfferItem(offerId: string, input: OfferItemInput) {
  const parsed = offerItemInputSchema.parse(input);
  const supabase = createServerClient();

  const { count } = await supabase
    .from("offer_items")
    .select("id", { count: "exact", head: true })
    .eq("offer_id", offerId);

  const { error } = await supabase.from("offer_items").insert({
    offer_id: offerId,
    label: parsed.label,
    topic_id: parsed.topic_id ?? null,
    sort_order: count ?? 0,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/angebote/${offerId}`);
}

export async function removeOfferItem(itemId: string, offerId: string) {
  const supabase = createServerClient();
  const { error } = await supabase.from("offer_items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);
  revalidatePath(`/angebote/${offerId}`);
}

export async function reorderOfferItems(offerId: string, orderedIds: string[]) {
  await persistSortOrder("offer_items", "offer_id", offerId, orderedIds);
  revalidatePath(`/angebote/${offerId}`);
}
