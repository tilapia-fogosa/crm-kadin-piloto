
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export interface LossReasonCategory {
  id: string
  name: string
  description: string | null
}

export interface LossReason {
  id: string
  category_id: string
  name: string
}

export function useLossReasons() {
  console.log('Iniciando hook useLossReasons')
  
  return useQuery({
    queryKey: ['loss-reasons'],
    queryFn: async () => {
      console.log('Buscando motivos de perda...')
      
      // Buscar categorias
      const { data: categories, error: categoriesError } = await supabase
        .from('loss_reason_categories')
        .select('*')
        .eq('active', true)
        .order('name')

      if (categoriesError) {
        console.error('Erro ao buscar categorias:', categoriesError)
        throw categoriesError
      }

      // Buscar motivos
      const { data: reasons, error: reasonsError } = await supabase
        .from('loss_reasons')
        .select('*')
        .eq('active', true)
        .order('name')

      if (reasonsError) {
        console.error('Erro ao buscar motivos:', reasonsError)
        throw reasonsError
      }

      // Agrupar motivos por categoria
      const reasonsByCategory = categories.map(category => ({
        ...category,
        reasons: reasons.filter(reason => reason.category_id === category.id)
      }))

      console.log('Motivos de perda obtidos:', reasonsByCategory)
      return reasonsByCategory
    }
  })
}
