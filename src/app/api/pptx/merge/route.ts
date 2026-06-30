import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { mergePptx } from "@/lib/pptx/merge";
import { topicPptxExists } from "@/lib/pptx/storage";

export const maxDuration = 10;

export async function POST(req: Request) {
  const body = await req.json();
  const topicIds: string[] = body.topicIds ?? [];

  if (!Array.isArray(topicIds) || topicIds.length === 0) {
    return NextResponse.json({ error: "Keine Themen ausgewählt" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: topics, error } = await supabase
    .from("training_topics")
    .select("*")
    .in("id", topicIds);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const topicsById = new Map((topics ?? []).map((t) => [t.id, t]));
  const skipped: string[] = [];
  const sources: { topicId: string; fileName: string }[] = [];

  for (const id of topicIds) {
    const topic = topicsById.get(id);
    if (!topic || !topic.pptx_file_path) {
      skipped.push(topic?.name ?? id);
      continue;
    }
    if (!(await topicPptxExists(id))) {
      skipped.push(topic.name);
      continue;
    }
    sources.push({ topicId: id, fileName: `${id}.pptx` });
  }

  if (sources.length === 0) {
    return NextResponse.json(
      { error: "Keine der ausgewählten Themen hat eine hochgeladene PPTX-Datei", skipped },
      { status: 400 },
    );
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const shortId = Math.random().toString(36).slice(2, 8);
  const outputFileName = `merge-${timestamp}-${shortId}.pptx`;

  try {
    const result = await mergePptx(sources, outputFileName);
    return NextResponse.json({
      downloadUrl: `/api/pptx/${result.outputFileName}`,
      filename: result.outputFileName,
      slideCount: result.slideCount,
      skipped,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Fehler beim Zusammenstellen der PPTX" },
      { status: 500 },
    );
  }
}
