import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { uploadTopicPptx, topicPptxRelativePath } from "@/lib/pptx/storage";

export const maxDuration = 10;

const MAX_SIZE_BYTES = 50 * 1024 * 1024;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Keine Datei übermittelt" }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".pptx")) {
    return NextResponse.json({ error: "Nur .pptx-Dateien sind erlaubt" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Datei ist zu groß (max. 50MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadTopicPptx(id, buffer);

  const supabase = createServerClient();
  const { error } = await supabase
    .from("training_topics")
    .update({
      pptx_file_path: topicPptxRelativePath(id),
      pptx_original_filename: file.name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, filename: file.name });
}
