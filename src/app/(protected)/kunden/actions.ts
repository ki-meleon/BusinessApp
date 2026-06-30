"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { customerInputSchema, type CustomerInput } from "@/lib/validation/customer";
import type { CustomerStatus } from "@/lib/supabase/types";

export async function createCustomer(input: CustomerInput) {
  const parsed = customerInputSchema.parse(input);
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: parsed.name,
      company: parsed.company || null,
      email: parsed.email || null,
      phone: parsed.phone || null,
      address: parsed.address || null,
      source: parsed.source || null,
      status: parsed.status,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/kunden");
  return { id: data.id as string };
}

export async function updateCustomer(id: string, input: Partial<CustomerInput>) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("customers")
    .update({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.company !== undefined ? { company: input.company || null } : {}),
      ...(input.email !== undefined ? { email: input.email || null } : {}),
      ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
      ...(input.address !== undefined ? { address: input.address || null } : {}),
      ...(input.source !== undefined ? { source: input.source || null } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/kunden");
  revalidatePath(`/kunden/${id}`);
}

export async function deleteCustomer(id: string) {
  const supabase = createServerClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/kunden");
}

export async function changeCustomerStatus(id: string, status: CustomerStatus) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("customers")
    .update({ status, status_changed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/kunden");
  revalidatePath(`/kunden/${id}`);
}

export async function addCustomerNote(customerId: string, body: string) {
  if (!body.trim()) throw new Error("Notiz darf nicht leer sein");
  const supabase = createServerClient();
  const { error } = await supabase
    .from("customer_notes")
    .insert({ customer_id: customerId, body: body.trim() });
  if (error) throw new Error(error.message);
  revalidatePath(`/kunden/${customerId}`);
}

export async function deleteCustomerNote(noteId: string, customerId: string) {
  const supabase = createServerClient();
  const { error } = await supabase.from("customer_notes").delete().eq("id", noteId);
  if (error) throw new Error(error.message);
  revalidatePath(`/kunden/${customerId}`);
}
