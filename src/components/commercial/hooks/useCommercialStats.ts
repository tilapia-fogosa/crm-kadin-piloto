
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format, eachDayOfInterval } from "date-fns";
import { DailyStats } from "../../kanban/types/activity-dashboard.types";
import { createSafeDate, isSameLocalDay } from "@/utils/date";

/**
 * Hook para buscar estatísticas comerciais filtradas por mês, ano, origem e unidade
 */
export function useCommercialStats(
  selectedSource: string,
  selectedMonth: string,
  selectedYear: string,
  selectedUnitId: string | null
) {
  return useQuery({
    queryKey: ['commercial-dashboard', selectedSource, selectedMonth, selectedYear, selectedUnitId],
    queryFn: async () => {
      // 1. Validação e conversão dos parâmetros
      const monthNum = parseInt(selectedMonth);
      const yearNum = parseInt(selectedYear);
      
      if (isNaN(monthNum) || isNaN(yearNum)) {
        console.error('[COMMERCIAL STATS] Valores inválidos para mês ou ano');
        return [];
      }
      
      // 2. Calcular datas de início e fim do mês
      const startDate = startOfMonth(createSafeDate(yearNum, monthNum));
      const endDate = endOfMonth(createSafeDate(yearNum, monthNum));

      // 3. Converter para formato ISO para consultas
      const startDateIso = startDate.toISOString();
      const endDateIso = endDate.toISOString();

      console.log('[COMMERCIAL STATS] Buscando estatísticas comerciais:', { 
        startDate: format(startDate, 'dd/MM/yyyy'), 
        endDate: format(endDate, 'dd/MM/yyyy'),
        selectedSource,
        selectedUnitId
      });

      // 4. CONSULTA 1: Buscar clientes do período
      let clientsQuery = supabase.from('clients')
        .select('id, created_at')
        .eq('active', true)
        .gte('created_at', startDateIso)
        .lte('created_at', endDateIso);
      
      // Aplicar filtros adicionais
      if (selectedSource !== 'todos') {
        clientsQuery = clientsQuery.eq('lead_source', selectedSource);
      }
      
      if (selectedUnitId) {
        clientsQuery = clientsQuery.eq('unit_id', selectedUnitId);
      }

      // 5. CONSULTA 2: Buscar atividades do período
      let activitiesQuery = supabase.from('client_activities')
        .select('id, tipo_atividade, created_at, scheduled_date, clients!inner(id, lead_source)')
        .eq('active', true)
        .eq('clients.active', true)
        .gte('created_at', startDateIso)
        .lte('created_at', endDateIso);
      
      // Aplicar filtros adicionais
      if (selectedSource !== 'todos') {
        activitiesQuery = activitiesQuery.eq('clients.lead_source', selectedSource);
      }
      
      if (selectedUnitId) {
        activitiesQuery = activitiesQuery.eq('unit_id', selectedUnitId);
      }
      
      // 6. Executar as consultas em paralelo
      const [clientsResult, activitiesResult] = await Promise.all([
        clientsQuery,
        activitiesQuery
      ]);

      // 7. Validar respostas e tratar erros
      if (clientsResult.error) {
        console.error('[COMMERCIAL STATS] Erro ao buscar clientes:', clientsResult.error);
        throw clientsResult.error;
      }
      if (activitiesResult.error) {
        console.error('[COMMERCIAL STATS] Erro ao buscar atividades:', activitiesResult.error);
        throw activitiesResult.error;
      }

      console.log('[COMMERCIAL STATS] Dados coletados:',  {
        clientes: clientsResult.data.length,
        atividades: activitiesResult.data.length
      });
      
      // 8. Gerar lista de dias do mês
      const allDates = eachDayOfInterval({ start: startDate, end: endDate });
      
      // 9. Processamento dia a dia
      const dailyStats = allDates.map(date => {
        // 9.1 Filtrar clientes do dia
        const dayClients = clientsResult.data.filter(client => {
          if (!client.created_at) return false;
          return isSameLocalDay(new Date(client.created_at), date);
        });

        // 9.2 Filtrar atividades do dia (created_at)
        const dayActivities = activitiesResult.data.filter(activity => {
          if (!activity.created_at) return false;
          return isSameLocalDay(new Date(activity.created_at), date);
        });
        
        // 9.3 Filtrar visitas agendadas para o dia (scheduled_date)
        const dayAwaitingVisits = activitiesResult.data.filter(activity => {
          if (!activity.scheduled_date || activity.tipo_atividade !== 'Agendamento') return false;
          return isSameLocalDay(new Date(activity.scheduled_date), date);
        });

        // 9.4 Calcular totais por tipo de atividade
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

        // Log resumido apenas para dias com dados
        if (dayActivities.length > 0 || dayClients.length > 0) {
          console.log(`[COMMERCIAL STATS] Dia ${format(date, 'dd/MM/yyyy')}:`, {
            novosClientes: dayClients.length,
            atividades: dayActivities.length,
            matriculas: enrollments
          });
        }

        // 9.5 Montar objeto de estatísticas do dia
        return {
          date,
          newClients: dayClients.length,
          contactAttempts,
          effectiveContacts,
          scheduledVisits,
          awaitingVisits,
          completedVisits,
          enrollments,
          ceConversionRate: 0, // Será calculado na próxima etapa
          agConversionRate: 0,
          atConversionRate: 0,
          maConversionRate: 0
        };
      });

      // 10. Calcular taxas de conversão para cada dia
      return dailyStats.map(day => ({
        ...day,
        ceConversionRate: day.contactAttempts > 0 ? (day.effectiveContacts / day.contactAttempts) * 100 : 0,
        agConversionRate: day.effectiveContacts > 0 ? (day.scheduledVisits / day.effectiveContacts) * 100 : 0,
        atConversionRate: day.awaitingVisits > 0 ? (day.completedVisits / day.awaitingVisits) * 100 : 0,
        maConversionRate: day.completedVisits > 0 ? (day.enrollments / day.completedVisits) * 100 : 0
      }));
    },
  });
}
