import { listGeneratedPptx } from "@/lib/pptx/storage";

export interface GeneratedFile {
  filename: string;
  createdAt: string;
  sizeBytes: number;
}

export async function listGeneratedFiles(): Promise<GeneratedFile[]> {
  const files = await listGeneratedPptx();
  return files
    .map((f) => ({ filename: f.filename, createdAt: f.lastModified, sizeBytes: f.sizeBytes }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
