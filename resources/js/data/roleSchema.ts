import { z } from "zod";

export const roleSchema = z.object({
  id: z.number(),
  name: z.string(),
  users_count: z.number(),
  guard_name: z.string().optional().default('web'),
  permissions: z.array(z.string()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export type Role = z.infer<typeof roleSchema>;