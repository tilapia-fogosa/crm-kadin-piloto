
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

// Interface para os dados brutos retornados pelo Supabase
interface UserUnitRaw {
  unit_id: string;
  units: {
    id: string;
    name: string;
  };
}

// Interface normalizada que será exportada
export interface UserUnit {
  unit_id: string;
  unit_name: string;
}

export function useUserUnit() {
  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['user-unit'],
    queryFn: async () => {
      console.log('Iniciando busca de unidades do usuário');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('Usuário não autenticado');
        throw new Error('Not authenticated');
      }

      console.log('Buscando unidades do usuário:', session.user.id);
      
      const { data: unitUsers, error } = await supabase
        .from('unit_users')
        .select(`
          unit_id,
          units (
            id,
            name
          )
        `)
        .eq('user_id', session.user.id)
        .eq('active', true)
        .order('unit_id');

      if (error) {
        console.error('Erro ao buscar unidades do usuário:', error);
        throw error;
      }

      // Remove duplicates using Set and map to ensure type safety
      const uniqueUnitIds = new Set();
      const uniqueUnits = unitUsers?.filter(unit => {
        if (uniqueUnitIds.has(unit.unit_id)) {
          return false;
        }
        uniqueUnitIds.add(unit.unit_id);
        return true;
      });

      console.log('Unidades encontradas (dados brutos):', uniqueUnits);
      return uniqueUnits as UserUnitRaw[];
    }
  });

  // Normaliza os dados para a estrutura esperada pelo UnitContext
  const data = useMemo(() => {
    if (!rawData) return undefined;
    
    const normalized = rawData.map(({ unit_id, units }) => ({
      unit_id: unit_id, // CORREÇÃO: usar o unit_id original em vez de units.id
      unit_name: units.name // Adiciona o nome para facilitar uso futuro
    }));
    
    console.log('Dados normalizados:', normalized);
    console.log('IDs das unidades normalizadas:', normalized.map(u => u.unit_id));
    return normalized;
  }, [rawData]);

  return { data, isLoading, error };
}
