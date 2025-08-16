import { z } from "zod";

export const mediaSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  mime_type: z.string(),
  size: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  model_type: z.string().optional(),
  model_id: z.string().optional(),
  collection_name: z.string().optional(),
  custom_properties: z.record(z.any()).optional(),
});

export type Media = z.infer<typeof mediaSchema>;