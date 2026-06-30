"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { z } from "zod";
import { offerInputSchema, type OfferInput } from "@/lib/validation/offer";
import { createOffer } from "@/app/(protected)/angebote/actions";
import type { OfferCategory } from "@/lib/supabase/types";

type OfferFormValues = z.input<typeof offerInputSchema>;

export function OfferFormDialog({ category }: { category: OfferCategory }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OfferFormValues, unknown, OfferInput>({
    resolver: zodResolver(offerInputSchema),
    defaultValues: { category, price_cents: 0 },
  });

  async function onSubmit(values: OfferInput) {
    try {
      await createOffer({ ...values, category });
      toast.success("Angebot angelegt");
      reset({ category, price_cents: 0 });
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Anlegen");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        Neues {category === "schulung" ? "Schulungspaket" : "Beratungspaket"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Neues {category === "schulung" ? "Schulungspaket" : "Beratungspaket"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea id="description" {...register("description")} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="price_cents">Preis (in Cent)</Label>
            <Input id="price_cents" type="number" min={0} {...register("price_cents")} />
            {errors.price_cents && (
              <p className="text-sm text-red-600">{errors.price_cents.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Speichern..." : "Anlegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
