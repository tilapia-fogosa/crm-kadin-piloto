/**
 * LOG: Tipos TypeScript para o sistema de comissões
 * DESCRIÇÃO: Define interfaces e tipos para fórmulas, cálculos e detalhes de vendas
 */

// Tipo para configuração de variáveis da fórmula
export interface FormulaVariableConfig {
  Matricula: {
    field: 'enrollment_amount';
    requires_confirmation: true;
  };
  Material: {
    field: 'material_amount';
    requires_confirmation: true;
  };
  Mensalidade: {
    field: 'monthly_fee_amount';
    requires_confirmation: false;
  };
  Meta: {
    type: 'constant';
    value: number;
  };
  Vendas: {
    type: 'calculated';
    description: 'Número de vendas';
  };
}

// Interface para fórmula de comissão
export interface CommissionFormula {
  id: string;
  unit_id: string;
  formula_name: string;
  formula_expression: string; // Ex: "(Matricula * 0.1) + (Material * 0.05)"
  variables_config: Partial<FormulaVariableConfig>;
  active: boolean;
  valid_from: string; // Date em formato ISO
  valid_until: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Interface para cálculo consolidado mensal
export interface CommissionCalculation {
  id: string;
  unit_id: string;
  consultant_id: string;
  month: string; // Formato "YYYY-MM"
  formula_id: string | null;
  total_sales: number;
  total_commission: number;
  is_consolidated: boolean;
  consolidated_at: string | null;
  consolidated_by: string | null;
  details: {
    formula_name?: string;
    formula_expression?: string;
    calculated_at?: string;
  };
  created_at: string;
  updated_at: string;
}

// Interface para detalhe de venda individual
export interface CommissionSaleDetail {
  id: string;
  calculation_id: string;
  activity_id: string;
  client_name: string;
  enrollment_amount: number | null;
  material_amount: number | null;
  monthly_fee_amount: number | null;
  sale_commission: number;
  sale_date: string;
  created_at: string;
}

// Interface para resumo de comissão (retornado pela RPC)
export interface CommissionSummary extends CommissionCalculation {
  consultant_name: string;
  formula_name: string | null;
}

// Interface para filtros do dashboard
export interface CommissionFilters {
  unitId: string;
  consultantId?: string | null;
  startMonth?: string | null;
  endMonth?: string | null;
}

// Interface para resultado do cálculo (retorno da RPC)
export interface CalculationResult {
  calculation_id: string;
  month: string;
  total_sales: number;
  total_commission: number;
  formula_name: string;
}

// Tipo para operadores matemáticos suportados
export type FormulaOperator = '+' | '-' | '*' | '/' | '%' | '(' | ')';

// Tipo para variáveis disponíveis na fórmula
export type FormulaVariable = 'Matricula' | 'Material' | 'Mensalidade' | 'Vendas' | 'Meta';

// Interface para token do construtor de fórmula
export interface FormulaToken {
  type: 'variable' | 'operator' | 'number' | 'condition';
  value: string | number;
  display?: string;
}
