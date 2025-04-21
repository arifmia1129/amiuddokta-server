import { z } from "zod";

export const centerFilterSchema = z.object({
  search: z.string().optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  center_type: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});
