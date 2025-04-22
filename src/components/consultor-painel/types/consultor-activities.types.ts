
/**
 * Interface para os dados de atividades diárias
 */
export interface DailyActivityData {
  dia: string;
  tentativa_contato: number;
  contato_efetivo: number;
  atendimento_agendado: number;
  atendimento_realizado: number;
  matriculas: number;
}

/**
 * Interface para os dados recebidos da API
 */
export interface ApiDailyActivityData {
  dia: string;
  tentativa_contato: number | null;
  contato_efetivo: number | null;
  atendimento_agendado: number | null;
  atendimento_realizado: number | null;
  matriculas: number | null;
}
