import { Role } from "@/types";
import { z } from "zod";
import { roleSchema } from "./roleSchema";

export interface Admin {
  id: number;
  first_name: string;
  last_name: string;
  dni: string;
  email: string;
  user_type: string;
  roles: Role[];
  created_at: string;
  updated_at: string;
  email_verified_at: string | null;
}

// Schema de validación
export const adminUserSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  dni: z.string(),
  email: z.string(),
  user_type: z.string(),
  roles: z.array(roleSchema),
  created_at: z.string(),
  updated_at: z.string(),
  email_verified_at: z.string().nullable()
});

export type AdminUser = z.infer<typeof adminUserSchema>;