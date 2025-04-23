
import { DailyStats, TotalStats } from "../types/activity-dashboard.types";
import { format } from "date-fns";

/**
 * Converte valor para número com validação e log
 */
const asNumber = (value: any, field: string): number => {
  // Se for undefined ou null
  if (value === undefined || value === null) {
    console.warn(`[STATS] Campo ${field} com valor nulo ou indefinido`);
    return 0;
  }

  // Se já for número, valida se é finito
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      console.warn(`[STATS] Campo ${field} com número inválido:`, value);
      return 0;
    }
    return value;
  }

  // Tenta converter para número
  const num = Number(value);
  if (isNaN(num)) {
    console.warn(`[STATS] Campo ${field} não pode ser convertido para número:`, value);
    return 0;
  }

  return num;
};

/**
 * Calcula estatísticas totais a partir de estatísticas diárias
 */
export const calculateTotals = (stats: DailyStats[] | undefined): TotalStats | null => {
  if (!stats || stats.length === 0) {
    console.log('[STATS] Sem dados para calcular totais');
    return null;
  }

  console.log(`[STATS] Calculando totais para ${stats.length} dias`);

  // Garante uso de zero para campos ausentes ou não numéricos
  const validStats = stats.filter(day => day !== null && day !== undefined);

  if (validStats.length === 0) {
    console.log('[STATS] Nenhum dia válido para totais');
    return null;
  }

  // Log detalhado por dia antes da soma
  validStats.forEach(day => {
    console.log(`[STATS] Valores do dia ${format(day.date, 'dd/MM/yyyy')}:`, {
      newClients: typeof day.newClients === 'number' ? day.newClients : `Inválido: ${day.newClients}`,
      contactAttempts: typeof day.contactAttempts === 'number' ? day.contactAttempts : `Inválido: ${day.contactAttempts}`,
      effectiveContacts: typeof day.effectiveContacts === 'number' ? day.effectiveContacts : `Inválido: ${day.effectiveContacts}`,
      scheduledVisits: typeof day.scheduledVisits === 'number' ? day.scheduledVisits : `Inválido: ${day.scheduledVisits}`,
      awaitingVisits: typeof day.awaitingVisits === 'number' ? day.awaitingVisits : `Inválido: ${day.awaitingVisits}`,
      completedVisits: typeof day.completedVisits === 'number' ? day.completedVisits : `Inválido: ${day.completedVisits}`,
      enrollments: typeof day.enrollments === 'number' ? day.enrollments : `Inválido: ${day.enrollments}`
    });
  });

  const rawTotals = validStats.reduce((acc, day) => ({
    newClients: asNumber(acc.newClients, 'newClients') + asNumber(day.newClients, 'newClients'),
    contactAttempts: asNumber(acc.contactAttempts, 'contactAttempts') + asNumber(day.contactAttempts, 'contactAttempts'),
    effectiveContacts: asNumber(acc.effectiveContacts, 'effectiveContacts') + asNumber(day.effectiveContacts, 'effectiveContacts'),
    scheduledVisits: asNumber(acc.scheduledVisits, 'scheduledVisits') + asNumber(day.scheduledVisits, 'scheduledVisits'),
    awaitingVisits: asNumber(acc.awaitingVisits, 'awaitingVisits') + asNumber(day.awaitingVisits, 'awaitingVisits'),
    completedVisits: asNumber(acc.completedVisits, 'completedVisits') + asNumber(day.completedVisits, 'completedVisits'),
    enrollments: asNumber(acc.enrollments, 'enrollments') + asNumber(day.enrollments, 'enrollments'),
  }), {
    newClients: 0,
    contactAttempts: 0,
    effectiveContacts: 0,
    scheduledVisits: 0,
    awaitingVisits: 0,
    completedVisits: 0,
    enrollments: 0
  });

  // Log dos totais brutos antes do cálculo das taxas
  console.log('[STATS] Totais brutos calculados:', rawTotals);

  // Calcula taxas com validação adicional
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

  // Log final dos totais com taxas
  console.log('[STATS] Totais finais com taxas calculadas:', totals);
  return totals;
};
