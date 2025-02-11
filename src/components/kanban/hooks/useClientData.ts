
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
        .is('deleted_at', null) // Mudamos para buscar apenas registros onde deleted_at é null

      if (error) {
        console.error('Error fetching clients:', error)
        throw error
      }

      // Mapear as atividades diretamente
      const clientsWithActivities = data?.map(client => {
        console.log('Processing client:', client.name, 'Activities:', client.client_activities)
        return {
          ...client,
          client_activities: client.client_activities?.map(activity => {
            console.log('Processing activity for client', client.name, ':', activity)
            return `${activity.tipo_atividade}|${activity.tipo_contato}|${activity.created_at}|${activity.notes || ''}|${activity.id}`
          }) || []
        }
      })

      console.log('Processed clients data:', clientsWithActivities)
      return clientsWithActivities
    }
  })
}
