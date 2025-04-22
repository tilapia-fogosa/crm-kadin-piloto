
import { DailyStats } from "../../types/activity-dashboard.types";
import { format } from "date-fns";
import { normalizeDate, isSameLocalDay } from "@/utils/date";

/**
 * Agrupa atividades por dia e calcula estatísticas de forma otimizada
 */
export const processDailyStats = (
  date: Date,
  activities: any[],
  newClients: any[],
  scheduledVisits: any[]
): DailyStats => {
  const dateStr = format(date, 'yyyy-MM-dd');
  console.log(`[STATS PROCESSOR] Processando ${dateStr}`);

  // 1. Filtrar clientes criados no dia (ignorar horário, comparar data normalizada)
  const dayClients = newClients.filter(client => {
    const created = normalizeDate(client?.created_at);
    const match = isSameLocalDay(created, date);
    if (match) {
      console.log(`[STATS PROCESSOR] Cliente do dia [${dateStr}]:`, client.id, client.created_at);
    }
    return match;
  });

  // 2. Filtrar atividades do dia (created_at)
  const dayActivities = activities.filter(activity => {
    const created = normalizeDate(activity?.created_at);
    const match = isSameLocalDay(created, date);
    if (match) {
      console.log(`[STATS PROCESSOR] Atividade do dia [${dateStr}]:`, activity.id, activity.tipo_atividade, activity.created_at);
    }
    return match;
  });

  // 3. Filtrar visitas aguardadas para o dia (scheduled_date)
  const dayAwaitingVisits = scheduledVisits.filter(visit => {
    const sched = normalizeDate(visit?.scheduled_date);
    const match = isSameLocalDay(sched, date);
    if (match) {
      console.log(`[STATS PROCESSOR] Visita aguardada dia [${dateStr}]:`, visit.id, visit.scheduled_date);
    }
    return match;
  });

  // Garante que todas as somas sejam feitas com números válidos
  const asNumber = (value: any) => Number.isFinite(value) ? value : 0;

  const contactAttempts = asNumber(dayActivities.filter(activity =>
    ['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
  ).length);
  const effectiveContacts = asNumber(dayActivities.filter(activity =>
    ['Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
  ).length);
  const scheduledVisitsCount = asNumber(dayActivities.filter(activity =>
    activity.tipo_atividade === 'Agendamento'
  ).length);
  const awaitingVisits = asNumber(dayAwaitingVisits.length);
  const completedVisits = asNumber(dayActivities.filter(activity =>
    activity.tipo_atividade === 'Atendimento'
  ).length);
  const enrollments = asNumber(dayActivities.filter(activity =>
    activity.tipo_atividade === 'Matrícula'
  ).length);

  // Cálculo seguro de taxas
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

  // Log final sumarizado para o dia
  console.log(`[STATS PROCESSOR] Dia ${dateStr}: clientes=${dayClients.length} contatos=${contactAttempts} efetivos=${effectiveContacts} agendamentos=${scheduledVisitsCount} aguardadas=${awaitingVisits} realizadas=${completedVisits} matrículas=${enrollments}`);

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
