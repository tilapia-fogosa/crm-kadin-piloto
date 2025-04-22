
/**
 * Interface para estatísticas diárias (versão 2)
 */
export interface DailyStatsV2 {
  date: Date;
  newClients: number;
  contactAttempts: number;
  effectiveContacts: number;
  ceConversionRate: number;
  scheduledVisits: number;
  agConversionRate: number;
  awaitingVisits: number;
  completedVisits: number;
  atConversionRate: number;
  enrollments: number;
  maConversionRate: number;
}

/**
 * Interface para estatísticas totais (versão 2)
 */
export interface TotalStatsV2 {
  newClients: number;
  contactAttempts: number;
  effectiveContacts: number;
  scheduledVisits: number;
  awaitingVisits: number;
  completedVisits: number;
  enrollments: number;
  ceConversionRate: number;
  agConversionRate: number;
  atConversionRate: number;
  maConversionRate: number;
}
