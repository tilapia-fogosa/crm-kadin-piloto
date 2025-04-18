
import { DailyStats } from "../../types/activity-dashboard.types";
import { format } from "date-fns";
import { getUTCDateOnly, isSameLocalDate } from "@/utils/dateUtils";

/**
 * Agrupa atividades por dia e calcula estatísticas
 * @param date Data base para agrupamento
 * @param activities Lista de atividades
 * @param clients Lista de clientes
 * @returns Estatísticas diárias calculadas
 */
export const processDailyStats = (
  date: Date,
  activities: any[],
  clients: any[]
): DailyStats => {
  // Log inicial com data formatada para legibilidade
  const dateStr = format(date, 'yyyy-MM-dd');
  console.log(`[STATS] Processando estatísticas para ${dateStr} - data original: ${date.toISOString()}`);
  
  // Normalizar a data de referência para comparações consistentes
  const normalizedRefDate = getUTCDateOnly(date);
  console.log(`[STATS] Data de referência normalizada: ${normalizedRefDate.toISOString()}`);
  
  // Filtrar atividades do dia usando nossa função personalizada
  const dayActivities = activities.filter(activity => {
    if (!activity?.created_at) {
      console.log(`[STATS] Atividade sem data de criação encontrada`);
      return false;
    }
    
    try {
      const activityDate = new Date(activity.created_at);
      // Normalizar a data da atividade
      const normalizedActivityDate = getUTCDateOnly(activityDate);
      
      // Comparar as datas normalizadas
      const matches = normalizedRefDate.getTime() === normalizedActivityDate.getTime();
      
      // Log detalhado para atividades importantes
      if (matches || (activity.tipo_atividade === 'Matrícula')) {
        console.log(`[STATS] Atividade ID=${activity.id} tipo=${activity.tipo_atividade} data_original=${activityDate.toISOString()} data_normalizada=${normalizedActivityDate.toISOString()} ref_date=${normalizedRefDate.toISOString()} incluída=${matches ? 'SIM' : 'NÃO'} para ${dateStr}`);
      }
      
      return matches;
    } catch (error) {
      console.error(`[STATS] Erro ao processar data da atividade:`, error);
      return false;
    }
  });

  // Filtrar clientes criados no dia usando nossa função personalizada  
  const dayClients = clients.filter(client => {
    if (!client?.created_at) {
      console.log(`[STATS] Cliente sem data de criação encontrado`);
      return false;
    }
    
    try {
      const clientDate = new Date(client.created_at);
      // Normalizar a data do cliente
      const normalizedClientDate = getUTCDateOnly(clientDate);
      
      // Comparar as datas normalizadas
      const matches = normalizedRefDate.getTime() === normalizedClientDate.getTime();
      
      if (matches) {
        console.log(`[STATS] Cliente ID=${client.id} nome=${client.name} data_original=${clientDate.toISOString()} data_normalizada=${normalizedClientDate.toISOString()} incluído para ${dateStr}`);
      }
      
      return matches;
    } catch (error) {
      console.error(`[STATS] Erro ao processar data do cliente:`, error);
      return false;
    }
  });

  // Calcular visitas aguardadas para o dia
  const dayAwaitingVisits = activities.filter(activity => {
    if (!activity?.scheduled_date || activity.tipo_atividade !== 'Agendamento') {
      return false;
    }
    
    try {
      const scheduledDate = new Date(activity.scheduled_date);
      // Normalizar a data agendada
      const normalizedScheduledDate = getUTCDateOnly(scheduledDate);
      
      // Comparar as datas normalizadas
      const matches = normalizedRefDate.getTime() === normalizedScheduledDate.getTime();
      
      if (matches) {
        console.log(`[STATS] Agendamento ID=${activity.id} data_original=${scheduledDate.toISOString()} data_normalizada=${normalizedScheduledDate.toISOString()} aguardado para ${dateStr}`);
      }
      
      return matches;
    } catch (error) {
      console.error(`[STATS] Erro ao processar data agendada:`, error);
      return false;
    }
  });

  // Log para contagem de itens identificados
  console.log(`[STATS] Para ${dateStr}: ${dayActivities.length} atividades, ${dayClients.length} novos clientes, ${dayAwaitingVisits.length} visitas aguardadas`);

  // Detalhamento de tipos de atividade para ajudar no debug
  const activityTypes = dayActivities.reduce((acc: Record<string, number>, activity) => {
    acc[activity.tipo_atividade] = (acc[activity.tipo_atividade] || 0) + 1;
    return acc;
  }, {});
  console.log(`[STATS] Detalhamento de atividades para ${dateStr}:`, activityTypes);

  // Calcular estatísticas do dia
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

  // Construir objeto de estatísticas
  const stats: DailyStats = {
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

  // Log para rastreamento de valores calculados
  console.log(`[STATS] Estatísticas calculadas para ${dateStr}:`, {
    newClients: stats.newClients,
    contactAttempts: stats.contactAttempts,
    effectiveContacts: stats.effectiveContacts,
    scheduledVisits: stats.scheduledVisits,
    awaitingVisits: stats.awaitingVisits,
    completedVisits: stats.completedVisits,
    enrollments: stats.enrollments,
    ceConversionRate: stats.ceConversionRate.toFixed(1) + '%',
    agConversionRate: stats.agConversionRate.toFixed(1) + '%',
    atConversionRate: stats.atConversionRate.toFixed(1) + '%',
    maConversionRate: stats.maConversionRate.toFixed(1) + '%'
  });

  return stats;
};
