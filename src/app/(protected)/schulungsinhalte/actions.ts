"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { sectionInputSchema, topicInputSchema, type SectionInput, type TopicInput } from "@/lib/validation/topic";
import { persistSortOrder } from "@/lib/db/reorder";
import { deleteTopicPptx } from "@/lib/pptx/storage";

export async function createSection(input: SectionInput) {
  const parsed = sectionInputSchema.parse(input);
  const supabase = createServerClient();

  const { count } = await supabase
    .from("training_sections")
    .select("id", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("training_sections")
    .insert({ name: parsed.name, description: parsed.description || null, sort_order: count ?? 0 })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/schulungsinhalte");
  return { id: data.id as string };
}

export async function updateSection(id: string, input: Partial<SectionInput>) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("training_sections")
    .update({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description || null } : {}),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/schulungsinhalte");
}

export async function deleteSection(id: string) {
  const supabase = createServerClient();
  const { data: topics } = await supabase
    .from("training_topics")
    .select("id")
    .eq("section_id", id);
  for (const topic of topics ?? []) {
    await deleteTopicPptx(topic.id);
  }
  const { error } = await supabase.from("training_sections").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/schulungsinhalte");
}

export async function reorderSections(orderedIds: string[]) {
  await persistSortOrder("training_sections", null, null, orderedIds);
  revalidatePath("/schulungsinhalte");
}

export async function createTopic(sectionId: string, input: TopicInput) {
  const parsed = topicInputSchema.parse(input);
  const supabase = createServerClient();

  const { count } = await supabase
    .from("training_topics")
    .select("id", { count: "exact", head: true })
    .eq("section_id", sectionId);

  const { data, error } = await supabase
    .from("training_topics")
    .insert({
      section_id: sectionId,
      name: parsed.name,
      description: parsed.description || null,
      sort_order: count ?? 0,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/schulungsinhalte");
  return { id: data.id as string };
}

export async function updateTopic(id: string, input: Partial<TopicInput>) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("training_topics")
    .update({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description || null } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/schulungsinhalte");
}

export async function deleteTopic(id: string) {
  const supabase = createServerClient();
  await deleteTopicPptx(id);
  const { error } = await supabase.from("training_topics").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/schulungsinhalte");
}

export async function reorderTopics(sectionId: string, orderedIds: string[]) {
  await persistSortOrder("training_topics", "section_id", sectionId, orderedIds);
  revalidatePath("/schulungsinhalte");
}
