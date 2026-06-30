import { z } from "zod";

export const customerStatusSchema = z.enum(["lead", "active", "past"]);

export const customerInputSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  company: z.string().optional().or(z.literal("")),
  email: z.string().email("Ungültige E-Mail").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  source: z.string().optional().or(z.literal("")),
  status: customerStatusSchema,
});

export type CustomerInput = z.infer<typeof customerInputSchema>;
