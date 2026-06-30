"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { SortableList } from "@/components/shared/SortableList";
import { reorderOffers } from "@/app/(protected)/angebote/actions";
import { formatPriceCents } from "@/lib/utils";
import type { Database, OfferCategory } from "@/lib/supabase/types";

type Offer = Database["public"]["Tables"]["offers"]["Row"];

export function OfferList({ category, offers }: { category: OfferCategory; offers: Offer[] }) {
  const router = useRouter();

  async function onReorder(orderedIds: string[]) {
    try {
      await reorderOffers(category, orderedIds);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Sortieren");
    }
  }

  if (offers.length === 0) {
    return <p className="text-sm text-zinc-500 py-6">Noch keine Angebote in dieser Kategorie.</p>;
  }

  return (
    <SortableList
      items={offers}
      onReorder={onReorder}
      className="space-y-2"
      renderItem={(offer, dragHandle) => (
        <div className="flex items-center gap-3 rounded-md border bg-white p-3">
          {dragHandle}
          <Link href={`/angebote/${offer.id}`} className="flex-1">
            <p className="font-medium hover:underline">{offer.name}</p>
            {offer.description && (
              <p className="text-sm text-zinc-500 line-clamp-1">{offer.description}</p>
            )}
          </Link>
          <span className="text-sm font-medium">{formatPriceCents(offer.price_cents)}</span>
        </div>
      )}
    />
  );
}
