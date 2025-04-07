
import { DailyStats, TotalStats } from "../types/activity-dashboard.types";

export const calculateTotals = (stats: DailyStats[] | undefined): TotalStats | null => {
  if (!stats) return null;
  
  console.log('Calculando totais para activity dashboard stats');
  
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

  console.log('Totals calculated:', totals);
  return totals;
};

// Função utilitária para calcular a progressão máxima de um cliente
// com base em suas atividades
export const getClientMaxProgression = (activities: any[] = []) => {
  // Log inicial para rastreamento
  console.log(`Analisando ${activities.length} atividades para determinar progressão máxima`);
  
  // Define resultado padrão (nenhuma progressão)
  let result = {
    hasEffectiveContact: false,
    hasScheduledVisit: false,
    hasCompletedVisit: false,
    hasEnrollment: false
  };
  
  // Se não há atividades, retorna padrão
  if (!activities || activities.length === 0) {
    return result;
  }
  
  // Analisa cada atividade para determinar a progressão máxima
  activities.forEach(activity => {
    const tipo = activity.tipo_atividade;
    
    // Verifica cada tipo de atividade e marca na progressão
    if (['Contato Efetivo', 'Agendamento', 'Atendimento', 'Matrícula'].includes(tipo)) {
      result.hasEffectiveContact = true;
    }
    
    if (['Agendamento', 'Atendimento', 'Matrícula'].includes(tipo)) {
      result.hasScheduledVisit = true;
    }
    
    if (['Atendimento', 'Matrícula'].includes(tipo)) {
      result.hasCompletedVisit = true;
    }
    
    if (tipo === 'Matrícula') {
      result.hasEnrollment = true;
    }
  });
  
  // Log final para depuração
  console.log("Progressão máxima determinada:", result);
  
  return result;
};
