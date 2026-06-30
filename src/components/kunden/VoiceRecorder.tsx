"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function VoiceRecorder({ onRecorded }: { onRecorded: (file: File | null) => void }) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const file = new File([blob], `aufnahme-${Date.now()}.webm`, { type: "audio/webm" });
      setAudioUrl(URL.createObjectURL(blob));
      onRecorded(file);
      stream.getTracks().forEach((t) => t.stop());
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  function clearRecording() {
    setAudioUrl(null);
    onRecorded(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {!recording ? (
          <Button type="button" size="sm" variant="outline" onClick={startRecording}>
            🎙 Aufnahme starten
          </Button>
        ) : (
          <Button type="button" size="sm" variant="outline" className="text-red-600" onClick={stopRecording}>
            ⏹ Aufnahme stoppen
          </Button>
        )}
        {audioUrl && (
          <Button type="button" size="sm" variant="ghost" onClick={clearRecording}>
            Verwerfen
          </Button>
        )}
      </div>
      {audioUrl && <audio controls src={audioUrl} className="w-full" />}
    </div>
  );
}
