
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"
import { PaginatedActivitiesData, ActivityData } from "../utils/types/kanbanTypes"
import { useDebounceFunction } from "../utils/hooks/useDebounceFunction"

export function useClientActivities(
  clientId: string,
  page: number = 1,
  limit: number = 10
) {
  const queryClient = useQueryClient()
  const offset = (page - 1) * limit
  
  // Criar invalidação com debounce para evitar múltiplas atualizações rápidas
  const debouncedInvalidateQueries = useDebounceFunction(() => {
    console.log(`Invalidando queries de atividades para cliente ${clientId} após debounce`);
    queryClient.invalidateQueries({ 
      queryKey: ['activities', clientId] 
    });
  }, 300);

  // Gera um ID único para o canal para evitar conflitos em remontagens rápidas
  const getChannelSuffix = () => Math.random().toString(36).substring(2, 10);

  // Enable realtime subscription for specific client activities
  useEffect(() => {
    if (!clientId) return

    console.log(`Configurando subscription realtime para atividades do cliente: ${clientId}`);
    
    // Usar um sufixo único para o canal para evitar conflitos em remontagens rápidas
    const channelSuffix = getChannelSuffix();
    
    const channel = supabase
      .channel(`activities-by-client-${clientId}-${channelSuffix}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Monitora todos os eventos (insert, update, delete)
          schema: 'public',
          table: 'client_activities',
          filter: `client_id=eq.${clientId}`
        },
        (payload) => {
          console.log('Mudança de atividade detectada para cliente específico:', clientId, payload);
          
          // Usar debounce para a invalidação
          debouncedInvalidateQueries();
          
          // Também invalida as queries de clientes para manter tudo sincronizado
          // Isso garante que o last_activity no card do Kanban também seja atualizado
          queryClient.invalidateQueries({ 
            queryKey: ['infinite-clients'] 
          });
        }
      )
      .subscribe((status) => {
        console.log(`Status da subscription para cliente ${clientId}:`, status);
      });

    return () => {
      console.log(`Limpando subscription realtime para cliente: ${clientId}`);
      supabase.removeChannel(channel);
    };
  }, [queryClient, clientId, debouncedInvalidateQueries]);

  return useQuery<PaginatedActivitiesData>({
    queryKey: ['activities', clientId, page],
    queryFn: async () => {
      console.log(`Buscando atividades para cliente ${clientId}, página ${page}, limit ${limit}`);
      
      const { data, error } = await supabase.rpc('kanban_client_activities', {
        p_client_id: clientId,
        p_limit: limit,
        p_offset: offset
      });

      if (error) {
        console.error('Erro ao buscar atividades do cliente:', error);
        throw error;
      }

      console.log(`Recebidas atividades para cliente ${clientId}:`, data);
      
      // Parse the JSON data safely and convert to ActivityData[]
      let activities: ActivityData[] = [];
      if (data && Array.isArray(data)) {
        activities = (data as unknown[]).map((item: any) => ({
          id: item.id,
          tipo_atividade: item.tipo_atividade,
          tipo_contato: item.tipo_contato,
          notes: item.notes,
          created_at: item.created_at,
          next_contact_date: item.next_contact_date,
          created_by: item.created_by,
          client_id: item.client_id,
          scheduled_date: item.scheduled_date,
          active: item.active
        }));
      }
      
      console.log(`Processadas ${activities.length} atividades para cliente ${clientId}`);
      
      return {
        activities,
        hasNextPage: activities.length === limit,
        currentPage: page
      };
    },
    enabled: !!clientId,
    staleTime: 30000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}
