import { z } from "zod";

export const bingoCardSchema = z.object({
  id: z.number().optional(),
  user_id: z.number(),
  invoice_id: z.number().optional().nullable(),
  table_number: z.union([z.number(), z.string().transform(Number)]), // Acepta number o string convertido a number
  validation_code: z.string(),
  game_id: z.number(),
  card_1: z.array(z.array(z.union([z.string(), z.number()]))),
  card_2: z.array(z.array(z.union([z.string(), z.number()]))),
  card_3: z.array(z.array(z.union([z.string(), z.number()]))),
  card_4: z.array(z.array(z.union([z.string(), z.number()]))),
  card_5: z.array(z.array(z.union([z.string(), z.number()]))),
  card_6: z.array(z.array(z.union([z.string(), z.number()]))),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  // Relaciones
  user: z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    dni: z.string().optional(),
  }).optional(),
  game: z.object({
    id: z.number(),
    game_number: z.string(),
    status: z.string(),
    end_time: z.string(),
  }).optional(),
  invoice: z.object({
    id: z.number(),
    invoice_number: z.string(),
  }).optional().nullable(),
  // Campos adicionales para compatibilidad
  customer: z.object({
    first_name: z.string(),
    last_name: z.string(),
    dni: z.string().optional(),
  }).optional(),
});

export type BingoCard = z.infer<typeof bingoCardSchema>;