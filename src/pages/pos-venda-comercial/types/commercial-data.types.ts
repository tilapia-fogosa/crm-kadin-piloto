/**
 * LOG: Definindo tipos TypeScript para dados comerciais pós-venda
 * Seguindo boas práticas de tipagem forte e reutilização
 */

import { Database } from "@/integrations/supabase/types";

// Alias para PaymentMethod do banco
export type PaymentMethod = Database["public"]["Enums"]["payment_method"];

/**
 * Interface para dados comerciais completos
 * Todos os campos são opcionais para permitir salvamento incremental
 * LOG: Estrutura espelhada das colunas adicionadas na migração
 */
export interface CommercialData {
  // Kit Type
  kit_type_id?: string;
  kit_type_name?: string;

  // Matrícula
  enrollment_amount?: number;
  enrollment_payment_date?: string;
  enrollment_payment_method?: PaymentMethod;
  enrollment_installments?: number;

  // Mensalidade  
  monthly_fee_amount?: number;
  first_monthly_fee_date?: string;
  monthly_fee_payment_method?: PaymentMethod;

  // Material
  material_amount?: number;
  material_payment_date?: string;
  material_payment_method?: PaymentMethod;
  material_installments?: number;

  // Observações
  observations?: string;
}

/**
 * Interface para Kit Types disponíveis
 * LOG: Estrutura baseada na tabela kit_types existente
 */
export interface KitType {
  id: string;
  name: string;
  description?: string;
  unit_id: string;
  active: boolean;
}

/**
 * Interface para dados do formulário de dados comerciais
 * LOG: Estrutura para react-hook-form com validações
 */
export interface CommercialFormData extends CommercialData {
  // Campos adicionais para controle do formulário se necessário
}

/**
 * Interface para status de completude dos dados comerciais
 * LOG: Usado para verificar se todos os campos obrigatórios foram preenchidos
 */
export interface CommercialDataStatus {
  isComplete: boolean;
  missingFields?: string[];
}