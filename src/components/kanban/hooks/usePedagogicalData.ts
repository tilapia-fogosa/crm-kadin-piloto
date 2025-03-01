
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useUserUnit } from "./useUserUnit"

export function usePedagogicalData() {
  const { data: userUnits } = useUserUnit()

  return useQuery({
    queryKey: ['pedagogical-students', userUnits?.map(u => u.unit_id)],
    queryFn: async () => {
      console.log('Buscando dados pedagógicos dos alunos')
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Not authenticated')

      const unitIds = userUnits?.map(u => u.unit_id) || []
      
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          full_name,
          client:clients!inner(
            id,
            name,
            phone_number,
            lead_source,
            observations,
            status,
            next_contact_date,
            created_at,
            unit_id
          ),
          kit_versions (
            id,
            kit_type:kit_types(
              id,
              name
            ),
            version
          ),
          classes (
            id,
            name,
            schedule
          ),
          pedagogical_schedules (
            id,
            schedule_date,
            status,
            observations
          )
        `)
        .eq('active', true)
        .in('client.unit_id', unitIds)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar alunos:', error)
        throw error
      }

      console.log('Dados pedagógicos recebidos:', data)
      return data
    },
    enabled: userUnits !== undefined && userUnits.length > 0
  })
}
