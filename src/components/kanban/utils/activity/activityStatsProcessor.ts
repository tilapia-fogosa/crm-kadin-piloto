import { DailyStats } from "../../types/activity-dashboard.types";
import { format, parseISO } from "date-fns";

/**
 * Converte uma data para o formato yyyy-MM-dd para comparações consistentes
 */
function getDateString(value: any): string | null {
  if (!value) {
    console.warn('[STATS PROCESSOR] Data inválida (nula)');
    return null;
  }
  
  let date: Date;
  
  // Se já for um objeto Date
  if (value instanceof Date) {
    date = value;
  } 
  // Se for uma string ISO
  else if (typeof value === 'string' && value.includes('T')) {
    try {
      date = parseISO(value);
    } catch (e) {
      console.warn('[STATS PROCESSOR] Erro ao converter string ISO:', value);
      return null;
    }
  }
  // Outros formatos de string
  else {
    try {
      date = new Date(value);
    } catch (e) {
      console.warn('[STATS PROCESSOR] Erro ao converter data:', value);
      return null;
    }
  }

  if (isNaN(date.getTime())) {
    console.warn('[STATS PROCESSOR] Data inválida após conversão:', value);
    return null;
  }
  
  return format(date, 'yyyy-MM-dd');
}

/**
 * Processa estatísticas diárias a partir de três origens de dados separadas
 */
export const processDailyStats = (
  date: Date,
  createdActivities: any[],
  newClients: any[],
  scheduledActivities: any[]
): DailyStats => {
  const targetDate = getDateString(date);
  console.log(`[STATS PROCESSOR] Processando dia ${targetDate}`);

  if (!targetDate) {
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

  // Novos clientes (filtrados por created_at)
  const dayClients = newClients.filter(client => {
    const clientDate = getDateString(client?.created_at);
    if (!clientDate) {
      console.warn(`[STATS PROCESSOR] Cliente com created_at inválido:`, client);
      return false;
    }
    const matches = clientDate === targetDate;
    if (matches) {
      console.log(`[STATS PROCESSOR] Cliente ${client.id} corresponde à data ${targetDate}`);
    }
    return matches;
  });

  console.log(`[STATS PROCESSOR] ${targetDate}: Novos clientes encontrados: ${dayClients.length}`);

  // Atividades criadas no dia (filtradas por created_at)
  const dayActivities = createdActivities.filter(activity => {
    const activityDate = getDateString(activity?.created_at);
    if (!activityDate) {
      console.warn(`[STATS PROCESSOR] Atividade com created_at inválido:`, activity);
      return false;
    }
    const matches = activityDate === targetDate;
    if (matches) {
      console.log(`[STATS PROCESSOR] Atividade ${activity.id} corresponde à data ${targetDate}`);
    }
    return matches;
  });

  console.log(`[STATS PROCESSOR] ${targetDate}: Atividades criadas encontradas: ${dayActivities.length}`);
  
  // Atividades agendadas para o dia (filtradas por scheduled_date)
  const dayScheduledActivities = scheduledActivities.filter(activity => {
    const scheduledDate = getDateString(activity?.scheduled_date);
    if (!scheduledDate) {
      return false;
    }
    const matches = scheduledDate === targetDate;
    if (matches) {
      console.log(`[STATS PROCESSOR] Agendamento ${activity.id} corresponde à data ${targetDate}`);
    }
    return matches;
  });

  console.log(`[STATS PROCESSOR] ${targetDate}: Atividades agendadas encontradas: ${dayScheduledActivities.length}`);

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
  console.log(`[STATS PROCESSOR] ${targetDate} - Detalhamento:
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
  console.log(`[STATS PROCESSOR] ${targetDate} - Taxas:
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
