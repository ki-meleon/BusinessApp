"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function TopicUpload({
  topicId,
  currentFilename,
}: {
  topicId: string;
  currentFilename: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/topics/${topicId}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload fehlgeschlagen");
      toast.success("PPTX hochgeladen");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {currentFilename ? (
        <span className="text-zinc-600 truncate max-w-[160px]" title={currentFilename}>
          📄 {currentFilename}
        </span>
      ) : (
        <span className="text-zinc-400">Keine Datei</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pptx"
        className="hidden"
        onChange={onFileSelected}
      />
      <Button
        size="sm"
        variant="outline"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "Lädt hoch..." : currentFilename ? "Ersetzen" : "PPTX hochladen"}
      </Button>
    </div>
  );
}
