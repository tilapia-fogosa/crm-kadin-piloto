
import { DailyStats } from "../../types/activity-dashboard.types";
import { isSameLocalDate } from "@/utils/dateUtils";

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
  console.log(`Processando estatísticas para ${date.toISOString()}`);
  
  // Filtrar atividades do dia
  const dayActivities = activities.filter(activity => {
    if (!activity.created_at) return false;
    const activityDate = new Date(activity.created_at);
    const matches = isSameLocalDate(date, activityDate);
    
    if (matches) {
      console.log(`Atividade encontrada para ${date.toISOString()}:`, {
        id: activity.id,
        tipo: activity.tipo_atividade,
        created_at: activity.created_at
      });
    }
    
    return matches;
  });

  // Filtrar clientes criados no dia
  const dayClients = clients.filter(client => {
    if (!client.created_at) return false;
    const clientDate = new Date(client.created_at);
    const matches = isSameLocalDate(date, clientDate);
    
    if (matches) {
      console.log(`Cliente novo encontrado para ${date.toISOString()}:`, {
        id: client.id,
        name: client.name,
        created_at: client.created_at
      });
    }
    
    return matches;
  });

  // Calcular visitas aguardadas para o dia
  const dayAwaitingVisits = activities.filter(activity => {
    if (!activity.scheduled_date || activity.tipo_atividade !== 'Agendamento') return false;
    const scheduledDate = new Date(activity.scheduled_date);
    return isSameLocalDate(date, scheduledDate);
  });

  // Calcular estatísticas do dia
  const stats: DailyStats = {
    date,
    newClients: dayClients.length,
    contactAttempts: dayActivities.filter(activity => 
      ['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
    ).length,
    effectiveContacts: dayActivities.filter(activity => 
      ['Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
    ).length,
    scheduledVisits: dayActivities.filter(activity => 
      activity.tipo_atividade === 'Agendamento'
    ).length,
    awaitingVisits: dayAwaitingVisits.length,
    completedVisits: dayActivities.filter(activity => 
      activity.tipo_atividade === 'Atendimento'
    ).length,
    enrollments: dayActivities.filter(activity => 
      activity.tipo_atividade === 'Matrícula'
    ).length,
    ceConversionRate: 0,
    agConversionRate: 0,
    atConversionRate: 0,
    maConversionRate: 0
  };

  // Calcular taxas de conversão
  stats.ceConversionRate = stats.contactAttempts > 0 
    ? (stats.effectiveContacts / stats.contactAttempts) * 100 
    : 0;

  stats.agConversionRate = stats.effectiveContacts > 0 
    ? (stats.scheduledVisits / stats.effectiveContacts) * 100 
    : 0;

  stats.atConversionRate = stats.awaitingVisits > 0 
    ? (stats.completedVisits / stats.awaitingVisits) * 100 
    : 0;

  stats.maConversionRate = stats.completedVisits > 0 
    ? (stats.enrollments / stats.completedVisits) * 100 
    : 0;

  console.log(`Estatísticas processadas para ${date.toISOString()}:`, stats);
  return stats;
};
