/**
 * Configuração de cores e siglas para cada status do funil
 * 
 * Log: Mapeamento dos status do banco para exibição visual
 * - Cada status possui uma sigla de 2 letras
 * - Cores definidas usando classes Tailwind
 * - Label para tooltip/acessibilidade
 */

export const STATUS_CONFIG: Record<string, { sigla: string; cor: string; label: string }> = {
  'novo-cadastro':       { sigla: 'NC', cor: 'bg-blue-500',    label: 'Novo Cadastro' },
  'tentativa-contato':   { sigla: 'TC', cor: 'bg-amber-500',   label: 'Tentativa de Contato' },
  'contato-efetivo':     { sigla: 'CE', cor: 'bg-green-500',   label: 'Contato Efetivo' },
  'atendimento-agendado':{ sigla: 'AG', cor: 'bg-purple-500',  label: 'Agendamento' },
  'negociacao':          { sigla: 'NG', cor: 'bg-orange-500',  label: 'Negociação' },
  'matriculado':         { sigla: 'MT', cor: 'bg-emerald-600', label: 'Matriculado' },
  'perdido':             { sigla: 'PD', cor: 'bg-gray-400',    label: 'Perdido' },
};

/**
 * Retorna a configuração de um status específico
 * 
 * Log: Se o status não for encontrado, retorna valores default
 * @param status - O status do cliente no funil
 * @returns Objeto com sigla, cor e label
 */
export function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] || { sigla: '??', cor: 'bg-muted', label: status };
}
