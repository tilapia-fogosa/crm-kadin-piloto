/**
 * LOG: Hook para buscar slots disponíveis de aula inaugural
 * Utiliza RPC get_horarios_aula_inaugural para verificar disponibilidade de professor e sala
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { AulaInauguralSlot } from "../types/pedagogical-data.types";

export function useAulaInauguralSlots(selectedDate: Date | undefined, unitId: string) {
  console.log('LOG: useAulaInauguralSlots - Data:', selectedDate, 'Unit:', unitId);

  return useQuery({
    queryKey: ['aula-inaugural-slots', selectedDate, unitId],
    queryFn: async (): Promise<AulaInauguralSlot[]> => {
      if (!selectedDate || !unitId) {
        console.log('LOG: Data ou unidade não fornecida');
        return [];
      }

      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      console.log('LOG: Buscando slots para data formatada:', formattedDate);

      const { data, error } = await supabase.rpc('get_horarios_aula_inaugural', {
        p_data: formattedDate,
        p_unit_id: unitId
      });

      if (error) {
        console.error('LOG: Erro ao buscar slots de aula inaugural:', error);
        throw error;
      }

      console.log('LOG: Slots encontrados:', data?.length || 0);
      return (data as AulaInauguralSlot[]) || [];
    },
    enabled: !!selectedDate && !!unitId,
    staleTime: 1000 * 60, // Cache por 1 minuto
  });
}
