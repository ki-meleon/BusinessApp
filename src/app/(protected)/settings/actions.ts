"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

export async function getSettings(): Promise<Record<string, string>> {
  const supabase = createServerClient();
  const { data } = await supabase.from("app_settings").select("key, value");
  const result: Record<string, string> = {};
  for (const row of data ?? []) {
    result[row.key] = row.value;
  }
  return result;
}

export async function updateSetting(key: string, value: string) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("app_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}
