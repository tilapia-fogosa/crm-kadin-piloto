
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, setYear, setMonth, startOfDay, isAfter } from "date-fns";
import { DailyStats } from "../../kanban/types/activity-dashboard.types";

export function useCommercialStats(
  selectedSource: string,
  selectedMonth: string,
  selectedYear: string,
  selectedUnitId: string | null
) {
  return useQuery({
    queryKey: ['commercial-dashboard', selectedSource, selectedMonth, selectedYear, selectedUnitId],
    queryFn: async () => {
      const startDate = startOfMonth(setYear(setMonth(new Date(), parseInt(selectedMonth)), parseInt(selectedYear)));
      const endDate = endOfMonth(startDate);
      const today = startOfDay(new Date());

      console.log('Buscando estatísticas comerciais:', { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(),
        selectedSource,
        selectedUnitId 
      });

      const [clientsResult, activitiesResult] = await Promise.all([
        supabase.from('clients')
          .select('*')
          .eq('active', true)
          .eq(selectedUnitId ? 'unit_id' : '', selectedUnitId || '')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .eq(selectedSource !== 'todos' ? 'lead_source' : '', selectedSource !== 'todos' ? selectedSource : ''),
        
        supabase.from('client_activities')
          .select('*, clients!inner(*)')
          .eq('active', true)
          .eq('clients.active', true)
          .eq(selectedUnitId ? 'unit_id' : '', selectedUnitId || '')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .eq(selectedSource !== 'todos' ? 'clients.lead_source' : '', selectedSource !== 'todos' ? selectedSource : '')
      ]);

      if (clientsResult.error) throw clientsResult.error;
      if (activitiesResult.error) throw activitiesResult.error;

      console.log('Total de clientes encontrados:', clientsResult.data.length);
      console.log('Total de atividades encontradas:', activitiesResult.data.length);

      const validDates = Array.from({ length: endDate.getDate() }, (_, index) => {
        const date = new Date(startDate);
        date.setDate(index + 1);
        return !isAfter(startOfDay(date), today) ? date : null;
      }).filter(date => date !== null) as Date[];

      const dailyStats = validDates.map(date => {
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const dayActivities = activitiesResult.data.filter(activity => 
          new Date(activity.created_at) >= dayStart && 
          new Date(activity.created_at) <= dayEnd
        );

        const enrollments = dayActivities.filter(activity => 
          activity.tipo_atividade === 'Matrícula'
        ).length;

        console.log(`Estatísticas para ${date.toISOString()}:`, {
          totalAtividades: dayActivities.length,
          matriculas: enrollments
        });

        return {
          date,
          newClients: clientsResult.data.filter(client => 
            new Date(client.created_at) >= dayStart && 
            new Date(client.created_at) <= dayEnd
          ).length,
          contactAttempts: dayActivities.filter(activity => 
            ['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
          ).length,
          effectiveContacts: dayActivities.filter(activity => 
            ['Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
          ).length,
          scheduledVisits: dayActivities.filter(activity => 
            activity.tipo_atividade === 'Agendamento'
          ).length,
          awaitingVisits: activitiesResult.data.filter(activity => 
            activity.tipo_atividade === 'Agendamento' && 
            activity.scheduled_date && 
            new Date(activity.scheduled_date) >= dayStart && 
            new Date(activity.scheduled_date) <= dayEnd
          ).length,
          completedVisits: dayActivities.filter(activity => 
            activity.tipo_atividade === 'Atendimento'
          ).length,
          enrollments,
          ceConversionRate: 0,
          agConversionRate: 0,
          atConversionRate: 0,
          maConversionRate: 0
        };
      });

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
