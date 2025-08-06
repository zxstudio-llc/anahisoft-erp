import { z } from "zod";

export const paginationSchema = z.object({
  current_page: z.number(),
  last_page: z.number(),
  per_page: z.number(),
  total: z.number(),
});

export const galleryFilterSchema = z.object({
  search: z.string().optional(),
  layout: z.string().optional(),
  sort_by: z.enum(["created_at", "updated_at", "layout_type"]).optional(),
  sort_direction: z.enum(["asc", "desc"]).optional(),
  per_page: z.number().min(1).max(100).default(15),
});

export const mediaFilterSchema = z.object({
  search: z.string().optional(),
  mime_type: z.string().optional(),
  collection: z.string().optional(),
  type: z.enum(["attached", "unattached"]).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  user_id: z.number().optional(),
  sort_by: z.string().optional(),
  sort_direction: z.enum(["asc", "desc"]).optional(),
  per_page: z.number().min(1).max(100).default(15),
  with_trashed: z.boolean().optional(),
  only_trashed: z.boolean().optional(),
});