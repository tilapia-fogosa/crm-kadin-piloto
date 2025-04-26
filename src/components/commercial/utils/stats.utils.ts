
import { TotalStats } from "../../kanban/types/activity-dashboard.types";
import { BaseStats } from "../types/stats.types";

export const calculateTotals = (stats: BaseStats[] | undefined): TotalStats | null => {
  if (!stats) return null;
  
  console.log('Calculando totais para estatísticas comerciais');
  
  // First calculate raw totals
  const rawTotals = stats.reduce((acc, day) => ({
    newClients: acc.newClients + day.newClients,
    contactAttempts: acc.contactAttempts + day.contactAttempts,
    effectiveContacts: acc.effectiveContacts + day.effectiveContacts,
    scheduledVisits: acc.scheduledVisits + day.scheduledVisits,
    awaitingVisits: acc.awaitingVisits + day.awaitingVisits,
    completedVisits: acc.completedVisits + day.completedVisits,
    enrollments: acc.enrollments + day.enrollments
  }), {
    newClients: 0,
    contactAttempts: 0,
    effectiveContacts: 0,
    scheduledVisits: 0,
    awaitingVisits: 0,
    completedVisits: 0,
    enrollments: 0
  });

  // Then calculate percentages based on final totals
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

  console.log('Totais calculados:', totals);
  return totals;
};
