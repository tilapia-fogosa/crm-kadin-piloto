/**
 * LOG: Hook para buscar turmas com informações do professor
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnit } from "@/contexts/UnitContext";
import { TurmaWithProfessor } from "../types/pedagogical-data.types";

export function useTurmas() {
  const { selectedUnitId } = useUnit();

  return useQuery({
    queryKey: ['turmas-with-professor', selectedUnitId],
    queryFn: async (): Promise<TurmaWithProfessor[]> => {
      console.log('LOG: Buscando turmas com professores para unidade:', selectedUnitId);
      
      const { data, error } = await supabase.rpc('get_turmas_with_professor', {
        p_unit_id: selectedUnitId
      });

      if (error) {
        console.error('LOG: Erro ao buscar turmas com professores:', error);
        throw error;
      }

      console.log('LOG: Turmas encontradas:', data?.length || 0);
      return (data as TurmaWithProfessor[]) || [];
    },
    enabled: !!selectedUnitId
  });
}
