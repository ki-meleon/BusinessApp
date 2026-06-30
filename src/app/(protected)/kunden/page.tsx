import { createServerClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerTable } from "@/components/kunden/CustomerTable";
import { CustomerFormDialog } from "@/components/kunden/CustomerFormDialog";

export const dynamic = "force-dynamic";

export default async function KundenPage() {
  const supabase = createServerClient();
  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return <p className="text-red-600">Fehler beim Laden der Kunden: {error.message}</p>;
  }

  const leads = (customers ?? []).filter((c) => c.status === "lead");
  const active = (customers ?? []).filter((c) => c.status === "active");
  const past = (customers ?? []).filter((c) => c.status === "past");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kundenmanagement</h1>
      </div>
      <Tabs defaultValue="lead">
        <TabsList>
          <TabsTrigger value="lead">Potenzielle Kunden ({leads.length})</TabsTrigger>
          <TabsTrigger value="active">Aktive Kunden ({active.length})</TabsTrigger>
          <TabsTrigger value="past">Vergangene Kunden ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="lead" className="space-y-4">
          <div className="flex justify-end">
            <CustomerFormDialog defaultStatus="lead" />
          </div>
          <CustomerTable customers={leads} />
        </TabsContent>
        <TabsContent value="active" className="space-y-4">
          <div className="flex justify-end">
            <CustomerFormDialog defaultStatus="active" />
          </div>
          <CustomerTable customers={active} />
        </TabsContent>
        <TabsContent value="past" className="space-y-4">
          <div className="flex justify-end">
            <CustomerFormDialog defaultStatus="past" />
          </div>
          <CustomerTable customers={past} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
