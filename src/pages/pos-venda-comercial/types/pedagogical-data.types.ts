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

// LOG: Interface para formulário (com validação)
export interface PedagogicalFormData {
  turma_id: string;
  data_aula_inaugural: Date;
  informacoes_onboarding: string;
}
