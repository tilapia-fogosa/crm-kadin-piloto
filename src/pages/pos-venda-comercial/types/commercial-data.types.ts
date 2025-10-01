/**
 * LOG: Definindo tipos TypeScript para dados comerciais pós-venda
 * Seguindo boas práticas de tipagem forte e reutilização
 */

import { Database } from "@/integrations/supabase/types";

// Alias para PaymentMethod do banco
export type PaymentMethod = Database["public"]["Enums"]["payment_method"];

// ENUM para Kit Type conforme especificação
export type KitType = 'kit_1' | 'kit_2' | 'kit_3' | 'kit_4' | 'kit_5' | 'kit_6' | 'kit_7' | 'kit_8';

/**
 * Interface para dados comerciais completos
 * Todos os campos são opcionais para permitir salvamento incremental
 * LOG: Estrutura atualizada para usar ENUM kit_type
 */
export interface CommercialData {
  // Kit Type (ENUM)
  kit_type?: KitType;

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

  // Confirmações de Pagamento
  enrollment_payment_confirmed?: boolean;
  material_payment_confirmed?: boolean;
}

/**
 * Constante com os kit types disponíveis
 * LOG: Array estático dos kits 1-8 para uso no formulário
 */
export const KIT_TYPE_OPTIONS = [
  { value: 'kit_1' as KitType, label: 'Kit 1' },
  { value: 'kit_2' as KitType, label: 'Kit 2' },
  { value: 'kit_3' as KitType, label: 'Kit 3' },
  { value: 'kit_4' as KitType, label: 'Kit 4' },
  { value: 'kit_5' as KitType, label: 'Kit 5' },
  { value: 'kit_6' as KitType, label: 'Kit 6' },
  { value: 'kit_7' as KitType, label: 'Kit 7' },
  { value: 'kit_8' as KitType, label: 'Kit 8' }
] as const;

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