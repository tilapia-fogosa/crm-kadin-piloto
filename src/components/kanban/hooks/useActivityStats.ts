
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, setYear, setMonth, startOfDay, isAfter, parseISO } from "date-fns";
import { DailyStats } from "../types/activity-dashboard.types";
import { UserUnit } from "./useUserUnit";
import { createSafeDate } from "@/utils/dateUtils";

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
      // Conversão segura de strings para números
      const monthNum = parseInt(selectedMonth);
      const yearNum = parseInt(selectedYear);
      
      // Log inicial detalhado
      console.log('Activity Stats - Parâmetros de filtragem:', { 
        selectedMonth: monthNum, 
        selectedYear: yearNum,
        selectedSource,
        selectedUnitId,
        currentDate: new Date().toISOString()
      });
      
      // Criação segura de datas de início e fim do mês
      // Corrigindo a criação de datas - monthNum já é 0-indexed nos valores do select (0-11)
      const startDate = startOfMonth(createSafeDate(yearNum, monthNum));
      const endDate = endOfMonth(createSafeDate(yearNum, monthNum));
      
      console.log('Activity Stats - Período de consulta corrigido:', { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString()
      });

      const unitIds = selectedUnitId === 'todas' 
        ? userUnits?.map(u => u.unit_id) || []
        : [selectedUnitId];
        
      // Busca dados no Supabase
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

      // CORREÇÃO IMPORTANTE: Gerar datas para todos os dias do mês, sem filtrar por data atual
      // Isso permite mostrar todos os dias, mesmo os futuros ou passados
      const validDates: Date[] = [];
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        // Adicionamos todos os dias do mês selecionado, sem filtrar pela data atual
        validDates.push(new Date(currentDate));
        
        // Avança para o próximo dia
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      console.log(`Gerando estatísticas para ${validDates.length} dias no período (todos os dias do mês)`);

      const dailyStats = validDates.map(date => {
        // Criando novas instâncias de Date para evitar modificação acidental
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        const formattedDate = dayStart.toISOString().split('T')[0];

        // Atividades criadas no dia
        const dayActivities = activities.filter(activity => {
          const activityDate = new Date(activity.created_at);
          return activityDate >= dayStart && activityDate <= dayEnd;
        });

        // Visitas aguardadas para o dia
        const dayAwaitingVisits = awaitingVisits.filter(activity => {
          if (!activity.scheduled_date) return false;
          const scheduledDate = new Date(activity.scheduled_date);
          return scheduledDate >= dayStart && scheduledDate <= dayEnd;
        });

        const dayClients = clients.filter(client => {
          const clientDate = new Date(client.created_at);
          return clientDate >= dayStart && clientDate <= dayEnd;
        });

        const enrollments = dayActivities.filter(activity => 
          activity.tipo_atividade === 'Matrícula'
        ).length;

        console.log(`Estatísticas para ${formattedDate}:`, {
          clientes: dayClients.length,
          totalAtividades: dayActivities.length,
          visitasAguardadas: dayAwaitingVisits.length,
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
          // Usando o resultado da nova query para visitas aguardadas
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
