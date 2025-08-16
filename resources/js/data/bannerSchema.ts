import { z } from "zod";

export const bannerSchema = z.object({
  id: z.number(),
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  link: z.string().nullable(),
  is_active: z.boolean(),
  published_at: z.string().nullable(),
  image_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Banner = z.infer<typeof bannerSchema>;