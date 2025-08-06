import { z } from "zod";

export const newsSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  content: z.string().nullable(),
  published_at: z.string().nullable(),
  is_published: z.boolean(),
  image_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type News = z.infer<typeof newsSchema>;