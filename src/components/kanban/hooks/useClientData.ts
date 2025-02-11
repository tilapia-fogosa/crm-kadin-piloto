
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

      // Mapear as atividades diretamente
      const clientsWithActivities = data?.map(client => ({
        ...client,
        client_activities: client.client_activities?.map(activity => {
          console.log('Processing activity:', activity)
          if (!activity.id || !activity.tipo_atividade || !activity.tipo_contato || !activity.created_at) {
            console.error('Invalid activity data:', activity)
            return null
          }
          return `${activity.tipo_atividade}|${activity.tipo_contato}|${activity.created_at}|${activity.notes || ''}|${activity.id}`
        }).filter(Boolean) || []
      }))

      console.log('Fetched clients data:', clientsWithActivities)
      return clientsWithActivities
    }
  })
}
