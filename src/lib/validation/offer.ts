import { z } from "zod";

export const offerCategorySchema = z.enum(["schulung", "beratung"]);

export const offerInputSchema = z.object({
  category: offerCategorySchema,
  name: z.string().min(1, "Name ist erforderlich"),
  description: z.string().optional().or(z.literal("")),
  price_cents: z.coerce.number().int().min(0, "Preis darf nicht negativ sein"),
});

export type OfferInput = z.infer<typeof offerInputSchema>;

export const offerItemInputSchema = z.object({
  label: z.string().min(1, "Bezeichnung ist erforderlich"),
  topic_id: z.string().uuid().optional().nullable(),
});

export type OfferItemInput = z.infer<typeof offerItemInputSchema>;
