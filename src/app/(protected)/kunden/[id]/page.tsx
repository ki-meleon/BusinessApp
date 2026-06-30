import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { StatusSelect } from "@/components/kunden/StatusSelect";
import { CustomerEditForm } from "@/components/kunden/CustomerEditForm";
import { NotesPanel } from "@/components/kunden/NotesPanel";
import { SendOfferDialog } from "@/components/kunden/SendOfferDialog";
import { SentOffersList } from "@/components/kunden/SentOffersList";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServerClient();

  const [{ data: customer, error }, { data: notes }, { data: offers }, { data: sentOffers }] =
    await Promise.all([
      supabase.from("customers").select("*").eq("id", id).single(),
      supabase
        .from("customer_notes")
        .select("*")
        .eq("customer_id", id)
        .order("created_at", { ascending: false }),
      supabase.from("offers").select("*").order("name", { ascending: true }),
      supabase
        .from("sent_offers")
        .select("*")
        .eq("customer_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (error || !customer) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/kunden" className="text-sm text-zinc-500 hover:underline">
            ← Zurück zur Kundenliste
          </Link>
          <h1 className="text-2xl font-semibold">{customer.name}</h1>
        </div>
        <SendOfferDialog customerId={customer.id} offers={offers ?? []} />
      </div>

      <StatusSelect customerId={customer.id} status={customer.status} />

      <CustomerEditForm customer={customer} />

      <div>
        <h2 className="text-lg font-medium mb-3">Notizen</h2>
        <NotesPanel customerId={customer.id} notes={notes ?? []} />
      </div>

      <div>
        <h2 className="text-lg font-medium mb-3">Gesendete Angebote/Rechnungen</h2>
        <SentOffersList sentOffers={sentOffers ?? []} />
      </div>
    </div>
  );
}
