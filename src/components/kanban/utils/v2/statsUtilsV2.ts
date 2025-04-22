
import { DailyStatsV2, TotalStatsV2 } from "../../types/v2/activity-dashboard-v2.types";

/**
 * Calcula estatísticas totais a partir de estatísticas diárias
 * @param stats Array de estatísticas diárias
 * @returns Objeto com totais ou null se não houver dados
 */
export const calculateTotalsV2 = (stats: DailyStatsV2[] | undefined): TotalStatsV2 | null => {
  // Validação de entrada
  if (!stats || stats.length === 0) {
    console.log('[V2] Sem dados para calcular totais');
    return null;
  }
  
  console.log(`[V2] Calculando totais para ${stats.length} dias`);
  
  // Calcular totais iniciais
  const rawTotals = stats.reduce((acc, day) => {
    return {
      newClients: acc.newClients + day.newClients,
      contactAttempts: acc.contactAttempts + day.contactAttempts,
      effectiveContacts: acc.effectiveContacts + day.effectiveContacts,
      scheduledVisits: acc.scheduledVisits + day.scheduledVisits,
      awaitingVisits: acc.awaitingVisits + day.awaitingVisits,
      completedVisits: acc.completedVisits + day.completedVisits,
      enrollments: acc.enrollments + day.enrollments
    };
  }, {
    newClients: 0,
    contactAttempts: 0,
    effectiveContacts: 0,
    scheduledVisits: 0,
    awaitingVisits: 0,
    completedVisits: 0,
    enrollments: 0
  });

  // Calcular porcentagens com proteção contra divisão por zero
  const totals: TotalStatsV2 = {
    ...rawTotals,
    ceConversionRate: rawTotals.contactAttempts > 0 
      ? (rawTotals.effectiveContacts / rawTotals.contactAttempts) * 100 
      : 0,
    agConversionRate: rawTotals.effectiveContacts > 0 
      ? (rawTotals.scheduledVisits / rawTotals.effectiveContacts) * 100 
      : 0,
    atConversionRate: rawTotals.awaitingVisits > 0 
      ? (rawTotals.completedVisits / rawTotals.awaitingVisits) * 100 
      : 0,
    maConversionRate: rawTotals.completedVisits > 0
      ? (rawTotals.enrollments / rawTotals.completedVisits) * 100
      : 0
  };

  // Log com valores calculados
  console.log('[V2] Totais calculados:', {
    ...totals,
    ceConversionRate: totals.ceConversionRate.toFixed(1) + '%',
    agConversionRate: totals.agConversionRate.toFixed(1) + '%',
    atConversionRate: totals.atConversionRate.toFixed(1) + '%',
    maConversionRate: totals.maConversionRate.toFixed(1) + '%'
  });
  
  return totals;
};
