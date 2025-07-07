
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
  
  console.log('📊 [useInfiniteClientData] Hook chamado com:', { 
    selectedUnitIds, 
    searchTerm, 
    showPendingOnly 
  })
  
  // Configurar subscriptions realtime quando o hook é montado - ESTABILIZADO
  useEffect(() => {
    if (!userUnits || userUnits.length === 0) {
      console.log('🔔 [useInfiniteClientData] Aguardando userUnits...');
      return;
    }

    console.log('🔔 [useInfiniteClientData] Configurando subscriptions realtime OTIMIZADAS');
    
    // Invalidação super agressiva com debug e múltiplas estratégias
    const invalidateWithForce = async (reason: string, payload?: any) => {
      console.log(`🔄 [REALTIME BRUTE FORCE] ${reason}:`, payload);
      
      try {
        // Estratégia 1: Limpar cache completamente
        console.log('🧹 [REALTIME] Removendo queries antigas...');
        await queryClient.removeQueries({ queryKey: ['infinite-clients'] });
        
        // Estratégia 2: Invalidar com força total
        console.log('🔄 [REALTIME] Invalidando com refetchType ALL...');
        await queryClient.invalidateQueries({ 
          queryKey: ['infinite-clients'],
          refetchType: 'all'
        });
        
        // Estratégia 3: Refetch forçado imediato
        console.log('💪 [REALTIME] Forçando refetch imediato...');
        await queryClient.refetchQueries({
          queryKey: ['infinite-clients'],
          type: 'all'
        });
        
        // Estratégia 4: Timeout de segurança para refetch adicional
        setTimeout(async () => {
          console.log('⏰ [REALTIME] Timeout de segurança - refetch adicional');
          await queryClient.refetchQueries({
            queryKey: ['infinite-clients'],
            type: 'all'
          });
        }, 200);
        
        // Estratégia 5: Segundo timeout mais agressivo
        setTimeout(async () => {
          console.log('🚨 [REALTIME] Timeout agressivo - clearing + refetch');
          queryClient.clear(); // Nuclear option
          await queryClient.refetchQueries({
            queryKey: ['infinite-clients'],
            type: 'all'
          });
        }, 500);
        
      } catch (error) {
        console.error('❌ [REALTIME] Erro na invalidação:', error);
        // Fallback nuclear
        queryClient.clear();
      }
    };

    // Canal único estável para evitar reconexões
    const stableChannelId = `kanban-realtime-${Date.now()}`;
    
    const channel = supabase
      .channel(stableChannelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        (payload) => invalidateWithForce('Cliente alterado', payload)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_activities'
        },
        (payload) => invalidateWithForce('Atividade alterada', payload)
      )
      .subscribe((status) => {
        console.log(`🔔 [useInfiniteClientData] Status da subscription ${stableChannelId}:`, status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ [REALTIME] Subscription ativa e pronta!');
        }
      });

    return () => {
      console.log('🔔 [useInfiniteClientData] Limpando subscription:', stableChannelId);
      supabase.removeChannel(channel);
    };
  }, [queryClient, userUnits]); // Dependências mínimas e estáveis

  return useInfiniteQuery<InfiniteClientData>({
    queryKey: ['infinite-clients', selectedUnitIds, searchTerm, showPendingOnly],
    queryFn: async (context) => {
      const pageParam = context.pageParam as number || 1;
      
      console.log('📊 [useInfiniteClientData] Executando query com searchTerm:', searchTerm);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Não autenticado');

      // Determinar as unidades para filtrar - usando a nova estrutura normalizada
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
        console.log('📊 [useInfiniteClientData] Aplicando filtro de pesquisa:', normalizedSearch);
        query = query.or(`name.ilike.%${normalizedSearch}%,phone_number.ilike.%${normalizedSearch}%`);
      }

      // Filtro de pendentes (next_contact_date até o final do dia atual OU nulo)
      if (showPendingOnly) {
        // CORREÇÃO: Usar final do dia atual (23:59:59) em vez do timestamp exato
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const endOfTodayISO = endOfToday.toISOString();
        
        console.log('📊 [useInfiniteClientData] Aplicando filtro de pendentes até:', endOfTodayISO);
        query = query.or(`next_contact_date.lte.${endOfTodayISO},next_contact_date.is.null`);
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

      console.log(`📊 [useInfiniteClientData] Página ${pageParam}: ${data?.length} clientes recebidos para termo "${searchTerm}"`);
      
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
    staleTime: 0, // SEMPRE considerar dados stale para forçar atualizações
    gcTime: 30 * 1000, // 30 segundos - cache mais agressivo
    placeholderData: keepPreviousData, 
    refetchOnWindowFocus: true, // Habilita refetch ao mudar de aba para garantir dados frescos
    refetchOnMount: 'always', // SEMPRE refetch ao montar
    refetchInterval: false, // Sem polling desnecessário
    networkMode: 'always', // Sempre tentar network requests
  });
}
