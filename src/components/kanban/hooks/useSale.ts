
import { useState } from "react"
import { Sale } from "../types"
import { supabase } from "@/integrations/supabase/client"
import { format } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"

export function useSale() {
  console.log('Iniciando hook useSale')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Consulta para buscar a unidade do usuário logado
  const { data: userUnit } = useQuery({
    queryKey: ['userUnit'],
    queryFn: async () => {
      console.log('Buscando unidade do usuário...')
      const { data, error } = await supabase
        .from('unit_users')
        .select('unit_id')
        .eq('active', true)
        .single()

      if (error) {
        console.error('Erro ao buscar unidade do usuário:', error)
        throw error
      }
      console.log('Unidade do usuário encontrada:', data)
      return data
    }
  })

  const registerSale = async (sale: Sale) => {
    console.log('Iniciando registro de venda:', sale)
    setIsLoading(true)
    try {
      if (!userUnit?.unit_id) {
        console.error('Unidade não encontrada')
        throw new Error('Unidade não encontrada')
      }

      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('Usuário não autenticado')
        throw new Error('Usuário não autenticado')
      }
      console.log('Usuário autenticado:', user.id)

      const saleData = {
        ...sale,
        unit_id: userUnit.unit_id,
        created_by: user.id,
        enrollment_payment_date: format(new Date(sale.enrollment_payment_date), 'yyyy-MM-dd'),
        material_payment_date: format(new Date(sale.material_payment_date), 'yyyy-MM-dd'),
        first_monthly_fee_date: format(new Date(sale.first_monthly_fee_date), 'yyyy-MM-dd')
      }

      // Registrar a venda
      const { data: newSale, error } = await supabase
        .from('sales')
        .insert(saleData)
        .select()
        .single()

      if (error) {
        console.error('Erro ao registrar venda:', error)
        throw error
      }

      console.log('Venda registrada com sucesso:', newSale)
      
      // Nota: Removemos a chamada de webhook de venda, pois agora
      // essa funcionalidade é tratada pelos webhooks de clientes com status "matriculado"

      // Toast de sucesso removido
    } catch (error: any) {
      console.error('Erro ao registrar venda:', error)
      toast({
        title: "Erro ao registrar venda",
        description: error.message || "Ocorreu um erro ao registrar a venda",
        variant: "destructive",
        duration: 3000
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    registerSale,
    isLoading
  }
}
