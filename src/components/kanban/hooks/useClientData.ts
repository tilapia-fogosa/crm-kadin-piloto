
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"
import { useUserUnit } from "./useUserUnit"
import { PaginatedClientData, ClientSummaryData } from "../utils/types/kanbanTypes"

interface PaginationOptions {
  page?: number
  limit?: number
}

export function useClientData(
  selectedUnitIds: string[] = [], 
  searchTerm: string = '',
  showPendingOnly: boolean = false,
  paginationOptions: PaginationOptions = {}
) {
  const queryClient = useQueryClient()
  const { data: userUnits } = useUserUnit()
  const { page = 1, limit = 100 } = paginationOptions
  const offset = (page - 1) * limit

  // Enable realtime subscription when the hook is mounted
  useEffect(() => {
    console.log('Setting up realtime subscriptions for clients by unit')
    
    // Subscribe to clients changes by unit
    const channel = supabase
      .channel('clients-by-unit')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: selectedUnitIds.length > 0 ? `unit_id=in.(${selectedUnitIds.join(',')})` : undefined
        },
        (payload) => {
          console.log('Client change detected for unit:', payload)
          queryClient.invalidateQueries({ 
            queryKey: ['clients', selectedUnitIds, searchTerm, showPendingOnly] 
          })
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up realtime subscriptions')
      supabase.removeChannel(channel)
    }
  }, [queryClient, selectedUnitIds, searchTerm, showPendingOnly])

  return useQuery<PaginatedClientData>({
    queryKey: ['clients', selectedUnitIds, searchTerm, showPendingOnly, page],
    queryFn: async () => {
      console.log('Fetching paginated clients from kanban_client_summary', {
        selectedUnitIds,
        searchTerm,
        showPendingOnly,
        page,
        limit,
        offset
      });
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Not authenticated')

      // Determinar as unidades para filtrar
      let unitIds: string[] = []
      
      if (selectedUnitIds && selectedUnitIds.length > 0) {
        unitIds = selectedUnitIds
      } else {
        unitIds = userUnits?.map(u => u.unit_id) || []
      }
      
      console.log('Fetching from kanban_client_summary for units:', unitIds)
      
      let query = supabase
        .from('kanban_client_summary')
        .select('*', { count: 'exact' })
        .in('unit_id', unitIds)

      // Adicionar filtros de busca se fornecidos
      if (searchTerm && searchTerm.trim()) {
        const normalizedSearch = searchTerm.trim()
        query = query.or(`name.ilike.%${normalizedSearch}%,phone_number.ilike.%${normalizedSearch}%`)
      }

      // Filtro de pendentes (next_contact_date no passado ou hoje)
      if (showPendingOnly) {
        query = query.lte('next_contact_date', new Date().toISOString())
      }

      // Adicionar paginação
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching from kanban_client_summary:', error)
        throw error
      }

      console.log('Total clients received from kanban_client_summary:', data?.length)
      console.log('Total count:', count)
      
      // Log some sample data for debugging
      data?.slice(0, 3).forEach(client => {
        console.log('Client summary data:', {
          id: client.id,
          name: client.name,
          status: client.status,
          unit_name: client.unit_name,
          last_activity: client.last_activity
        })
      })

      return {
        clients: (data || []) as ClientSummaryData[],
        totalCount: count || 0,
        hasNextPage: data ? data.length === limit : false,
        currentPage: page
      }
    },
    enabled: userUnits !== undefined && userUnits.length > 0,
    staleTime: 30000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos (substitui cacheTime)
  })
}
