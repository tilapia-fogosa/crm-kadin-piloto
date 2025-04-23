
import { eachDayOfInterval, format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { DailyStats } from '../types/activity-dashboard.types';
import { createSafeDate } from '@/utils/date';
import { useNewClientsStats } from './useNewClientsStats';
import { useCreatedActivitiesStats } from './useCreatedActivitiesStats';
import { useScheduledActivitiesStats } from './useScheduledActivitiesStats';

/**
 * Hook agregador que combina os resultados dos três hooks especializados
 * e produz estatísticas diárias combinadas no formato esperado pelos componentes
 */
export function useCombinedActivityStats(
  selectedSource: string,
  selectedMonth: string,
  selectedYear: string,
  userUnits: any[] | undefined,
  selectedUnitId: string,
  isOpen: boolean = false
) {
  // Carregar dados de cada fonte
  const { 
    data: newClientsStats, 
    isLoading: isLoadingNewClients 
  } = useNewClientsStats(
    selectedSource, 
    selectedMonth, 
    selectedYear, 
    userUnits, 
    selectedUnitId, 
    isOpen
  );
  
  const { 
    data: createdActivityStats, 
    isLoading: isLoadingCreatedActivities 
  } = useCreatedActivitiesStats(
    selectedSource, 
    selectedMonth, 
    selectedYear, 
    userUnits, 
    selectedUnitId, 
    isOpen
  );
  
  const { 
    data: scheduledActivityStats, 
    isLoading: isLoadingScheduledActivities 
  } = useScheduledActivitiesStats(
    selectedSource, 
    selectedMonth, 
    selectedYear, 
    userUnits, 
    selectedUnitId, 
    isOpen
  );
  
  // Estado de carregamento combinado
  const isLoading = isLoadingNewClients || isLoadingCreatedActivities || isLoadingScheduledActivities;
  
  // Se ainda estiver carregando ou não tiver os hooks habilitados, retorna vazio
  if (isLoading || !isOpen) {
    return { data: undefined, isLoading };
  }
  
  // Mapas para acesso rápido aos dados por data
  const newClientsByDate = newClientsStats?.reduce((acc, item) => {
    acc[item.date] = item.totalNewClients;
    return acc;
  }, {} as Record<string, number>) || {};
  
  const createdActivitiesByDate = createdActivityStats?.reduce((acc, item) => {
    acc[item.date] = item.activitiesCountByType;
    return acc;
  }, {} as Record<string, Record<string, number>>) || {};
  
  const scheduledActivitiesByDate = scheduledActivityStats?.reduce((acc, item) => {
    acc[item.date] = item.activityCountsByType;
    return acc;
  }, {} as Record<string, Record<string, number>>) || {};
  
  // Gerar dias do período
  const monthNum = parseInt(selectedMonth);
  const yearNum = parseInt(selectedYear);
  
  if (isNaN(monthNum) || isNaN(yearNum)) {
    console.error('[COMBINED STATS] Valores inválidos:', { selectedMonth, selectedYear });
    return { data: undefined, isLoading };
  }
  
  const startDate = startOfMonth(createSafeDate(yearNum, monthNum));
  const endDate = endOfMonth(createSafeDate(yearNum, monthNum));
  
  // Gerar array com todos os dias do mês
  const allDates = eachDayOfInterval({ start: startDate, end: endDate });
  
  console.log(`[COMBINED STATS] Processando dados combinados para ${allDates.length} dias`);
  
  // Combinar dados para cada dia
  const dailyStats: DailyStats[] = allDates.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Coletar estatísticas de novos clientes
    const newClients = newClientsByDate[dateStr] || 0;
    
    // Coletar estatísticas de atividades criadas (usando created_at)
    const dayCreatedActivities = createdActivitiesByDate[dateStr] || {};
    
    const contactAttempts = (dayCreatedActivities['Tentativa de Contato'] || 0) + 
                           (dayCreatedActivities['Contato Efetivo'] || 0) + 
                           (dayCreatedActivities['Agendamento'] || 0);
                           
    const effectiveContacts = (dayCreatedActivities['Contato Efetivo'] || 0) + 
                             (dayCreatedActivities['Agendamento'] || 0);
                             
    const scheduledVisits = dayCreatedActivities['Agendamento'] || 0;
    
    const completedVisits = dayCreatedActivities['Atendimento'] || 0;
    
    const enrollments = dayCreatedActivities['Matrícula'] || 0;
    
    // Coletar estatísticas de atividades agendadas (usando scheduled_date)
    const dayScheduledActivities = scheduledActivitiesByDate[dateStr] || {};
    
    // Atividades de agendamento que estão programadas PARA este dia
    const awaitingVisits = dayScheduledActivities['Agendamento'] || 0;
    
    // Cálculo de taxas de conversão
    // Taxa de conversão de tentativas para contatos efetivos
    const ceConversionRate = contactAttempts > 0 
      ? (effectiveContacts / contactAttempts) * 100 
      : 0;
      
    // Taxa de conversão de contatos efetivos para agendamentos
    const agConversionRate = effectiveContacts > 0 
      ? (scheduledVisits / effectiveContacts) * 100 
      : 0;
      
    // Taxa de conversão de visitas aguardando para realizadas
    const atConversionRate = awaitingVisits > 0 
      ? (completedVisits / awaitingVisits) * 100 
      : 0;
      
    // Taxa de conversão de visitas realizadas para matrículas
    const maConversionRate = completedVisits > 0
      ? (enrollments / completedVisits) * 100
      : 0;
    
    // Log detalhado para rastreamento
    console.log(`[COMBINED STATS] Dia ${dateStr}:
      - Novos clientes: ${newClients}
      - Tentativas de contato: ${contactAttempts}
      - Contatos efetivos: ${effectiveContacts} (${ceConversionRate.toFixed(1)}%)
      - Agendamentos criados: ${scheduledVisits} (${agConversionRate.toFixed(1)}%)
      - Visitas agendadas para este dia: ${awaitingVisits}
      - Atendimentos realizados: ${completedVisits} (${atConversionRate.toFixed(1)}%)
      - Matrículas: ${enrollments} (${maConversionRate.toFixed(1)}%)
    `);
    
    // Construir objeto com todas as estatísticas do dia
    return {
      date,
      newClients,
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
  });
  
  console.log(`[COMBINED STATS] Processamento completo para ${dailyStats.length} dias`);
  
  return { 
    data: dailyStats, 
    isLoading 
  };
}
