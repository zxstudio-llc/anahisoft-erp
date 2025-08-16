import { z } from "zod";

export const promoSchema = z.object({
  id: z.number(),
  code: z.string(),
  description: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  max_uses: z.number().nullable(),
  current_uses: z.number(),
  is_active: z.boolean(),
  status: z.enum(['pending', 'approved', 'rejected']),
  provider_id: z.number().nullable(), // Cambiado a nullable
  provider_name: z.string().nullable(),
  can_edit: z.boolean()
});

export type PromoCode = z.infer<typeof promoSchema>;