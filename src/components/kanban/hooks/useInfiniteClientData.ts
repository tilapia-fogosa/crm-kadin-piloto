
import { useInfiniteQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"
import { useUserUnit } from "./useUserUnit"
import { ClientSummaryData } from "../utils/types/kanbanTypes"

interface InfiniteClientData {
  clients: ClientSummaryData[]
  totalCount: number
  hasNextPage: boolean
  currentPage: number
}

interface PaginationOptions {
  limit?: number
}

export function useInfiniteClientData(
  selectedUnitIds: string[] = [], 
  searchTerm: string = '',
  showPendingOnly: boolean = false,
  paginationOptions: PaginationOptions = {}
) {
  const queryClient = useQueryClient()
  const { data: userUnits } = useUserUnit()
  const { limit = 400 } = paginationOptions
  
  // Hook para gerar um ID único para os canais em caso de remontagem rápida
  const getChannelSuffix = () => Math.random().toString(36).substring(2, 10);

  // Configurar subscriptions realtime quando o hook é montado
  useEffect(() => {
    console.log('🔔 [useInfiniteClientData] Configurando subscriptions realtime para o Kanban');
    const unitIdFilter = selectedUnitIds.length > 0 
      ? `unit_id=in.(${selectedUnitIds.join(',')})`
      : undefined;
    
    // 1. Subscription para mudanças na tabela clients (filtrado por unidades)
    const clientsChannel = supabase
      .channel(`clients-by-unit-${getChannelSuffix()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: unitIdFilter
        },
        (payload) => {
          console.log('🔔 [useInfiniteClientData] Mudança de cliente detectada:', payload);
          // Invalidação mais seletiva - apenas para essa query específica
          queryClient.invalidateQueries({ 
            queryKey: ['infinite-clients', selectedUnitIds, searchTerm, showPendingOnly] 
          });
        }
      )
      .subscribe((status) => {
        console.log('🔔 [useInfiniteClientData] Status da subscription clients:', status);
      });

    // 2. Subscription para mudanças na tabela client_activities (filtrado por unidades)
    const activitiesChannel = supabase
      .channel(`activities-by-unit-${getChannelSuffix()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_activities',
          filter: unitIdFilter
        },
        (payload) => {
          console.log('🔔 [useInfiniteClientData] Mudança de atividade detectada:', payload);
          // Invalidação mais seletiva
          queryClient.invalidateQueries({ 
            queryKey: ['infinite-clients', selectedUnitIds, searchTerm, showPendingOnly] 
          });
        }
      )
      .subscribe((status) => {
        console.log('🔔 [useInfiniteClientData] Status da subscription activities:', status);
      });

    // Cleanup de todas as subscriptions no unmount
    return () => {
      console.log('🔔 [useInfiniteClientData] Limpando subscriptions realtime do Kanban');
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(activitiesChannel);
    };
  }, [queryClient, selectedUnitIds, searchTerm, showPendingOnly]);

  return useInfiniteQuery<InfiniteClientData>({
    queryKey: ['infinite-clients', selectedUnitIds, searchTerm, showPendingOnly],
    queryFn: async (context) => {
      const pageParam = context.pageParam as number || 1;
      
      console.log('📊 [useInfiniteClientData] Buscando clientes infinitos de kanban_client_summary', {
        selectedUnitIds,
        searchTerm,
        showPendingOnly,
        page: pageParam,
        limit
      });
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Não autenticado');

      // Determinar as unidades para filtrar
      let unitIds: string[] = [];
      
      if (selectedUnitIds && selectedUnitIds.length > 0) {
        unitIds = selectedUnitIds;
      } else {
        unitIds = userUnits?.map(u => u.unit_id) || [];
      }
      
      console.log('📊 [useInfiniteClientData] Buscando de kanban_client_summary para unidades:', unitIds);
      
      let query = supabase
        .from('kanban_client_summary')
        .select('*', { count: 'exact' })
        .in('unit_id', unitIds)
        .not('status', 'in', '(matriculado,perdido,atendimento-realizado)'); // Filtrar status que não devem aparecer no kanban

      // Adicionar filtros de busca se fornecidos
      if (searchTerm && searchTerm.trim()) {
        const normalizedSearch = searchTerm.trim();
        query = query.or(`name.ilike.%${normalizedSearch}%,phone_number.ilike.%${normalizedSearch}%`);
      }

      // Filtro de pendentes (next_contact_date no passado/hoje OU nulo)
      if (showPendingOnly) {
        const today = new Date().toISOString();
        query = query.or(`next_contact_date.lte.${today},next_contact_date.is.null`);
      }

      // Adicionar paginação
      const offset = (pageParam - 1) * limit;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ [useInfiniteClientData] Erro ao buscar de kanban_client_summary:', error);
        throw error;
      }

      console.log(`📊 [useInfiniteClientData] Página ${pageParam}: ${data?.length} clientes recebidos`);
      
      return {
        clients: (data || []) as ClientSummaryData[],
        totalCount: count || 0,
        hasNextPage: data ? data.length === limit : false,
        currentPage: pageParam
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
    },
    enabled: userUnits !== undefined && userUnits.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutos - dados ficam "frescos" por mais tempo
    gcTime: 5 * 60 * 1000, // 5 minutos
    placeholderData: keepPreviousData, // CORREÇÃO: usar placeholderData em vez de keepPreviousData
    refetchOnWindowFocus: false, // Evita refetch ao mudar de aba
  });
}
