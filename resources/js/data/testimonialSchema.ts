import { z } from "zod";

export const testimonialSchema = z.object({
  id: z.number(),
  name: z.string(),
  position: z.string().nullable(),
  message: z.string(),
  photo: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Testimonial = z.infer<typeof testimonialSchema>;