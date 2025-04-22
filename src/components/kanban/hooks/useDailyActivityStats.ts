
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

export interface DailyActivityStats {
  data: Date;
  tentativa_contato: number;
  contato_efetivo: number;
  atendimento_agendado: number;
  atendimento_realizado: number;
  matricula: number;
}

export function useDailyActivityStats(
  selectedMonth: number, 
  selectedYear: number, 
  selectedUnitId: string | null
) {
  return useQuery({
    queryKey: ['dailyActivityStats', selectedMonth, selectedYear, selectedUnitId],
    queryFn: async () => {
      console.log('Buscando estatísticas de atividades diárias');
      
      const { data: userUnits } = await supabase
        .from('unit_users')
        .select('unit_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      // Se nenhuma unidade for selecionada, usa todas as unidades do usuário
      const unitsToUse = selectedUnitId 
        ? [selectedUnitId] 
        : userUnits?.map(u => u.unit_id) || [];

      const { data, error } = await supabase.rpc('get_daily_activity_stats', {
        selected_month: selectedMonth,
        selected_year: selectedYear,
        selected_unit_ids: unitsToUse
      });

      if (error) {
        console.error('Erro ao buscar estatísticas de atividades:', error);
        throw error;
      }

      return data as DailyActivityStats[];
    },
    // Se não tiver dados, retorna um array vazio
    placeholderData: []
  });
}
