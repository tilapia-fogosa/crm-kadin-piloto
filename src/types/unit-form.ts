
import { z } from "zod";

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
] as const;

export const unitFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  street: z.string().min(1, "Endereço é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.enum(brazilianStates, {
    errorMap: () => ({ message: "Estado inválido" })
  }),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  postalCode: z.string().min(1, "CEP é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
});

export type UnitFormData = z.infer<typeof unitFormSchema>;
