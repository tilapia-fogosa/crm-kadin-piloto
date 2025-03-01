
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export interface LossReason {
  id: string
  name: string
}

export function useLossReasons() {
  console.log('Iniciando hook useLossReasons')
  
  return useQuery({
    queryKey: ['loss-reasons'],
    queryFn: async () => {
      console.log('Buscando motivos de perda...')
      
      const { data: reasons, error } = await supabase
        .from('loss_reasons')
        .select('id, name')
        .eq('active', true)
        .order('name', { ascending: true }) // Explicitly set ascending order

      if (error) {
        console.error('Erro ao buscar motivos:', error)
        throw error
      }

      console.log('Motivos de perda obtidos:', reasons)
      return reasons
    }
  })
}
