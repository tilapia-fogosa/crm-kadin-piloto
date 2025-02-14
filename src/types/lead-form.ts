
import { z } from "zod";

export const phoneRegex = /^\d{10,11}$/;

export const leadFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phoneNumber: z.string()
    .regex(phoneRegex, "Telefone deve conter apenas números (DDD + número)")
    .min(10, "Telefone inválido")
    .max(11, "Telefone inválido"),
  leadSource: z.string().min(1, "Origem do lead é obrigatória"),
  observations: z.string().optional(),
  ageRange: z.string().optional(),
  metaId: z.string().optional(),
  originalAd: z.string().optional(),
  originalAdset: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;
