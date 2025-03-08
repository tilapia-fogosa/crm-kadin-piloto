
import { DailyStats, TotalStats } from "../types/activity-dashboard.types";

export const calculateTotals = (stats: DailyStats[] | undefined): TotalStats | null => {
  if (!stats) return null;
  
  return stats.reduce((acc, day) => ({
    newClients: acc.newClients + day.newClients,
    contactAttempts: acc.contactAttempts + day.contactAttempts,
    effectiveContacts: acc.effectiveContacts + day.effectiveContacts,
    scheduledVisits: acc.scheduledVisits + day.scheduledVisits,
    awaitingVisits: acc.awaitingVisits + day.awaitingVisits,
    completedVisits: acc.completedVisits + day.completedVisits,
    enrollments: acc.enrollments + day.enrollments,
    ceConversionRate: acc.contactAttempts > 0 ? (acc.effectiveContacts / acc.contactAttempts) * 100 : 0,
    agConversionRate: acc.effectiveContacts > 0 ? (acc.scheduledVisits / acc.effectiveContacts) * 100 : 0,
    atConversionRate: acc.awaitingVisits > 0 ? (acc.completedVisits / acc.awaitingVisits) * 100 : 0,
  }), {
    newClients: 0,
    contactAttempts: 0,
    effectiveContacts: 0,
    scheduledVisits: 0,
    awaitingVisits: 0,
    completedVisits: 0,
    enrollments: 0,
    ceConversionRate: 0,
    agConversionRate: 0,
    atConversionRate: 0,
  });
};
