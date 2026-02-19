
import { z } from "zod";

export interface Unit {
  id: string;
  name: string;
  city: string;
}

export interface UnitUser {
  unit_id: string;
  role: 'consultor' | 'franqueado' | 'admin' | 'educador' | 'gestor_pedagogico' | 'financeiro' | 'administrativo' | 'estagiario' | 'sala' | 'sdr';
  active: boolean;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  access_blocked: boolean;
  email_confirmed: boolean;
}

export const userFormSchema = z.object({
  full_name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  unitIds: z.array(z.string()).min(1, "Selecione pelo menos uma unidade"),
  role: z.enum(['consultor', 'franqueado', 'admin', 'educador', 'gestor_pedagogico', 'financeiro', 'administrativo', 'estagiario', 'sala', 'sdr']),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
