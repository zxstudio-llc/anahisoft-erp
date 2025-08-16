import { z } from "zod";

export const promoSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  mechanic: z.string(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  restrictions: z.string().nullable(),
  prize_type: z.enum(['cash', 'coupon', 'product', 'service', 'other']),
  prize_value: z.string(),
  stock: z.number(),
  status: z.enum(['pending', 'approved', 'rejected']),
  image_path: z.string().nullable(),
  terms_conditions: z.string().nullable(),
  provider_id: z.number().nullable(),
  provider_name: z.string().nullable(),
  can_edit: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable()
});

export type Promotion = z.infer<typeof promoSchema>;