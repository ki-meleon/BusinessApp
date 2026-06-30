import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { OfferEditForm } from "@/components/angebote/OfferEditForm";
import { OfferItemsEditor } from "@/components/angebote/OfferItemsEditor";

export const dynamic = "force-dynamic";

export default async function OfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServerClient();

  const [{ data: offer, error }, { data: items }, { data: topics }] = await Promise.all([
    supabase.from("offers").select("*").eq("id", id).single(),
    supabase
      .from("offer_items")
      .select("*")
      .eq("offer_id", id)
      .order("sort_order", { ascending: true }),
    supabase.from("training_topics").select("*").order("name", { ascending: true }),
  ]);

  if (error || !offer) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/angebote" className="text-sm text-zinc-500 hover:underline">
          ← Zurück zu den Angeboten
        </Link>
        <h1 className="text-2xl font-semibold">{offer.name}</h1>
        <p className="text-sm text-zinc-500">
          {offer.category === "schulung" ? "Schulungspaket" : "Beratungspaket"}
        </p>
      </div>

      <OfferEditForm offer={offer} />

      <div>
        <h2 className="text-lg font-medium mb-3">Inhalte</h2>
        <OfferItemsEditor offerId={offer.id} items={items ?? []} topics={topics ?? []} />
      </div>
    </div>
  );
}
