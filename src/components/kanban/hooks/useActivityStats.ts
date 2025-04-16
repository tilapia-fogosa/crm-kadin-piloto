
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, startOfDay, isAfter, parseISO } from "date-fns";
import { DailyStats } from "../types/activity-dashboard.types";
import { UserUnit } from "./useUserUnit";
import { createSafeDate, normalizeToStartOfDay, normalizeToEndOfDay } from "@/utils/dateUtils";

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
      // Corrigindo a criação de datas - monthNum já é 0-indexed nos valores do select (0-11)
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

      // Amostra de logs para verificar dados
      if (activities.length > 0) {
        console.log('Primeira atividade:', {
          id: activities[0].id,
          tipo: activities[0].tipo_atividade,
          created_at: activities[0].created_at,
          client: activities[0].clients?.name
        });
        console.log('Última atividade:', {
          id: activities[activities.length-1].id,
          tipo: activities[activities.length-1].tipo_atividade,
          created_at: activities[activities.length-1].created_at,
          client: activities[activities.length-1].clients?.name
        });
      }

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
        const dayStart = normalizeToStartOfDay(new Date(date));
        const dayEnd = normalizeToEndOfDay(new Date(date));
        
        const formattedDate = dayStart.toISOString().split('T')[0];
        
        // Atividades criadas no dia - usando normalização de data para comparação adequada
        const dayActivities = activities.filter(activity => {
          if (!activity.created_at) return false;
          const activityDate = new Date(activity.created_at);
          // Comparação usando timestamp para evitar problemas de timezone
          return activityDate.getTime() >= dayStart.getTime() && 
                 activityDate.getTime() <= dayEnd.getTime();
        });

        // Visitas aguardadas para o dia - usando normalização para comparação adequada
        const dayAwaitingVisits = awaitingVisits.filter(activity => {
          if (!activity.scheduled_date) return false;
          const scheduledDate = new Date(activity.scheduled_date);
          // Comparação usando timestamp para evitar problemas de timezone
          return scheduledDate.getTime() >= dayStart.getTime() && 
                 scheduledDate.getTime() <= dayEnd.getTime();
        });

        const dayClients = clients.filter(client => {
          if (!client.created_at) return false;
          const clientDate = new Date(client.created_at);
          // Comparação usando timestamp para evitar problemas de timezone
          return clientDate.getTime() >= dayStart.getTime() && 
                 clientDate.getTime() <= dayEnd.getTime();
        });

        const enrollments = dayActivities.filter(activity => 
          activity.tipo_atividade === 'Matrícula'
        ).length;

        // Log detalhado para depuração das datas problemáticas
        const isRecentDate = date.getDate() >= 15 && date.getMonth() === 3; // Abril é mês 3 (0-indexed)
        if (isRecentDate) {
          console.log(`VERIFICAÇÃO DE DATA [${formattedDate}]:`, {
            dayStart: dayStart.toISOString(),
            dayEnd: dayEnd.toISOString(),
            totalDayActivities: dayActivities.length,
            totalDayVisitas: dayAwaitingVisits.length,
            filtroTimestamp: {
              dayStartTimestamp: dayStart.getTime(),
              dayEndTimestamp: dayEnd.getTime()
            }
          });
          
          // Para datas recentes, vamos verificar cada atividade
          activities.forEach(activity => {
            if (activity.created_at) {
              const actDate = new Date(activity.created_at);
              const isInDay = actDate.getTime() >= dayStart.getTime() && 
                             actDate.getTime() <= dayEnd.getTime();
              
              if (isInDay) {
                console.log(`✅ Atividade encontrada para ${formattedDate}:`, {
                  id: activity.id,
                  tipo: activity.tipo_atividade,
                  created_at: activity.created_at,
                  timestamp: actDate.getTime()
                });
              }
            }
          });
        }

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
