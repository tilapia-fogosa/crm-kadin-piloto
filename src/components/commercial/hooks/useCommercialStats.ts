import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, startOfDay, format } from "date-fns";
import { DailyStats } from "../../kanban/types/activity-dashboard.types";
import { createSafeDate, getDateString } from "@/utils/date";

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
      
      // Criação segura de datas de início e fim do mês usando a nova função
      const startDate = startOfMonth(createSafeDate(yearNum, monthNum));
      const endDate = endOfMonth(createSafeDate(yearNum, monthNum));

      console.log('Buscando estatísticas comerciais:', { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(),
        selectedSource,
        selectedUnitId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
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

      // Detalhamento por unidade para debug
      const activityByUnit = activitiesResult.data.reduce((acc: Record<string, number>, activity) => {
        acc[activity.unit_id] = (acc[activity.unit_id] || 0) + 1;
        return acc;
      }, {});
      console.log('Distribuição de atividades por unidade:', activityByUnit);

      // CORREÇÃO: Incluir todos os dias do mês, sem filtrar pela data atual
      const validDates: Date[] = [];
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        validDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const dailyStats = validDates.map(date => {
        // Formatação para logging
        const formattedDate = date.toISOString().split('T')[0];
        
        // Normalizar data de referência para comparações
        const refDateNormalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        // Clientes criados no dia
        const dayClients = clientsResult.data.filter(client => {
          if (!client.created_at) return false;
          const clientDate = new Date(client.created_at);
          const clientDateNormalized = new Date(clientDate.getFullYear(), clientDate.getMonth(), clientDate.getDate());
          return refDateNormalized.getTime() === clientDateNormalized.getTime();
        });

        // Atividades criadas no dia
        const dayActivities = activitiesResult.data.filter(activity => {
          if (!activity.created_at) return false;
          const activityDate = new Date(activity.created_at);
          const activityDateNormalized = new Date(activityDate.getFullYear(), activityDate.getMonth(), activityDate.getDate());
          return refDateNormalized.getTime() === activityDateNormalized.getTime();
        });

        const enrollments = dayActivities.filter(activity => 
          activity.tipo_atividade === 'Matrícula'
        ).length;

        // Log detalhado para depuração das datas problemáticas
        const isRecentDate = date.getDate() >= 15 && date.getMonth() === 3; // Abril é mês 3 (0-indexed)
        if (isRecentDate) {
          console.log(`COMERCIAL - VERIFICAÇÃO DE DATA [${formattedDate}]:`, {
            totalDayActivities: dayActivities.length,
            tiposAtividade: dayActivities.map(a => a.tipo_atividade),
            refDateNormalized: refDateNormalized.toISOString()
          });
        }
        
        console.log(`Estatísticas comerciais para ${formattedDate}:`, {
          totalAtividades: dayActivities.length,
          matriculas: enrollments
        });

        return {
          date,
          newClients: dayClients.length,
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
            const scheduledDateNormalized = new Date(scheduledDate.getFullYear(), scheduledDate.getMonth(), scheduledDate.getDate());
            return refDateNormalized.getTime() === scheduledDateNormalized.getTime() && 
                   activity.tipo_atividade === 'Agendamento';
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
