
import { DailyStats } from "../../types/activity-dashboard.types";
import { format } from "date-fns";
import { getUTCDateOnly } from "@/utils/dateUtils";

/**
 * Agrupa atividades por dia e calcula estatísticas
 * @param date Data base para agrupamento
 * @param activities Lista de atividades
 * @param newClients Lista de novos clientes
 * @param scheduledClients Lista de clientes com visitas agendadas
 * @returns Estatísticas diárias calculadas
 */
export const processDailyStats = (
  date: Date,
  activities: any[],
  newClients: any[],
  scheduledClients: any[]
): DailyStats => {
  // Log inicial com data formatada para legibilidade
  const dateStr = format(date, 'yyyy-MM-dd');
  console.log(`[STATS PROCESSOR] Processando estatísticas para ${dateStr}`);
  
  // Normalizar a data de referência para comparações consistentes
  const normalizedRefDate = getUTCDateOnly(date);
  
  // 1. Processar novos clientes do dia (baseado no created_at do cliente)
  const dayClients = newClients.filter(client => {
    if (!client?.created_at) return false;
    
    try {
      const clientDate = new Date(client.created_at);
      const normalizedClientDate = getUTCDateOnly(clientDate);
      return normalizedClientDate.getTime() === normalizedRefDate.getTime();
    } catch (error) {
      console.error(`[STATS PROCESSOR] Erro ao processar data do cliente:`, error);
      return false;
    }
  });

  // 2. Processar atividades do dia (baseado no created_at da atividade)
  const dayActivities = activities.filter(activity => {
    if (!activity?.created_at) return false;
    
    try {
      const activityDate = new Date(activity.created_at);
      const normalizedActivityDate = getUTCDateOnly(activityDate);
      return normalizedActivityDate.getTime() === normalizedRefDate.getTime();
    } catch (error) {
      console.error(`[STATS PROCESSOR] Erro ao processar data da atividade:`, error);
      return false;
    }
  });

  // 3. Processar visitas aguardadas (baseado no scheduled_date do cliente)
  const dayAwaitingVisits = scheduledClients.filter(client => {
    if (!client?.scheduled_date) return false;
    
    try {
      const scheduledDate = new Date(client.scheduled_date);
      const normalizedScheduledDate = getUTCDateOnly(scheduledDate);
      return normalizedRefDate.getTime() === normalizedScheduledDate.getTime();
    } catch (error) {
      console.error(`[STATS PROCESSOR] Erro ao processar data agendada:`, error);
      return false;
    }
  });

  // Calcular estatísticas baseadas nas atividades
  const contactAttempts = dayActivities.filter(activity => 
    ['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
  ).length;
  
  const effectiveContacts = dayActivities.filter(activity => 
    ['Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
  ).length;
  
  const scheduledVisits = dayActivities.filter(activity => 
    activity.tipo_atividade === 'Agendamento'
  ).length;
  
  const awaitingVisits = dayAwaitingVisits.length;
  
  const completedVisits = dayActivities.filter(activity => 
    activity.tipo_atividade === 'Atendimento'
  ).length;
  
  const enrollments = dayActivities.filter(activity => 
    activity.tipo_atividade === 'Matrícula'
  ).length;

  // Cálculo de taxas com proteção contra divisão por zero
  const ceConversionRate = contactAttempts > 0 
    ? (effectiveContacts / contactAttempts) * 100 
    : 0;

  const agConversionRate = effectiveContacts > 0 
    ? (scheduledVisits / effectiveContacts) * 100 
    : 0;

  const atConversionRate = awaitingVisits > 0 
    ? (completedVisits / awaitingVisits) * 100 
    : 0;

  const maConversionRate = completedVisits > 0 
    ? (enrollments / completedVisits) * 100 
    : 0;

  // Log detalhado das estatísticas calculadas
  console.log(`[STATS PROCESSOR] Estatísticas para ${dateStr}:`, {
    newClients: dayClients.length,
    contactAttempts,
    effectiveContacts,
    scheduledVisits,
    awaitingVisits,
    completedVisits,
    enrollments,
    ceConversionRate: ceConversionRate.toFixed(1) + '%',
    agConversionRate: agConversionRate.toFixed(1) + '%',
    atConversionRate: atConversionRate.toFixed(1) + '%',
    maConversionRate: maConversionRate.toFixed(1) + '%'
  });

  // Retornar objeto com as estatísticas calculadas
  return {
    date,
    newClients: dayClients.length,
    contactAttempts,
    effectiveContacts,
    scheduledVisits,
    awaitingVisits,
    completedVisits,
    enrollments,
    ceConversionRate,
    agConversionRate,
    atConversionRate,
    maConversionRate
  };
};
