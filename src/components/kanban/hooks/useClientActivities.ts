
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"

export function useClientActivities(
  clientId: string,
  page: number = 1,
  limit: number = 10
) {
  const queryClient = useQueryClient()
  const offset = (page - 1) * limit

  // Enable realtime subscription for specific client activities
  useEffect(() => {
    if (!clientId) return

    console.log(`Setting up realtime subscription for client activities: ${clientId}`)
    
    const channel = supabase
      .channel(`activities-by-client-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_activities',
          filter: `client_id=eq.${clientId}`
        },
        (payload) => {
          console.log('Activity change detected for client:', clientId, payload)
          queryClient.invalidateQueries({ 
            queryKey: ['activities', clientId] 
          })
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status for client ${clientId}:`, status)
      })

    return () => {
      console.log(`Cleaning up realtime subscription for client: ${clientId}`)
      supabase.removeChannel(channel)
    }
  }, [queryClient, clientId])

  return useQuery({
    queryKey: ['activities', clientId, page],
    queryFn: async () => {
      console.log(`Fetching activities for client ${clientId}, page ${page}, limit ${limit}`)
      
      const { data, error } = await supabase.rpc('kanban_client_activities', {
        p_client_id: clientId,
        p_limit: limit,
        p_offset: offset
      })

      if (error) {
        console.error('Error fetching client activities:', error)
        throw error
      }

      console.log(`Received ${data?.length || 0} activities for client ${clientId}`)
      
      const activities = data || []
      
      return {
        activities,
        hasNextPage: activities.length === limit,
        currentPage: page
      }
    },
    enabled: !!clientId,
    staleTime: 30000, // 30 segundos
    cacheTime: 5 * 60 * 1000, // 5 minutos
  })
}
