
import { z } from "zod";

export const unitFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  street: z.string().min(1, "Endereço é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  postalCode: z.string().min(1, "CEP é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
});

export type UnitFormData = z.infer<typeof unitFormSchema>;
