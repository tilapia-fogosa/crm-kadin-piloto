
import { DailyStats } from "../../types/activity-dashboard.types";
import { format } from "date-fns";
import { isSameLocalDay } from "@/utils/date";

/**
 * Recebe uma string ou objeto Date e retorna Date válido.
 */
function safeToDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  // Considera ISO string
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date;
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
  console.log(`[STATS PROCESSOR] Processando dia ${dateStr}`);

  // Garantir análise com datas antes de tentar filtrar
  // 1. Novos clientes (filtrados por created_at)
  const dayClients = newClients.filter(client => {
    const createdAt = safeToDate(client?.created_at);
    if (!createdAt) {
      console.warn(`[STATS PROCESSOR] Cliente com created_at inválido:`, client);
      return false;
    }
    return isSameLocalDay(createdAt, date);
  });

  console.log(`[STATS PROCESSOR] ${dateStr}: Novos clientes: ${dayClients.length}`);

  // 2. Atividades criadas no dia (filtradas por created_at)
  const dayActivities = createdActivities.filter(activity => {
    const createdAt = safeToDate(activity?.created_at);
    if (!createdAt) {
      console.warn(`[STATS PROCESSOR] Atividade criada com created_at inválido:`, activity);
      return false;
    }
    return isSameLocalDay(createdAt, date);
  });

  console.log(`[STATS PROCESSOR] ${dateStr}: Atividades criadas: ${dayActivities.length}`);
  
  // 3. Atividades agendadas para o dia (filtradas por scheduled_date)
  const dayScheduledActivities = scheduledActivities.filter(activity => {
    const scheduledDate = safeToDate(activity?.scheduled_date);
    if (!scheduledDate) {
      // Não loga warning aqui pois agendado pode ser null
      return false;
    }
    return isSameLocalDay(scheduledDate, date);
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
