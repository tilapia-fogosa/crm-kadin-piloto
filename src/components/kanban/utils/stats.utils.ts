
import { DailyStats, TotalStats } from "../types/activity-dashboard.types";
import { format, isSameDay } from "date-fns";

/**
 * Calcula estatísticas totais a partir de estatísticas diárias
 * @param stats Array de estatísticas diárias
 * @returns Objeto com totais ou null se não houver dados
 */
export const calculateTotals = (stats: DailyStats[] | undefined): TotalStats | null => {
  // Validação de entrada
  if (!stats || stats.length === 0) {
    console.log('[STATS] Sem dados para calcular totais');
    return null;
  }
  
  console.log(`[STATS] Calculando totais para ${stats.length} dias`);
  
  // Calcular totais iniciais
  const rawTotals = stats.reduce((acc, day) => {
    // Validação extra para cada dia
    if (!day) return acc;
    
    // Log detalhado para depuração
    console.log(`[STATS] Processando dia ${format(day.date, 'dd/MM/yyyy')}:`, {
      newClients: day.newClients,
      contactAttempts: day.contactAttempts,
      effectiveContacts: day.effectiveContacts,
      enrollments: day.enrollments
    });
    
    return {
      newClients: acc.newClients + (day.newClients || 0),
      contactAttempts: acc.contactAttempts + (day.contactAttempts || 0),
      effectiveContacts: acc.effectiveContacts + (day.effectiveContacts || 0),
      scheduledVisits: acc.scheduledVisits + (day.scheduledVisits || 0),
      awaitingVisits: acc.awaitingVisits + (day.awaitingVisits || 0),
      completedVisits: acc.completedVisits + (day.completedVisits || 0),
      enrollments: acc.enrollments + (day.enrollments || 0)
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

  // Log para inspeção de valores brutos
  console.log('[STATS] Valores brutos calculados:', rawTotals);

  // Calcular porcentagens com proteção contra divisão por zero
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

  // Log final com todos os valores calculados
  console.log('[STATS] Totais calculados:', {
    ...totals,
    ceConversionRate: totals.ceConversionRate.toFixed(1) + '%',
    agConversionRate: totals.agConversionRate.toFixed(1) + '%',
    atConversionRate: totals.atConversionRate.toFixed(1) + '%',
    maConversionRate: totals.maConversionRate.toFixed(1) + '%'
  });
  
  return totals;
};

/**
 * Determina a progressão máxima de um cliente com base nas atividades
 * @param activities Array de atividades do cliente
 * @returns Objeto com status de progressão
 */
export const getClientMaxProgression = (activities: any[] = []) => {
  // Log inicial para rastreamento
  console.log(`[STATS] Analisando ${activities.length} atividades para progressão máxima`);
  
  // Define resultado padrão (nenhuma progressão)
  let result = {
    hasEffectiveContact: false,
    hasScheduledVisit: false,
    hasCompletedVisit: false,
    hasEnrollment: false
  };
  
  // Se não há atividades, retorna padrão
  if (!activities || activities.length === 0) {
    console.log('[STATS] Sem atividades para analisar');
    return result;
  }
  
  // Analisa cada atividade para determinar a progressão máxima
  activities.forEach(activity => {
    // Validação para garantir que a atividade tem tipo
    if (!activity || !activity.tipo_atividade) {
      console.log('[STATS] Atividade inválida encontrada');
      return;
    }
    
    const tipo = activity.tipo_atividade;
    console.log(`[STATS] Analisando atividade: ${tipo}`);
    
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
  console.log("[STATS] Progressão máxima determinada:", result);
  
  return result;
};
