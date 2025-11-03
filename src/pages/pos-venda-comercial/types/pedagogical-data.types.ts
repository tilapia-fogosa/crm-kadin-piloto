/**
 * LOG: Tipos TypeScript para dados pedagógicos
 * Define estruturas de dados para formulário e API
 */

// LOG: Interface para turma com professor
export interface TurmaWithProfessor {
  turma_id: string;
  turma_nome: string;
  turma_sala?: string;
  turma_dia_semana: string;
  turma_active: boolean;
  professor_id: string;
  professor_nome: string;
}

// LOG: Interface para dados pedagógicos
export interface PedagogicalData {
  turma_id?: string;
  data_aula_inaugural?: string; // ISO date string
  informacoes_onboarding?: string;
}

// LOG: Interface para slot de aula inaugural (retorno da RPC)
// CORREÇÃO: Campos atualizados para corresponder ao retorno da função SQL
export interface AulaInauguralSlot {
  slot_inicio: string;
  slot_fim: string;
  professor_id: string;
  professor_nome: string;
  prioridade: number;
  sala_id: string;
  sala_nome: string;
}

// LOG: Interface para dados completos de aula inaugural selecionada
export interface AulaInauguralCompleta {
  data: Date;
  horario_inicio: string;
  horario_fim: string;
  professor_id: string;
  sala_id: string;
}

// LOG: Interface para formulário (com validação e aula inaugural)
export interface PedagogicalFormData {
  turma_id: string;
  data_aula_inaugural: Date;
  informacoes_onboarding: string;
  
  // Dados da aula inaugural (preenchidos pelo scheduler)
  aula_inaugural_professor_id?: string;
  aula_inaugural_sala_id?: string;
  aula_inaugural_horario_inicio?: string;
  aula_inaugural_horario_fim?: string;
}
