import { NextResponse } from "next/server";
import { downloadGeneratedPptxToBuffer } from "@/lib/pptx/storage";

export const maxDuration = 10;

export async function GET(_req: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;

  // Prevent path traversal — only allow plain filenames within generated/.
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return NextResponse.json({ error: "Ungültiger Dateiname" }, { status: 400 });
  }

  try {
    const buffer = await downloadGeneratedPptxToBuffer(filename);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Datei nicht gefunden" }, { status: 404 });
  }
}
