"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Database } from "@/lib/supabase/types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];

export function CustomerTable({ customers }: { customers: Customer[] }) {
  if (customers.length === 0) {
    return <p className="text-sm text-zinc-500 py-6">Keine Kunden in dieser Kategorie.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Firma</TableHead>
          <TableHead>E-Mail</TableHead>
          <TableHead>Telefon</TableHead>
          <TableHead>Status seit</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((c) => (
          <TableRow key={c.id} className="cursor-pointer hover:bg-zinc-50">
            <TableCell>
              <Link href={`/kunden/${c.id}`} className="font-medium hover:underline">
                {c.name}
              </Link>
            </TableCell>
            <TableCell>{c.company || "—"}</TableCell>
            <TableCell>{c.email || "—"}</TableCell>
            <TableCell>{c.phone || "—"}</TableCell>
            <TableCell>{new Date(c.status_changed_at).toLocaleDateString("de-DE")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
