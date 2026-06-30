import { createServerClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OfferList } from "@/components/angebote/OfferList";
import { OfferFormDialog } from "@/components/angebote/OfferFormDialog";

export const dynamic = "force-dynamic";

export default async function AngebotePage() {
  const supabase = createServerClient();
  const { data: offers, error } = await supabase
    .from("offers")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return <p className="text-red-600">Fehler beim Laden der Angebote: {error.message}</p>;
  }

  const schulung = (offers ?? []).filter((o) => o.category === "schulung");
  const beratung = (offers ?? []).filter((o) => o.category === "beratung");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Angebote</h1>
      <Tabs defaultValue="schulung">
        <TabsList>
          <TabsTrigger value="schulung">Schulungspakete ({schulung.length})</TabsTrigger>
          <TabsTrigger value="beratung">Beratungspakete ({beratung.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="schulung" className="space-y-4">
          <div className="flex justify-end">
            <OfferFormDialog category="schulung" />
          </div>
          <OfferList category="schulung" offers={schulung} />
        </TabsContent>
        <TabsContent value="beratung" className="space-y-4">
          <div className="flex justify-end">
            <OfferFormDialog category="beratung" />
          </div>
          <OfferList category="beratung" offers={beratung} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
