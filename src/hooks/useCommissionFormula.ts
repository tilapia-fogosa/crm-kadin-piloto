/**
 * LOG: Hook para gerenciar fórmulas de comissão
 * DESCRIÇÃO: Busca e gerencia fórmulas ativas da unidade
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CommissionFormula } from "@/types/commission.types";

/**
 * Hook para buscar a fórmula ativa de uma unidade
 * @param unitId - ID da unidade
 * @returns Fórmula ativa ou null
 */
export function useCommissionFormula(unitId: string | undefined) {
  return useQuery({
    queryKey: ['commission-formula', unitId],
    queryFn: async () => {
      console.log('LOG: Buscando fórmula ativa para unidade', unitId);
      
      if (!unitId) {
        console.log('LOG: Unit ID não fornecido');
        return null;
      }

      const { data, error } = await supabase
        .from('commission_formulas')
        .select('*')
        .eq('unit_id', unitId)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('LOG: Erro ao buscar fórmula:', error);
        throw error;
      }

      console.log('LOG: Fórmula encontrada:', data);
      return data as CommissionFormula | null;
    },
    enabled: !!unitId,
  });
}

/**
 * Hook para salvar/atualizar fórmula de comissão
 * @param unitId - ID da unidade
 * @returns Mutation para salvar fórmula
 */
export function useSaveCommissionFormula(unitId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formula: Partial<CommissionFormula>) => {
      console.log('LOG: Salvando fórmula de comissão', formula);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Desativar fórmulas anteriores
      await supabase
        .from('commission_formulas')
        .update({ active: false })
        .eq('unit_id', unitId)
        .eq('active', true);

      // Inserir nova fórmula
      const { data, error } = await supabase
        .from('commission_formulas')
        .insert({
          unit_id: unitId,
          formula_name: formula.formula_name!,
          formula_expression: formula.formula_expression!,
          variables_config: formula.variables_config || {},
          valid_from: formula.valid_from || new Date().toISOString().split('T')[0],
          valid_until: formula.valid_until || null,
          created_by: user.id,
          active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('LOG: Erro ao salvar fórmula:', error);
        throw error;
      }

      console.log('LOG: Fórmula salva com sucesso:', data);
      return data as CommissionFormula;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-formula', unitId] });
      toast({
        title: "Fórmula salva",
        description: "A fórmula de comissão foi salva com sucesso.",
      });
    },
    onError: (error) => {
      console.error('LOG: Erro ao salvar fórmula:', error);
      toast({
        title: "Erro ao salvar fórmula",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
}
