
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
        (payload) => {
          console.log('🔔 [useClientActivitiesForSheet] Mudança detectada:', payload)
          
          // Invalidar cache imediatamente para refrescar dados
          queryClient.invalidateQueries({ 
            queryKey: ['client-activities-sheet', clientId] 
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

      const { data, error } = await supabase
        .from('client_activities')
        .select(`
          id,
          tipo_atividade,
          tipo_contato,
          created_at,
          notes,
          active,
          next_contact_date
        `)
        .eq('client_id', clientId)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('❌ [useClientActivitiesForSheet] Erro ao buscar atividades:', error)
        throw error
      }

      console.log(`✅ [useClientActivitiesForSheet] ${data?.length || 0} atividades carregadas`)
      
      return data || []
    },
    enabled: Boolean(clientId) && debouncedIsOpen, // Só executa se tiver clientId E sheet aberto
    staleTime: debouncedIsOpen ? 0 : 5 * 60 * 1000, // Sempre fresh quando aberto, 5min cache quando fechado
    gcTime: 10 * 60 * 1000, // 10 minutos no garbage collector
    refetchOnWindowFocus: false, // Evita refetch desnecessário
  })
}
