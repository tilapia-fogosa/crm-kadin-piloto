
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { RealtimePostgresInsertPayload } from "@supabase/supabase-js"
import { useEffect } from "react"

export function useClientData() {
  const queryClient = useQueryClient()

  // Enable realtime subscription when the hook is mounted
  useEffect(() => {
    // Subscribe to realtime changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clients'
        },
        (payload: RealtimePostgresInsertPayload<any>) => {
          console.log('New client inserted:', payload)
          // Invalidate and refetch data when a new client is inserted
          queryClient.invalidateQueries({ queryKey: ['clients'] })
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Not authenticated')

      console.log('Fetching clients data...')
      
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          phone_number,
          lead_source,
          observations,
          status,
          next_contact_date,
          created_at,
          client_activities (
            id,
            tipo_contato,
            tipo_atividade,
            notes,
            created_at,
            next_contact_date
          )
        `)
        .order('created_at', { ascending: false })
        .is('deleted_at', null)

      if (error) {
        console.error('Error fetching clients:', error)
        throw error
      }

      console.log('Total clients received from database:', data?.length)
      
      // Log all clients with their next_contact_date for debugging
      data?.forEach(client => {
        console.log('Client data:', {
          id: client.id,
          name: client.name,
          next_contact_date: client.next_contact_date,
          status: client.status
        })
      })

      const clientsWithActivities = data?.map(client => {
        return {
          ...client,
          client_activities: client.client_activities?.map(activity => {
            return `${activity.tipo_atividade}|${activity.tipo_contato}|${activity.created_at}|${activity.notes || ''}|${activity.id}`
          }) || []
        }
      })

      console.log('Total processed clients:', clientsWithActivities?.length)
      return clientsWithActivities
    }
  })
}
