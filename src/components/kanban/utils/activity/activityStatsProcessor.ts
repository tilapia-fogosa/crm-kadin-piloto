
import { DailyStats } from "../../types/activity-dashboard.types";
import { format, isSameDay } from "date-fns";

/**
 * Agrupa atividades por dia e calcula estatísticas de forma otimizada
 * @param date Data base para agrupamento
 * @param activities Lista de atividades
 * @param newClients Lista de novos clientes
 * @param scheduledVisits Lista de visitas agendadas
 * @returns Estatísticas diárias calculadas
 */
export const processDailyStats = (
  date: Date,
  activities: any[],
  newClients: any[],
  scheduledVisits: any[]
): DailyStats => {
  const dateStr = format(date, 'yyyy-MM-dd');
  console.log(`[STATS PROCESSOR] Processando dia ${format(date, 'dd/MM/yyyy')}`);
  
  // Pré-processar os dados para evitar comparações repetidas
  
  // 1. Filtrar clientes criados no dia (baseado no created_at)
  const dayClients = newClients.filter(client => {
    if (!client?.created_at) return false;
    
    try {
      const clientDate = new Date(client.created_at);
      return isSameDay(clientDate, date);
    } catch (error) {
      console.error(`[STATS PROCESSOR] Erro ao processar data do cliente:`, error);
      return false;
    }
  });

  // 2. Filtrar atividades do dia (baseado no created_at)
  const dayActivities = activities.filter(activity => {
    if (!activity?.created_at) return false;
    
    try {
      const activityDate = new Date(activity.created_at);
      return isSameDay(activityDate, date);
    } catch (error) {
      console.error(`[STATS PROCESSOR] Erro ao processar data da atividade:`, error);
      return false;
    }
  });

  // 3. Filtrar visitas aguardadas para o dia (baseado no scheduled_date)
  const dayAwaitingVisits = scheduledVisits.filter(visit => {
    if (!visit?.scheduled_date) return false;
    
    try {
      const scheduledDate = new Date(visit.scheduled_date);
      return isSameDay(scheduledDate, date);
    } catch (error) {
      console.error(`[STATS PROCESSOR] Erro ao processar data agendada:`, error);
      return false;
    }
  });

  // Log resumido dos dados encontrados para o dia
  console.log(`[STATS PROCESSOR] Dia ${format(date, 'dd/MM/yyyy')}: ${dayClients.length} clientes, ${dayActivities.length} atividades, ${dayAwaitingVisits.length} visitas agendadas`);

  // Calcular totais por tipo de atividade
  const contactAttempts = dayActivities.filter(activity => 
    ['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
  ).length;
  
  const effectiveContacts = dayActivities.filter(activity => 
    ['Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
  ).length;
  
  const scheduledVisitsCount = dayActivities.filter(activity => 
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
    ? (scheduledVisitsCount / effectiveContacts) * 100 
    : 0;

  const atConversionRate = awaitingVisits > 0 
    ? (completedVisits / awaitingVisits) * 100 
    : 0;

  const maConversionRate = completedVisits > 0 
    ? (enrollments / completedVisits) * 100 
    : 0;

  // Somente log agregado para reduzir volume
  if (dayActivities.length > 0 || dayClients.length > 0 || dayAwaitingVisits.length > 0) {
    console.log(`[STATS PROCESSOR] Estatísticas para ${format(date, 'dd/MM/yyyy')}: ${dayClients.length} novos clientes, ${contactAttempts} tentativas, ${effectiveContacts} contatos efetivos, ${enrollments} matrículas`);
  }

  return {
    date,
    newClients: dayClients.length,
    contactAttempts,
    effectiveContacts,
    scheduledVisits: scheduledVisitsCount,
    awaitingVisits,
    completedVisits,
    enrollments,
    ceConversionRate,
    agConversionRate,
    atConversionRate,
    maConversionRate
  };
};
