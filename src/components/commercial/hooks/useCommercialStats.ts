
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, startOfDay, isAfter } from "date-fns";
import { DailyStats } from "../../kanban/types/activity-dashboard.types";
import { createSafeDate, normalizeToStartOfDay, normalizeToEndOfDay } from "@/utils/dateUtils";

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
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(),
        selectedSource,
        selectedUnitId
      });

      // Datas ISO para uso no Supabase (garantindo compatibilidade de timezone)
      const startDateIso = startDate.toISOString();
      const endDateIso = endDate.toISOString();

      const [clientsResult, activitiesResult] = await Promise.all([
        supabase.from('clients')
          .select('*')
          .eq('active', true)
          .eq(selectedUnitId ? 'unit_id' : '', selectedUnitId || '')
          .gte('created_at', startDateIso)
          .lte('created_at', endDateIso)
          .eq(selectedSource !== 'todos' ? 'lead_source' : '', selectedSource !== 'todos' ? selectedSource : ''),
        
        supabase.from('client_activities')
          .select('*, clients!inner(*)')
          .eq('active', true)
          .eq('clients.active', true)
          .eq(selectedUnitId ? 'unit_id' : '', selectedUnitId || '')
          .gte('created_at', startDateIso)
          .lte('created_at', endDateIso)
          .eq(selectedSource !== 'todos' ? 'clients.lead_source' : '', selectedSource !== 'todos' ? selectedSource : '')
      ]);

      if (clientsResult.error) throw clientsResult.error;
      if (activitiesResult.error) throw activitiesResult.error;

      console.log('Total de clientes encontrados:', clientsResult.data.length);
      console.log('Total de atividades encontradas:', activitiesResult.data.length);

      // CORREÇÃO: Incluir todos os dias do mês, sem filtrar pela data atual
      const validDates: Date[] = [];
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        validDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const dailyStats = validDates.map(date => {
        // Criando novas instâncias de Date para evitar modificação acidental
        const dayStart = normalizeToStartOfDay(new Date(date));
        const dayEnd = normalizeToEndOfDay(new Date(date));

        const dayActivities = activitiesResult.data.filter(activity => {
          if (!activity.created_at) return false;
          const activityDate = new Date(activity.created_at);
          // Comparação usando timestamp para evitar problemas de timezone
          return activityDate.getTime() >= dayStart.getTime() && 
                 activityDate.getTime() <= dayEnd.getTime();
        });

        const enrollments = dayActivities.filter(activity => 
          activity.tipo_atividade === 'Matrícula'
        ).length;

        const formattedDate = date.toISOString().split('T')[0];
        
        // Log detalhado para depuração das datas problemáticas
        const isRecentDate = date.getDate() >= 15 && date.getMonth() === 3; // Abril é mês 3 (0-indexed)
        if (isRecentDate) {
          console.log(`COMERCIAL - VERIFICAÇÃO DE DATA [${formattedDate}]:`, {
            dayStart: dayStart.toISOString(),
            dayEnd: dayEnd.toISOString(),
            totalDayActivities: dayActivities.length
          });
        }
        
        console.log(`Estatísticas comerciais para ${formattedDate}:`, {
          totalAtividades: dayActivities.length,
          matriculas: enrollments
        });

        return {
          date,
          newClients: clientsResult.data.filter(client => {
            if (!client.created_at) return false;
            const clientDate = new Date(client.created_at);
            // Comparação usando timestamp para evitar problemas de timezone
            return clientDate.getTime() >= dayStart.getTime() && 
                   clientDate.getTime() <= dayEnd.getTime();
          }).length,
          contactAttempts: dayActivities.filter(activity => 
            ['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
          ).length,
          effectiveContacts: dayActivities.filter(activity => 
            ['Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
          ).length,
          scheduledVisits: dayActivities.filter(activity => 
            activity.tipo_atividade === 'Agendamento'
          ).length,
          awaitingVisits: activitiesResult.data.filter(activity => {
            if (!activity.scheduled_date) return false;
            const scheduledDate = new Date(activity.scheduled_date);
            // Comparação usando timestamp para evitar problemas de timezone
            return activity.tipo_atividade === 'Agendamento' && 
                   scheduledDate.getTime() >= dayStart.getTime() && 
                   scheduledDate.getTime() <= dayEnd.getTime();
          }).length,
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
