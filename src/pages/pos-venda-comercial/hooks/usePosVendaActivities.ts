import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnit } from "@/contexts/UnitContext";

export interface PosVendaActivity {
  id: string;
  client_id: string;
  client_activity_id: string;
  client_name: string;
  created_by: string;
  created_by_name: string; // Nome do usuário que criou
  created_at: string;
  updated_at: string;
  active: boolean;
  unit_id: string; // ID da unidade através do cliente
  
  // Campos do student/cliente
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

      console.log('LOG: Chamando função backend get_pos_venda_activities para unidade:', selectedUnitId);

      // Usar função backend otimizada com RPC
      const { data, error } = await supabase.rpc('get_pos_venda_activities', {
        p_unit_ids: [selectedUnitId]
      });

      if (error) {
        console.error('LOG: Erro ao chamar função backend get_pos_venda_activities:', error);
        throw error;
      }

      console.log('LOG: Atividades de pós-venda retornadas pela função backend:', data?.length || 0);
      console.log('LOG: Primeira atividade (debug):', data?.[0]);
      
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