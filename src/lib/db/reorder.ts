import { createServerClient } from "@/lib/supabase/server";

/**
 * Persists a new sort order for rows in `table`, optionally scoped to a parent
 * (e.g. offer_items scoped to offer_id, training_topics scoped to section_id).
 */
export async function persistSortOrder(
  table: "offers" | "offer_items" | "training_sections" | "training_topics",
  scopeColumn: string | null,
  scopeValue: string | null,
  orderedIds: string[],
) {
  const supabase = createServerClient();
  await Promise.all(
    orderedIds.map((id, index) => {
      const query = supabase.from(table).update({ sort_order: index }).eq("id", id);
      if (scopeColumn && scopeValue) {
        return query.eq(scopeColumn, scopeValue);
      }
      return query;
    }),
  );
}
