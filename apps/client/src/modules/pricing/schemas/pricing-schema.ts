import { z } from "zod";

export const pricingSchema = z.object({
  planSlug: z.string().min(1, { message: "Please select a plan" }),
  isCurrency: z.boolean().default(false),
});

export type PricingSchemaType = z.infer<typeof pricingSchema>;
