
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, isSameDay, format } from "date-fns";
import { DailyStats } from "../../kanban/types/activity-dashboard.types";
import { createSafeDate } from "@/utils/date";

export function useCommercialStats(
  selectedSource: string,
  selectedMonth: string,
  selectedYear: string,
  selectedUnitId: string | null
) {
  return useQuery({
    queryKey: ['commercial-dashboard', selectedSource, selectedMonth, selectedYear, selectedUnitId],
    queryFn: async () => {
      // Conversão segura de strings para números
      const monthNum = parseInt(selectedMonth);
      const yearNum = parseInt(selectedYear);
      
      // Criação segura de datas de início e fim do mês
      const startDate = startOfMonth(createSafeDate(yearNum, monthNum));
      const endDate = endOfMonth(createSafeDate(yearNum, monthNum));

      console.log('Buscando estatísticas comerciais:', { 
        startDate: format(startDate, 'dd/MM/yyyy'), 
        endDate: format(endDate, 'dd/MM/yyyy'),
        selectedSource,
        selectedUnitId
      });

      // Datas ISO para uso no Supabase
      const startDateIso = startDate.toISOString();
      const endDateIso = endDate.toISOString();

      // Construir as queries com filtros aplicados diretamente
      let clientsQuery = supabase.from('clients')
        .select('id, created_at')
        .eq('active', true)
        .gte('created_at', startDateIso)
        .lte('created_at', endDateIso);
      
      if (selectedSource !== 'todos') {
        clientsQuery = clientsQuery.eq('lead_source', selectedSource);
      }
      
      if (selectedUnitId) {
        clientsQuery = clientsQuery.eq('unit_id', selectedUnitId);
      }

      let activitiesQuery = supabase.from('client_activities')
        .select('id, tipo_atividade, created_at, scheduled_date, clients!inner(id, lead_source)')
        .eq('active', true)
        .eq('clients.active', true)
        .gte('created_at', startDateIso)
        .lte('created_at', endDateIso);
      
      if (selectedSource !== 'todos') {
        activitiesQuery = activitiesQuery.eq('clients.lead_source', selectedSource);
      }
      
      if (selectedUnitId) {
        activitiesQuery = activitiesQuery.eq('unit_id', selectedUnitId);
      }
      
      // Executar queries em paralelo
      const [clientsResult, activitiesResult] = await Promise.all([
        clientsQuery,
        activitiesQuery
      ]);

      if (clientsResult.error) throw clientsResult.error;
      if (activitiesResult.error) throw activitiesResult.error;

      console.log('Total de clientes encontrados:', clientsResult.data.length);
      console.log('Total de atividades encontradas:', activitiesResult.data.length);
      
      // Gerar array com todas as datas do mês
      const allDates: Date[] = [];
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        allDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Calcular estatísticas para cada dia
      const dailyStats = allDates.map(date => {
        // Clientes criados no dia (usar isSameDay para comparação eficiente)
        const dayClients = clientsResult.data.filter(client => {
          if (!client.created_at) return false;
          return isSameDay(new Date(client.created_at), date);
        });

        // Atividades criadas no dia
        const dayActivities = activitiesResult.data.filter(activity => {
          if (!activity.created_at) return false;
          return isSameDay(new Date(activity.created_at), date);
        });
        
        // Visitas aguardadas para o dia
        const dayAwaitingVisits = activitiesResult.data.filter(activity => {
          if (!activity.scheduled_date || activity.tipo_atividade !== 'Agendamento') return false;
          return isSameDay(new Date(activity.scheduled_date), date);
        });

        // Calcular totais por tipo de atividade
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
          console.log(`Estatísticas comerciais para ${format(date, 'dd/MM/yyyy')}:`, {
            novosClientes: dayClients.length,
            atividades: dayActivities.length,
            matriculas: enrollments
          });
        }

        return {
          date,
          newClients: dayClients.length,
          contactAttempts,
          effectiveContacts,
          scheduledVisits,
          awaitingVisits,
          completedVisits,
          enrollments,
          ceConversionRate: 0,
          agConversionRate: 0,
          atConversionRate: 0,
          maConversionRate: 0
        };
      });

      // Calcular taxas de conversão
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
