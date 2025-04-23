import { DailyStats } from "../../types/activity-dashboard.types";
import { format } from "date-fns";

/**
 * Recebe uma string ou objeto Date e retorna uma string de data UTC no formato yyyy-MM-dd
 */
function getUTCDateString(value: any): string | null {
  if (!value) return null;
  
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) {
    console.warn('[STATS PROCESSOR] Data inválida:', value);
    return null;
  }
  
  // Formato yyyy-MM-dd em UTC
  return date.toISOString().split('T')[0];
}

/**
 * Processa estatísticas diárias a partir de três origens de dados separadas:
 * 1. Atividades criadas no período (createdActivities)
 * 2. Novos clientes no período (newClients)
 * 3. Atividades agendadas para o período (scheduledActivities)
 */
export const processDailyStats = (
  date: Date,
  createdActivities: any[],
  newClients: any[],
  scheduledActivities: any[]
): DailyStats => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const targetDateUTC = getUTCDateString(date);
  
  console.log(`[STATS PROCESSOR] Processando dia ${dateStr} (UTC: ${targetDateUTC})`);

  if (!targetDateUTC) {
    console.error('[STATS PROCESSOR] Data alvo inválida');
    return {
      date,
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
      maConversionRate: 0
    };
  }

  // 1. Novos clientes (filtrados por created_at)
  const dayClients = newClients.filter(client => {
    const clientDateUTC = getUTCDateString(client?.created_at);
    if (!clientDateUTC) {
      console.warn(`[STATS PROCESSOR] Cliente com created_at inválido:`, client);
      return false;
    }
    return clientDateUTC === targetDateUTC;
  });

  console.log(`[STATS PROCESSOR] ${dateStr}: Novos clientes: ${dayClients.length}`);

  // 2. Atividades criadas no dia (filtradas por created_at)
  const dayActivities = createdActivities.filter(activity => {
    const activityDateUTC = getUTCDateString(activity?.created_at);
    if (!activityDateUTC) {
      console.warn(`[STATS PROCESSOR] Atividade criada com created_at inválido:`, activity);
      return false;
    }
    return activityDateUTC === targetDateUTC;
  });

  console.log(`[STATS PROCESSOR] ${dateStr}: Atividades criadas: ${dayActivities.length}`);
  
  // 3. Atividades agendadas para o dia (filtradas por scheduled_date)
  const dayScheduledActivities = scheduledActivities.filter(activity => {
    const scheduledDateUTC = getUTCDateString(activity?.scheduled_date);
    if (!scheduledDateUTC) {
      return false;
    }
    return scheduledDateUTC === targetDateUTC;
  });

  console.log(`[STATS PROCESSOR] ${dateStr}: Atividades agendadas para o dia: ${dayScheduledActivities.length}`);
  
  // Listagens detalhadas por tipo para análise e logs
  const createdContactAttempts = dayActivities.filter(activity =>
    ['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
  );
  const createdEffectiveContacts = dayActivities.filter(activity =>
    ['Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
  );
  const createdSchedulings = dayActivities.filter(activity =>
    activity.tipo_atividade === 'Agendamento'
  );
  const createdCompletedVisits = dayActivities.filter(activity =>
    activity.tipo_atividade === 'Atendimento'
  );
  const createdEnrollments = dayActivities.filter(activity =>
    activity.tipo_atividade === 'Matrícula'
  );
  const scheduledVisitsForDay = dayScheduledActivities.filter(activity =>
    activity.tipo_atividade === 'Agendamento'
  );

  // Função utilitária para forçar valor numérico
  const asNumber = (value: any) => Number.isFinite(value) ? value : 0;

  // Cálculo das estatísticas
  const contactAttempts = asNumber(createdContactAttempts.length);
  const effectiveContacts = asNumber(createdEffectiveContacts.length);
  const scheduledVisits = asNumber(createdSchedulings.length);
  const awaitingVisits = asNumber(scheduledVisitsForDay.length);
  const completedVisits = asNumber(createdCompletedVisits.length);
  const enrollments = asNumber(createdEnrollments.length);

  // Logs detalhados de contagem
  console.log(`[STATS PROCESSOR] ${dateStr} - Detalhamento:
    - Novos clientes: ${dayClients.length}
    - Tentativas de contato: ${contactAttempts}
    - Contatos efetivos: ${effectiveContacts}
    - Agendamentos criados: ${scheduledVisits}
    - Visitas agendadas para este dia: ${awaitingVisits}
    - Atendimentos realizados: ${completedVisits}
    - Matrículas: ${enrollments}
  `);

  // Cálculo seguro de taxas de conversão, evitando divisão por zero
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

  // Log de porcentagens para acompanhamento
  console.log(`[STATS PROCESSOR] ${dateStr} - Taxas:
    - Taxa CE: ${ceConversionRate.toFixed(1)}%
    - Taxa AG: ${agConversionRate.toFixed(1)}%
    - Taxa AT: ${atConversionRate.toFixed(1)}%
    - Taxa MA: ${maConversionRate.toFixed(1)}%
  `);

  // Retorno das estatísticas completas do dia
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
