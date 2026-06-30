import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { listGeneratedFiles } from "@/lib/pptx/history";
import { PptxBuilder } from "@/components/schulungsinhalte/PptxBuilder";
import type { Database } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type Topic = Database["public"]["Tables"]["training_topics"]["Row"];

export default async function BuildPage() {
  const supabase = createServerClient();
  const [{ data: sections }, { data: topics }, history] = await Promise.all([
    supabase.from("training_sections").select("*").order("sort_order", { ascending: true }),
    supabase.from("training_topics").select("*").order("sort_order", { ascending: true }),
    listGeneratedFiles(),
  ]);

  const topicsBySection: Record<string, Topic[]> = {};
  for (const topic of topics ?? []) {
    (topicsBySection[topic.section_id] ??= []).push(topic);
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/schulungsinhalte" className="text-sm text-zinc-500 hover:underline">
          ← Zurück zum Katalog
        </Link>
        <h1 className="text-2xl font-semibold">PPT zusammenstellen</h1>
      </div>

      <PptxBuilder sections={sections ?? []} topicsBySection={topicsBySection} />

      {history.length > 0 && (
        <div>
          <h2 className="font-medium mb-2">Bisherige Builds</h2>
          <ul className="space-y-1">
            {history.map((file) => (
              <li key={file.filename} className="text-sm">
                <a
                  href={`/api/pptx/${file.filename}`}
                  className="text-blue-600 hover:underline"
                >
                  {file.filename}
                </a>{" "}
                <span className="text-zinc-400">
                  ({new Date(file.createdAt).toLocaleString("de-DE")}, {Math.round(file.sizeBytes / 1024)} KB)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
