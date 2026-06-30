import { z } from "zod";

export const sectionInputSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  description: z.string().optional().or(z.literal("")),
});
export type SectionInput = z.infer<typeof sectionInputSchema>;

export const topicInputSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  description: z.string().optional().or(z.literal("")),
});
export type TopicInput = z.infer<typeof topicInputSchema>;
