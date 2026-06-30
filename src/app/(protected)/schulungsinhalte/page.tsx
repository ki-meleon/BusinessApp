import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { SectionFormDialog } from "@/components/schulungsinhalte/SectionFormDialog";
import { SectionsList } from "@/components/schulungsinhalte/SectionsList";
import type { Database } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type Topic = Database["public"]["Tables"]["training_topics"]["Row"];

export default async function SchulungsinhaltePage() {
  const supabase = createServerClient();
  const [{ data: sections, error }, { data: topics }] = await Promise.all([
    supabase.from("training_sections").select("*").order("sort_order", { ascending: true }),
    supabase.from("training_topics").select("*").order("sort_order", { ascending: true }),
  ]);

  if (error) {
    return <p className="text-red-600">Fehler beim Laden: {error.message}</p>;
  }

  const topicsBySection: Record<string, Topic[]> = {};
  for (const topic of topics ?? []) {
    (topicsBySection[topic.section_id] ??= []).push(topic);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Schulungsinhalte (Katalog)</h1>
        <div className="flex gap-2">
          <Link href="/schulungsinhalte/build">
            <Button variant="outline">PPT zusammenstellen</Button>
          </Link>
          <SectionFormDialog />
        </div>
      </div>
      <SectionsList sections={sections ?? []} topicsBySection={topicsBySection} />
    </div>
  );
}
