
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

      // Use uma query direta ao invés de RPC
      const { data, error } = await supabase
        .from('client_activities')
        .select(`
          created_at,
          tipo_atividade
        `)
        .in('unit_id', unitsToUse)
        .gte('created_at', `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`)
        .lt('created_at', `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`)
        .eq('active', true);

      if (error) {
        console.error('Erro ao buscar estatísticas de atividades:', error);
        throw error;
      }

      // Transform the data into the required format
      const stats = new Map<string, DailyActivityStats>();
      
      // Initialize all days of the month
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(selectedYear, selectedMonth - 1, i);
        stats.set(date.toISOString().split('T')[0], {
          data: date,
          tentativa_contato: 0,
          contato_efetivo: 0,
          atendimento_agendado: 0,
          atendimento_realizado: 0,
          matricula: 0
        });
      }

      // Populate activity counts
      data?.forEach(activity => {
        const date = new Date(activity.created_at).toISOString().split('T')[0];
        const stat = stats.get(date);
        if (stat) {
          switch (activity.tipo_atividade) {
            case 'Tentativa de Contato':
              stat.tentativa_contato++;
              break;
            case 'Contato Efetivo':
              stat.contato_efetivo++;
              break;
            case 'Agendamento':
              stat.atendimento_agendado++;
              break;
            case 'Atendimento':
              stat.atendimento_realizado++;
              break;
            case 'Matrícula':
              stat.matricula++;
              break;
          }
        }
      });

      return Array.from(stats.values());
    },
    // Se não tiver dados, retorna um array vazio
    placeholderData: []
  });
}
