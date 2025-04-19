
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth } from "date-fns";
import { DailyStats } from "../types/activity-dashboard.types";
import { createSafeDate } from "@/utils/dateUtils";
import { processDailyStats } from "../utils/activity/activityStatsProcessor";

export function useActivityStats(
  selectedSource: string,
  selectedMonth: string,
  selectedYear: string,
  userUnits: any[] | undefined,
  selectedUnitId: string
) {
  return useQuery({
    queryKey: ['activity-dashboard', selectedSource, selectedMonth, selectedYear, selectedUnitId, userUnits?.map(u => u.unit_id)],
    queryFn: async () => {
      // Log inicial para debug
      console.log('Activity Stats - Parâmetros:', {
        selectedMonth,
        selectedYear,
        selectedSource,
        selectedUnitId,
        userUnits: userUnits?.map(u => ({ id: u.unit_id, name: u.units.name }))
      });

      // Conversão segura de strings para números
      const monthNum = parseInt(selectedMonth);
      const yearNum = parseInt(selectedYear);
      
      // Criação segura de datas de início e fim do mês
      const startDate = startOfMonth(createSafeDate(yearNum, monthNum));
      const endDate = endOfMonth(createSafeDate(yearNum, monthNum));
      
      console.log('Activity Stats - Período:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // Determinar IDs das unidades para filtro
      const unitIds = selectedUnitId === 'todas' 
        ? userUnits?.map(u => u.unit_id) || []
        : [selectedUnitId];

      // Buscar clientes ativos criados no período
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq(selectedSource !== 'todos' ? 'lead_source' : '', selectedSource !== 'todos' ? selectedSource : '');

      if (clientsError) throw clientsError;
      
      // Buscar atividades do período
      const { data: activities, error: activitiesError } = await supabase
        .from('client_activities')
        .select(`
          *,
          clients!inner(*)
        `)
        .eq('active', true)
        .eq('clients.active', true)
        .in('unit_id', unitIds)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq(selectedSource !== 'todos' ? 'clients.lead_source' : '', selectedSource !== 'todos' ? selectedSource : '');

      if (activitiesError) throw activitiesError;

      console.log('Activity Stats - Dados encontrados:', {
        totalClients: clients?.length || 0,
        totalActivities: activities?.length || 0
      });

      // Gerar array com todas as datas do mês
      const validDates: Date[] = [];
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        validDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Processar estatísticas para cada dia
      const dailyStats = validDates.map(date => 
        processDailyStats(date, activities || [], clients || [])
      );

      return dailyStats;
    },
    enabled: userUnits !== undefined && userUnits.length > 0,
  });
}
