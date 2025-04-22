
import { DailyStats, TotalStats } from "../types/activity-dashboard.types";
import { format } from "date-fns";

/**
 * Calcula estatísticas totais a partir de estatísticas diárias
 * @param stats Array de estatísticas diárias
 * @returns Objeto com totais ou null se não houver dados
 */
export const calculateTotals = (stats: DailyStats[] | undefined): TotalStats | null => {
  if (!stats || stats.length === 0) {
    console.log('[STATS] Sem dados para calcular totais');
    return null;
  }

  console.log(`[STATS] Calculando totais para ${stats.length} dias`);

  // Garante uso de zero para campos ausentes ou não numéricos
  const asNumber = (value: any) => Number.isFinite(value) ? value : 0;

  const validStats = stats.filter(day => day !== null && day !== undefined);

  if (validStats.length === 0) {
    console.log('[STATS] Nenhum dia válido para totais');
    return null;
  }

  const rawTotals = validStats.reduce((acc, day) => {
    // Força a soma de números apenas
    const add = (a: any, b: any) => asNumber(a) + asNumber(b);
    return {
      newClients: add(acc.newClients, day.newClients),
      contactAttempts: add(acc.contactAttempts, day.contactAttempts),
      effectiveContacts: add(acc.effectiveContacts, day.effectiveContacts),
      scheduledVisits: add(acc.scheduledVisits, day.scheduledVisits),
      awaitingVisits: add(acc.awaitingVisits, day.awaitingVisits),
      completedVisits: add(acc.completedVisits, day.completedVisits),
      enrollments: add(acc.enrollments, day.enrollments),
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

  // Log para inspeção dos totais
  console.log('[STATS] Totais brutos:', rawTotals);

  const totals: TotalStats = {
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

  console.log('[STATS] Totais finais:', totals);
  return totals;
};
