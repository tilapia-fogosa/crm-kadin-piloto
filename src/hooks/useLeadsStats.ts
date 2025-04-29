
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export interface PeriodStats {
  total: number
  comparison: number
}

export interface LeadsStatsData {
  oneMonth?: {
    total: number;
    comparison: number;
  };
  threeMonths?: {
    total: number;
    comparison: number;
  };
  sixMonths?: {
    total: number;
    comparison: number;
  };
  twelveMonths?: {
    total: number;
    comparison: number;
  };
}

export function useLeadsStats(unitIds: string[] | null) {
  console.log('useLeadsStats chamado com unitIds:', unitIds);
  
  return useQuery({
    queryKey: ['leads-stats', unitIds],
    queryFn: async (): Promise<LeadsStatsData | null> => {
      // Verificar se há unidades selecionadas
      if (!unitIds || unitIds.length === 0) {
        console.log('Nenhuma unidade selecionada, retornando null');
        return null;
      }
      
      // Chamar a função RPC que já calcula as estatísticas no banco
      console.log('Chamando RPC get_leads_stats com unitIds:', unitIds);
      const { data, error } = await supabase
        .rpc('get_leads_stats', { p_unit_ids: unitIds });
      
      if (error) {
        console.error('Erro ao buscar estatísticas de leads:', error);
        throw error;
      }
      
      console.log('Dados recebidos da função RPC:', data);
      
      // Se não houver dados, retornar null
      if (!data) {
        return null;
      }
      
      // Retornar os dados já formatados conforme a interface esperada
      return data as LeadsStatsData;
    },
    enabled: !!unitIds && unitIds.length > 0,
    // Definir staleTime para evitar recarregamentos frequentes
    staleTime: 5 * 60 * 1000 // 5 minutos
  });
}
