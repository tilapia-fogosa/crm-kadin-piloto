
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"
import { useDebounce } from "@/components/kanban/utils/hooks/useDebounce"

interface ClientActivity {
  id: string
  tipo_atividade: string
  tipo_contato: string
  created_at: string
  notes: string | null
  active: boolean
  next_contact_date?: string | null
  created_by?: string | null
  author_name?: string | null
  client_id?: string | null
}

/**
 * Hook para carregar atividades de um cliente específico na página de clientes
 * Implementa lazy loading - só carrega quando o sheet está aberto
 * 
 * @param clientId ID do cliente
 * @param isOpen Se o sheet está aberto (controla quando fazer fetch)
 * @param limit Limite de atividades por página (padrão: 20)
 */
export function useClientActivitiesForSheet(
  clientId: string | undefined,
  isOpen: boolean,
  limit: number = 20
) {
  console.log('🔍 [useClientActivitiesForSheet] Hook iniciado:', { clientId, isOpen })
  
  const queryClient = useQueryClient()
  
  // Debounce para evitar requests em open/close rápido
  const debouncedIsOpen = useDebounce(isOpen, 200)
  
  // Configurar subscription realtime apenas quando sheet estiver aberto
  useEffect(() => {
    if (!clientId || !debouncedIsOpen) return

    console.log(`🔔 [useClientActivitiesForSheet] Configurando subscription para cliente: ${clientId}`)
    
    const channelSuffix = Math.random().toString(36).substring(2, 10)
    
    const channel = supabase
      .channel(`client-activities-sheet-${clientId}-${channelSuffix}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_activities',
          filter: `client_id=eq.${clientId}`
        },
        async (payload) => {
          console.log('🔔 [useClientActivitiesForSheet] Mudança detectada:', payload)
          
          // Invalidar cache do sheet imediatamente
          await queryClient.invalidateQueries({ 
            queryKey: ['client-activities-sheet', clientId] 
          })
          
          // NOVO: Também invalidar o cache do infinite-clients para forçar atualização do kanban
          console.log('🔄 [useClientActivitiesForSheet] Invalidando cache do kanban também...')
          await queryClient.invalidateQueries({ 
            queryKey: ['infinite-clients'],
            refetchType: 'all'
          })
          
          // Forçar refetch do kanban
          await queryClient.refetchQueries({
            queryKey: ['infinite-clients'],
            type: 'all'
          })
        }
      )
      .subscribe((status) => {
        console.log(`🔔 [useClientActivitiesForSheet] Status da subscription:`, status)
      })

    return () => {
      console.log(`🔔 [useClientActivitiesForSheet] Limpando subscription para cliente: ${clientId}`)
      supabase.removeChannel(channel)
    }
  }, [queryClient, clientId, debouncedIsOpen])

  // Cleanup do cache quando sheet fecha (opcional para economizar memória)
  useEffect(() => {
    if (!debouncedIsOpen && clientId) {
      // Aguarda um pouco antes de limpar para permitir reaberturas rápidas
      const timeoutId = setTimeout(() => {
        console.log(`🧹 [useClientActivitiesForSheet] Limpando cache para cliente: ${clientId}`)
        queryClient.removeQueries({ queryKey: ['client-activities-sheet', clientId] })
      }, 30000) // 30 segundos

      return () => clearTimeout(timeoutId)
    }
  }, [queryClient, clientId, debouncedIsOpen])

  return useQuery<ClientActivity[]>({
    queryKey: ['client-activities-sheet', clientId],
    queryFn: async () => {
      console.log(`📊 [useClientActivitiesForSheet] Buscando atividades para cliente: ${clientId}`)
      
      if (!clientId) {
        throw new Error('Client ID é obrigatório')
      }

      const { data, error } = await supabase.rpc('kanban_client_activities', {
        p_client_id: clientId,
        p_limit: limit,
        p_offset: 0
      })

      if (error) {
        console.error('❌ [useClientActivitiesForSheet] Erro ao buscar atividades (RPC):', error)
        throw error
      }

      const activities: ClientActivity[] = Array.isArray(data)
        ? (data as any[]).map((item) => ({
            id: item.id,
            tipo_atividade: item.tipo_atividade,
            tipo_contato: item.tipo_contato,
            created_at: item.created_at,
            notes: item.notes ?? null,
            active: item.active,
            next_contact_date: item.next_contact_date ?? null,
            created_by: item.created_by ?? null,
            author_name: item.author_name ?? null,
            client_id: item.client_id ?? null,
          }))
        : []

      console.log(`✅ [useClientActivitiesForSheet] ${activities.length} atividades carregadas (RPC)`)      
      return activities
    },
    enabled: Boolean(clientId) && debouncedIsOpen, // Só executa se tiver clientId E sheet aberto
    staleTime: 0, // SEMPRE fresh para sincronizar com kanban
    gcTime: 30 * 1000, // 30 segundos - cache mais agressivo
    refetchOnWindowFocus: true, // Refetch ao mudar de aba para manter sincronizado
    refetchOnMount: 'always', // Sempre refetch ao montar
    networkMode: 'always', // Sempre tentar network requests
  })
}
