import { z } from "zod";

export const mediaFormSchema = z.object({
  file: z.instanceof(File).optional(),
  name: z.string().min(1, "El nombre es requerido"),
  collection_name: z.string().default("default"),
  custom_properties: z.record(z.any()).optional(),
  external_url: z.string().url().optional(),
}).refine(
  (data) => data.file || data.external_url, 
  {
    message: "Debe subir un archivo o proporcionar una URL",
    path: ["file"]
  }
);

export type MediaFormValues = z.infer<typeof mediaFormSchema>;