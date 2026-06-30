import type { Database } from "@/lib/supabase/types";

type SentOffer = Database["public"]["Tables"]["sent_offers"]["Row"];

const STATUS_LABELS: Record<SentOffer["status"], string> = {
  pending: "Ausstehend",
  sent: "Gesendet",
  failed: "Fehlgeschlagen",
};

const STATUS_COLORS: Record<SentOffer["status"], string> = {
  pending: "text-zinc-500",
  sent: "text-green-600",
  failed: "text-red-600",
};

export function SentOffersList({ sentOffers }: { sentOffers: SentOffer[] }) {
  if (sentOffers.length === 0) {
    return <p className="text-sm text-zinc-500">Noch keine Angebote/Rechnungen gesendet.</p>;
  }

  return (
    <ul className="space-y-2">
      {sentOffers.map((so) => (
        <li key={so.id} className="rounded-md border bg-white p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className={STATUS_COLORS[so.status]}>{STATUS_LABELS[so.status]}</span>
            <span className="text-zinc-400">
              {new Date(so.created_at).toLocaleString("de-DE")}
            </span>
          </div>
          {so.free_text && <p className="mt-1 text-zinc-600">{so.free_text}</p>}
          {so.has_audio && <p className="mt-1 text-zinc-400">🎙 mit Sprachaufnahme</p>}
          {so.status === "failed" && so.response_body && (
            <p className="mt-1 text-xs text-red-500 break-all">{so.response_body}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
