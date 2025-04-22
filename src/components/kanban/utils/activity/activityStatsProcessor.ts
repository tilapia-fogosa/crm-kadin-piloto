
import { DailyStats } from "../../types/activity-dashboard.types";
import { format } from "date-fns";
import { normalizeDate, isSameLocalDay } from "@/utils/date";

/**
 * Processa estatísticas diárias a partir de três origens de dados separadas:
 * 1. Atividades criadas no período (createdActivities)
 * 2. Novos clientes no período (newClients)
 * 3. Atividades agendadas para o período (scheduledActivities)
 * 
 * Esta separação permite maior precisão nos cálculos, especialmente para visitas aguardadas
 * que são determinadas pelo scheduled_date, não pelo created_at.
 */
export const processDailyStats = (
  date: Date,
  createdActivities: any[],
  newClients: any[],
  scheduledActivities: any[]
): DailyStats => {
  const dateStr = format(date, 'yyyy-MM-dd');
  console.log(`[STATS PROCESSOR] Processando dia ${dateStr}`);

  // 1. Novos clientes (filtrados por created_at)
  const dayClients = newClients.filter(client => 
    isSameLocalDay(client?.created_at, date)
  );
  
  console.log(`[STATS PROCESSOR] ${dateStr}: Novos clientes: ${dayClients.length}`);

  // 2. Atividades criadas no dia (criadas no dia, filtradas por created_at)
  const dayActivities = createdActivities.filter(activity => 
    isSameLocalDay(activity?.created_at, date)
  );
  
  console.log(`[STATS PROCESSOR] ${dateStr}: Atividades criadas: ${dayActivities.length}`);
  
  // 3. Atividades agendadas para o dia (agendadas para o dia, filtradas por scheduled_date)
  const dayScheduledActivities = scheduledActivities.filter(activity => 
    isSameLocalDay(activity?.scheduled_date, date)
  );
  
  console.log(`[STATS PROCESSOR] ${dateStr}: Atividades agendadas para o dia: ${dayScheduledActivities.length}`);
  
  // Listas distintas de atividades por tipo (criadas no dia)
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
  
  // Listas distintas de atividades por tipo (agendadas para o dia)
  const scheduledVisitsForDay = dayScheduledActivities.filter(activity =>
    activity.tipo_atividade === 'Agendamento'
  );
  
  // Contadores somados (seguramente numéricos)
  const asNumber = (value: any) => Number.isFinite(value) ? value : 0;
  
  // Cálculo das estatísticas
  const contactAttempts = asNumber(createdContactAttempts.length);
  const effectiveContacts = asNumber(createdEffectiveContacts.length);
  const scheduledVisits = asNumber(createdSchedulings.length);
  const awaitingVisits = asNumber(scheduledVisitsForDay.length);
  const completedVisits = asNumber(createdCompletedVisits.length);
  const enrollments = asNumber(createdEnrollments.length);
  
  // Log detalhado dos cálculos
  console.log(`[STATS PROCESSOR] ${dateStr} - Detalhamento:
    - Novos clientes: ${dayClients.length}
    - Tentativas de contato: ${contactAttempts}
    - Contatos efetivos: ${effectiveContacts}
    - Agendamentos criados: ${scheduledVisits}
    - Visitas agendadas para este dia: ${awaitingVisits}
    - Atendimentos realizados: ${completedVisits}
    - Matrículas: ${enrollments}
  `);

  // Cálculo seguro de taxas (evitando divisão por zero)
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
  
  // Log das taxas calculadas
  console.log(`[STATS PROCESSOR] ${dateStr} - Taxas:
    - Taxa CE: ${ceConversionRate.toFixed(1)}%
    - Taxa AG: ${agConversionRate.toFixed(1)}%
    - Taxa AT: ${atConversionRate.toFixed(1)}%
    - Taxa MA: ${maConversionRate.toFixed(1)}%
  `);

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
