/**
 * Tipos para o painel de produtividade do usuário
 * 
 * @description
 * Define as interfaces para estatísticas de produtividade
 * calculadas por período (Dia, 3D, 7D, 15D)
 */

export interface PeriodStats {
  day1: number;    // Média do dia atual
  day3: number;    // Média dos últimos 3 dias
  day7: number;    // Média dos últimos 7 dias
  day15: number;   // Média dos últimos 15 dias
}

export interface ProductivityStats {
  tentativaContato: PeriodStats;
  contatoEfetivo: PeriodStats;
  agendamento: PeriodStats;
  atendimento: PeriodStats;
}
