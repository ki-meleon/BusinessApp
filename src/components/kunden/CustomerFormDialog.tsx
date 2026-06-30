"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { customerInputSchema, type CustomerInput } from "@/lib/validation/customer";
import { createCustomer } from "@/app/(protected)/kunden/actions";
import type { CustomerStatus } from "@/lib/supabase/types";

export function CustomerFormDialog({ defaultStatus }: { defaultStatus: CustomerStatus }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerInputSchema),
    defaultValues: { status: defaultStatus },
  });

  async function onSubmit(values: CustomerInput) {
    try {
      await createCustomer({ ...values, status: defaultStatus });
      toast.success("Kunde angelegt");
      reset();
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler beim Anlegen");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>Neuer Kunde</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neuen Kunden anlegen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="company">Firma</Label>
            <Input id="company" {...register("company")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="email">E-Mail</Label>
              <Input id="email" {...register("email")} />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" {...register("phone")} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" {...register("address")} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="source">Quelle</Label>
            <Input id="source" placeholder="z.B. Empfehlung, Website..." {...register("source")} />
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
