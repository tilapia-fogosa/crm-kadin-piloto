
import { z } from "zod";

export const unitFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  company_name: z.string().min(1, "Razão social é obrigatória"),
  cnpj: z.string().min(1, "CNPJ é obrigatório"),
  trading_name: z.string().optional(),
  region_id: z.string().min(1, "Região é obrigatória"),
  enrollment_fee: z.number().min(0, "Valor deve ser maior ou igual a zero"),
  material_fee: z.number().min(0, "Valor deve ser maior ou igual a zero"),
  monthly_fee: z.number().min(0, "Valor deve ser maior ou igual a zero"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  legal_representative: z.string().optional(),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  postal_code: z.string().min(1, "CEP é obrigatório"),
});

export type UnitFormData = z.infer<typeof unitFormSchema>;
