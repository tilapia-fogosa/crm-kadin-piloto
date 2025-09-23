import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnit } from "@/contexts/UnitContext";

export interface PosVendaActivity {
  id: string;
  client_id: string;
  client_activity_id: string;
  client_name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Campos do student
  full_name?: string;
  cpf?: string;
  rg?: string;
  birth_date?: string;
  address_postal_code?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  photo_url?: string;
  photo_thumbnail_url?: string;
}

export function usePosVendaActivities() {
  const { selectedUnitId } = useUnit();

  const { data: activities, isLoading, error, refetch } = useQuery({
    queryKey: ['pos-venda-activities', selectedUnitId],
    queryFn: async () => {
      if (!selectedUnitId) return [];

      console.log('LOG: Buscando atividades de pós-venda para unidade:', selectedUnitId);

      // Buscar atividades de pós-venda para a unidade selecionada
      const { data, error } = await supabase
        .from('atividade_pos_venda')
        .select(`
          *,
          clients!inner(unit_id)
        `)
        .eq('clients.unit_id', selectedUnitId)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('LOG: Erro ao buscar atividades de pós-venda:', error);
        throw error;
      }

      console.log('LOG: Atividades de pós-venda encontradas:', data?.length || 0);
      return data || [];
    },
    enabled: !!selectedUnitId,
  });

  return {
    activities: activities as PosVendaActivity[],
    isLoading,
    error,
    refetch,
  };
}