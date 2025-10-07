/**
 * LOG: Hook para gerenciar cálculos de comissões
 * DESCRIÇÃO: Busca resumos, detalhes e gerencia consolidações de comissões
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  CommissionSummary,
  CommissionSaleDetail,
  CommissionFilters,
  CalculationResult,
} from "@/types/commission.types";

/**
 * Hook para buscar resumo de comissões com filtros
 */
export function useCommissionSummary(filters: CommissionFilters) {
  return useQuery({
    queryKey: ['commission-summary', filters],
    queryFn: async () => {
      console.log('LOG: Buscando resumo de comissões com filtros:', filters);

      const { data, error } = await supabase.rpc('get_commission_summary', {
        p_unit_id: filters.unitId,
        p_consultant_id: filters.consultantId || null,
        p_start_month: filters.startMonth || null,
        p_end_month: filters.endMonth || null,
      });

      if (error) {
        console.error('LOG: Erro ao buscar resumo:', error);
        throw error;
      }

      console.log('LOG: Resumo de comissões retornado:', data?.length || 0, 'registros');
      return (data || []) as unknown as CommissionSummary[];
    },
    enabled: !!filters.unitId,
  });
}

/**
 * Hook para buscar detalhes de vendas de um cálculo específico
 */
export function useCommissionSaleDetails(calculationId: string | undefined) {
  return useQuery({
    queryKey: ['commission-sale-details', calculationId],
    queryFn: async () => {
      console.log('LOG: Buscando detalhes de vendas para cálculo', calculationId);

      if (!calculationId) return [];

      const { data, error } = await supabase
        .from('commission_sale_details')
        .select('*')
        .eq('calculation_id', calculationId)
        .order('sale_date', { ascending: false });

      if (error) {
        console.error('LOG: Erro ao buscar detalhes:', error);
        throw error;
      }

      console.log('LOG: Detalhes de vendas retornados:', data?.length || 0, 'vendas');
      return data as CommissionSaleDetail[];
    },
    enabled: !!calculationId,
  });
}

/**
 * Hook para calcular comissão de um mês
 */
export function useCalculateCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      unitId: string;
      consultantId: string;
      month: string;
      forceRecalculate?: boolean;
    }) => {
      console.log('LOG: Calculando comissão:', params);

      const { data, error } = await supabase.rpc('calculate_monthly_commission', {
        p_unit_id: params.unitId,
        p_consultant_id: params.consultantId,
        p_month: params.month,
        p_force_recalculate: params.forceRecalculate || false,
      });

      if (error) {
        console.error('LOG: Erro ao calcular comissão:', error);
        throw error;
      }

      console.log('LOG: Comissão calculada:', data);
      return data as unknown as CalculationResult;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['commission-summary'] });
      queryClient.invalidateQueries({ 
        queryKey: ['commission-sale-details'] 
      });
      
      toast({
        title: "Comissão calculada",
        description: `Comissão do mês ${variables.month} calculada com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('LOG: Erro ao calcular comissão:', error);
      toast({
        title: "Erro ao calcular comissão",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook para consolidar comissão (impedir recálculos)
 */
export function useConsolidateCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (calculationId: string) => {
      console.log('LOG: Consolidando comissão:', calculationId);

      const { data, error } = await supabase.rpc('consolidate_monthly_commission', {
        p_calculation_id: calculationId,
      });

      if (error) {
        console.error('LOG: Erro ao consolidar comissão:', error);
        throw error;
      }

      console.log('LOG: Comissão consolidada');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-summary'] });
      
      toast({
        title: "Comissão consolidada",
        description: "A comissão foi consolidada e não poderá ser recalculada automaticamente.",
      });
    },
    onError: (error) => {
      console.error('LOG: Erro ao consolidar comissão:', error);
      toast({
        title: "Erro ao consolidar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
}
