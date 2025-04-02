
import { z } from "zod";

// Updated regex to accept international format (+55) and 10-11 digits
export const phoneRegex = /^\+?(?:55)?(?:\d{10,11})$/;

// Comment explaining the phone number format validation
// Accepts:
// - Numbers with 10-11 digits (DDD + number)
// - Optional +55 prefix
// - Numbers coming from marketing with +55 prefix
export const leadFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phoneNumber: z.string()
    .regex(phoneRegex, "Telefone deve conter DDD + número (formato local ou internacional +55)")
    .min(10, "Telefone inválido")
    .max(13, "Telefone inválido"),
  leadSource: z.string().min(1, "Origem do lead é obrigatória"),
  observations: z.string().optional(),
  ageRange: z.string().optional(),
  metaId: z.string().optional(),
  originalAd: z.string().optional(),
  originalAdset: z.string().optional(),
  // Changed to explicitly allow empty string or valid email
  email: z.union([z.literal(''), z.string().email("Email inválido")]).optional(),
  unitId: z.string().min(1, "Unidade é obrigatória"),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;
