/**
 * LOG: Hook customizado para buscar tipos de kit disponíveis
 * Focado em buscar Kit 1-8 conforme especificação do usuário
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KitType } from "../types/commercial-data.types";

/**
 * Hook para buscar kit types de uma unidade específica
 * LOG: Busca todos os kits ativos da unidade (Kit 1-8)
 */
export function useKitTypes(unitId: string) {
  const {
    data: kitTypes,
    isLoading,
    error
  } = useQuery({
    queryKey: ['kit-types', unitId],
    queryFn: async (): Promise<KitType[]> => {
      console.log('LOG: Buscando kit types para unidade:', unitId);
      
      const { data, error } = await supabase
        .from('kit_types')
        .select('id, name, description, unit_id, active')
        .eq('unit_id', unitId)
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('LOG: Erro ao buscar kit types:', error);
        throw error;
      }

      console.log('LOG: Kit types obtidos:', data);
      return data || [];
    },
    enabled: !!unitId
  });

  return {
    kitTypes: kitTypes || [],
    isLoading,
    error
  };
}

/**
 * Hook para buscar todos os kit types do sistema (para admin)
 * LOG: Versão administrativa que busca kits de todas as unidades
 */
export function useAllKitTypes() {
  const {
    data: kitTypes,
    isLoading,
    error
  } = useQuery({
    queryKey: ['all-kit-types'],
    queryFn: async (): Promise<KitType[]> => {
      console.log('LOG: Buscando todos os kit types do sistema');
      
      const { data, error } = await supabase
        .from('kit_types')
        .select('id, name, description, unit_id, active')
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('LOG: Erro ao buscar todos os kit types:', error);
        throw error;
      }

      console.log('LOG: Todos os kit types obtidos:', data);
      return data || [];
    }
  });

  return {
    kitTypes: kitTypes || [],
    isLoading,
    error
  };
}