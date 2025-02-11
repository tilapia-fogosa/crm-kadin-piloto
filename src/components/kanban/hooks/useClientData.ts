
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useClientData() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          phone_number,
          lead_source,
          observations,
          status,
          client_activities (
            id,
            tipo_contato,
            tipo_atividade,
            notes,
            created_at
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching clients:', error)
        throw error
      }

      // Filtrar as atividades não excluídas para cada cliente
      const clientsWithFilteredActivities = data?.map(client => ({
        ...client,
        client_activities: client.client_activities?.filter(activity => !activity.is_deleted) || []
      }))

      console.log('Fetched clients data:', clientsWithFilteredActivities)
      return clientsWithFilteredActivities
    }
  })
}
