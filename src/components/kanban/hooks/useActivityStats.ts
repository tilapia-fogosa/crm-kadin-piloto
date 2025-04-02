
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, setYear, setMonth, startOfDay, isAfter } from "date-fns";
import { DailyStats } from "../types/activity-dashboard.types";
import { UserUnit } from "./useUserUnit";

export function useActivityStats(
  selectedSource: string,
  selectedMonth: string,
  selectedYear: string,
  userUnits: UserUnit[] | undefined,
  selectedUnitId: string
) {
  return useQuery({
    queryKey: ['activity-dashboard', selectedSource, selectedMonth, selectedYear, selectedUnitId, userUnits?.map(u => u.unit_id)],
    queryFn: async () => {
      const startDate = startOfMonth(setYear(setMonth(new Date(), parseInt(selectedMonth)), parseInt(selectedYear)));
      const endDate = endOfMonth(startDate);
      const unitIds = selectedUnitId === 'todas' 
        ? userUnits?.map(u => u.unit_id) || []
        : [selectedUnitId];
      const today = startOfDay(new Date());

      console.log('Fetching activity dashboard stats:', { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(),
        selectedSource,
        unitIds,
        selectedUnitId 
      });

      // Buscar dados de clientes e atividades principais
      const [clientsResult, activitiesResult, awaitingVisitsResult] = await Promise.all([
        // Clientes criados no período
        supabase.from('clients')
          .select('*')
          .eq('active', true)
          .in('unit_id', unitIds)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .eq(selectedSource !== 'todos' ? 'lead_source' : '', selectedSource !== 'todos' ? selectedSource : ''),
        
        // Atividades realizadas no período (created_at)
        supabase.from('client_activities')
          .select('*, clients!inner(*)')
          .eq('active', true)
          .eq('clients.active', true)
          .in('clients.unit_id', unitIds)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .eq(selectedSource !== 'todos' ? 'clients.lead_source' : '', selectedSource !== 'todos' ? selectedSource : ''),
          
        // Visitas aguardadas - busca separada com filtro por scheduled_date
        supabase.from('client_activities')
          .select('*, clients!inner(*)')
          .eq('active', true)
          .eq('tipo_atividade', 'Agendamento')
          .eq('clients.active', true)
          .in('clients.unit_id', unitIds)
          .gte('scheduled_date', startDate.toISOString())
          .lte('scheduled_date', endDate.toISOString())
          .eq(selectedSource !== 'todos' ? 'clients.lead_source' : '', selectedSource !== 'todos' ? selectedSource : '')
      ]);

      if (clientsResult.error) throw clientsResult.error;
      if (activitiesResult.error) throw activitiesResult.error;
      if (awaitingVisitsResult.error) throw awaitingVisitsResult.error;

      const clients = clientsResult.data;
      const activities = activitiesResult.data;
      const awaitingVisits = awaitingVisitsResult.data;

      console.log('Total de clientes encontrados:', clients.length);
      console.log('Total de atividades encontradas:', activities.length);
      console.log('Total de visitas aguardadas encontradas:', awaitingVisits.length);

      const validDates = Array.from({ length: endDate.getDate() }, (_, index) => {
        const date = new Date(startDate);
        date.setDate(index + 1);
        return !isAfter(startOfDay(date), today) ? date : null;
      }).filter(date => date !== null) as Date[];

      const dailyStats = validDates.map(date => {
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        // Atividades criadas no dia
        const dayActivities = activities.filter(activity => 
          new Date(activity.created_at) >= dayStart && 
          new Date(activity.created_at) <= dayEnd
        );

        // Visitas aguardadas para o dia
        const dayAwaitingVisits = awaitingVisits.filter(activity => 
          activity.scheduled_date && 
          new Date(activity.scheduled_date) >= dayStart && 
          new Date(activity.scheduled_date) <= dayEnd
        );

        const enrollments = dayActivities.filter(activity => 
          activity.tipo_atividade === 'Matrícula'
        ).length;

        console.log(`Estatísticas para ${date.toISOString()}:`, {
          totalAtividades: dayActivities.length,
          visitasAguardadas: dayAwaitingVisits.length,
          matriculas: enrollments
        });

        return {
          date,
          newClients: clients.filter(client => 
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
          // Agora usando o resultado da nova query para visitas aguardadas
          awaitingVisits: dayAwaitingVisits.length,
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
    enabled: userUnits !== undefined && userUnits.length > 0,
  });
}
