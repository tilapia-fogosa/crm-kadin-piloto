
import { z } from "zod";

export const unitFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  company_name: z.string().min(1, "Razão social é obrigatória"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  trading_name: z.string().optional(),
  region_id: z.string().min(1, "Região é obrigatória"),
  enrollment_fee: z.coerce.number().min(0),
  material_fee: z.coerce.number().min(0),
  monthly_fee: z.coerce.number().min(0),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  legal_representative: z.string().optional(),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  postal_code: z.string().min(8, "CEP inválido"),
  unit_number: z.number().optional(),
});

export type UnitFormData = z.infer<typeof unitFormSchema>;
