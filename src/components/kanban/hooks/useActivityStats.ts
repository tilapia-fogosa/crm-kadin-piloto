
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, startOfDay, isAfter, parseISO } from "date-fns";
import { DailyStats } from "../types/activity-dashboard.types";
import { UserUnit } from "./useUserUnit";
import { 
  createSafeDate, 
  normalizeToStartOfDay, 
  normalizeToEndOfDay, 
  isSameLocalDate,
  utcToLocalDay
} from "@/utils/dateUtils";

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
        currentDate: new Date().toISOString(),
        userUnits: userUnits?.map(u => ({ id: u.unit_id, name: u.units.name }))
      });
      
      // Criação segura de datas de início e fim do mês
      // monthNum já é 0-indexed nos valores do select (0-11)
      const startDate = startOfMonth(createSafeDate(yearNum, monthNum));
      const endDate = endOfMonth(createSafeDate(yearNum, monthNum));
      
      console.log('Activity Stats - Período de consulta:', { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(),
        startDateString: startDate.toLocaleDateString(),
        endDateString: endDate.toLocaleDateString()
      });

      const unitIds = selectedUnitId === 'todas' 
        ? userUnits?.map(u => u.unit_id) || []
        : [selectedUnitId];
        
      console.log('Activity Stats - Unidades para filtro:', {
        unitIds,
        isTodasSelected: selectedUnitId === 'todas'
      });

      // Datas ISO para uso no Supabase (garantindo compatibilidade de timezone)
      const startDateIso = startDate.toISOString();
      const endDateIso = endDate.toISOString();
      
      console.log('Activity Stats - Datas ISO para Supabase:', {
        startDateIso,
        endDateIso
      });

      // Busca dados no Supabase
      const [clientsResult, activitiesResult, awaitingVisitsResult] = await Promise.all([
        // Clientes criados no período
        supabase.from('clients')
          .select('*')
          .eq('active', true)
          .in('unit_id', unitIds)
          .gte('created_at', startDateIso)
          .lte('created_at', endDateIso)
          .eq(selectedSource !== 'todos' ? 'lead_source' : '', selectedSource !== 'todos' ? selectedSource : ''),
        
        // Atividades realizadas no período (created_at)
        supabase.from('client_activities')
          .select('*, clients!inner(*)')
          .eq('active', true)
          .eq('clients.active', true)
          .in('clients.unit_id', unitIds)
          .gte('created_at', startDateIso)
          .lte('created_at', endDateIso)
          .eq(selectedSource !== 'todos' ? 'clients.lead_source' : '', selectedSource !== 'todos' ? selectedSource : ''),
          
        // Visitas aguardadas - busca separada com filtro por scheduled_date
        supabase.from('client_activities')
          .select('*, clients!inner(*)')
          .eq('active', true)
          .eq('tipo_atividade', 'Agendamento')
          .eq('clients.active', true)
          .in('clients.unit_id', unitIds)
          .gte('scheduled_date', startDateIso)
          .lte('scheduled_date', endDateIso)
          .eq(selectedSource !== 'todos' ? 'clients.lead_source' : '', selectedSource !== 'todos' ? selectedSource : '')
      ]);

      if (clientsResult.error) {
        console.error('Erro ao buscar clientes:', clientsResult.error);
        throw clientsResult.error;
      }
      if (activitiesResult.error) {
        console.error('Erro ao buscar atividades:', activitiesResult.error);
        throw activitiesResult.error;
      }
      if (awaitingVisitsResult.error) {
        console.error('Erro ao buscar visitas aguardadas:', awaitingVisitsResult.error);
        throw awaitingVisitsResult.error;
      }

      const clients = clientsResult.data;
      const activities = activitiesResult.data;
      const awaitingVisits = awaitingVisitsResult.data;

      console.log('Total de clientes encontrados:', clients.length);
      console.log('Total de atividades encontradas:', activities.length);
      console.log('Total de visitas aguardadas encontradas:', awaitingVisits.length);

      // Gerar datas para todos os dias do mês
      const validDates: Date[] = [];
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        validDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      console.log(`Gerando estatísticas para ${validDates.length} dias no período (todos os dias do mês)`);

      // Diagnóstico detalhado para atividades do período problemático
      console.log("=== DIAGNÓSTICO DE ATIVIDADES ===");
      // Obtém os últimos dias do mês para diagnóstico
      const lastDaysOfMonth = validDates.slice(-5);
      
      for (const day of lastDaysOfMonth) {
        const formattedDate = day.toISOString().split('T')[0];
        console.log(`\nVerificação detalhada para: ${formattedDate}`);
        
        // Filtrando atividades para este dia
        const dayActivitiesDetailed = activities.filter(activity => {
          if (!activity.created_at) return false;
          
          const activityDate = new Date(activity.created_at);
          
          // Verificar usando comparação de datas locais
          const isSameDay = isSameLocalDate(day, activityDate);
          
          // Log detalhado sobre a decisão
          if (isSameDay) {
            console.log(`MATCH ✅ Atividade ${activity.id} [${activity.tipo_atividade}] - created_at: ${activity.created_at}`);
          }
          
          return isSameDay;
        });
        
        console.log(`Total de atividades encontradas para ${formattedDate}: ${dayActivitiesDetailed.length}`);
      }
      
      // Processar as estatísticas diárias com a nova abordagem
      const dailyStats = validDates.map(date => {
        // Formatação para logging
        const formattedDate = date.toISOString().split('T')[0];
        
        // Clientes criados no dia
        const dayClients = clients.filter(client => {
          if (!client.created_at) return false;
          const clientDate = new Date(client.created_at);
          return isSameLocalDate(date, clientDate);
        });

        // Atividades criadas no dia
        const dayActivities = activities.filter(activity => {
          if (!activity.created_at) return false;
          const activityDate = new Date(activity.created_at);
          return isSameLocalDate(date, activityDate);
        });

        // Visitas aguardadas para o dia
        const dayAwaitingVisits = awaitingVisits.filter(activity => {
          if (!activity.scheduled_date) return false;
          const scheduledDate = new Date(activity.scheduled_date);
          return isSameLocalDate(date, scheduledDate);
        });

        const enrollments = dayActivities.filter(activity => 
          activity.tipo_atividade === 'Matrícula'
        ).length;

        // Log de verificação para os dias problemáticos
        const isRecentDate = date.getDate() >= 14;
        if (isRecentDate) {
          console.log(`RESUMO DIÁRIO [${formattedDate}]:`, {
            totalClientes: dayClients.length,
            totalAtividades: dayActivities.length,
            visitasAguardadas: dayAwaitingVisits.length,
            tiposAtividade: dayActivities.map(a => a.tipo_atividade)
          });
        }

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

      // Calcular taxas de conversão
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
