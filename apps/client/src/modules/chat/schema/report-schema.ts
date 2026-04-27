import { z } from "zod";

export const reportSchema = z.object({
  reportId: z.string().trim().min(1, "Report ID cannot be empty"),
});
