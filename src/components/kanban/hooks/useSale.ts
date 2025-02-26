
import { useState } from "react"
import { Sale } from "../types"
import { supabase } from "@/integrations/supabase/client"
import { format } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"

export function useSale() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Consulta para buscar a unidade do usuário logado
  const { data: userUnit } = useQuery({
    queryKey: ['userUnit'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unit_users')
        .select('unit_id')
        .eq('active', true)
        .single()

      if (error) throw error
      return data
    }
  })

  const registerSale = async (sale: Sale) => {
    setIsLoading(true)
    try {
      if (!userUnit?.unit_id) {
        throw new Error('Unidade não encontrada')
      }

      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const saleData = {
        ...sale,
        unit_id: userUnit.unit_id,
        created_by: user.id,
        enrollment_payment_date: format(sale.enrollment_payment_date, 'yyyy-MM-dd'),
        material_payment_date: format(sale.material_payment_date, 'yyyy-MM-dd'),
        first_monthly_fee_date: format(sale.first_monthly_fee_date, 'yyyy-MM-dd')
      }

      // Registrar a venda
      const { data: newSale, error } = await supabase
        .from('sales')
        .insert(saleData)
        .select()
        .single()

      if (error) throw error

      // Disparar webhooks
      await supabase.functions.invoke('process-sale-webhooks', {
        body: { sale_id: newSale.id }
      })

      console.log('Venda registrada com sucesso:', newSale)
      toast({
        title: "Venda registrada com sucesso!",
        duration: 3000
      })
    } catch (error) {
      console.error('Erro ao registrar venda:', error)
      toast({
        title: "Erro ao registrar venda",
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
