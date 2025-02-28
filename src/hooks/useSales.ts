
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useSales() {
  console.log('Iniciando hook useSales')
  
  return useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      console.log('Buscando dados de vendas...')
      
      const { data: userUnit } = await supabase
        .from('unit_users')
        .select('unit_id')
        .eq('active', true)
        .single()

      if (!userUnit) throw new Error('Unidade não encontrada')
      console.log('Unidade do usuário:', userUnit.unit_id)

      const { data, error } = await supabase
        .from('sales')
        .select(`
          id,
          created_at,
          student_name,
          created_by,
          profiles!fk_sales_created_by (
            full_name
          ),
          clients (
            lead_source
          )
        `)
        .eq('unit_id', userUnit.unit_id)
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar vendas:', error)
        throw error
      }

      // Formata os dados para manter compatibilidade com o componente
      const formattedData = data.map(sale => ({
        ...sale,
        profiles: sale.profiles
      }))

      console.log('Dados de vendas obtidos:', formattedData)
      return formattedData
    }
  })
}
