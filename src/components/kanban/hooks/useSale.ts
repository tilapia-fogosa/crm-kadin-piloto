
import { useState } from "react"
import { Sale } from "../types"
import { supabase } from "@/integrations/supabase/client"
import { format } from "date-fns"

export function useSale() {
  const [isLoading, setIsLoading] = useState(false)

  const registerSale = async (sale: Sale) => {
    setIsLoading(true)
    try {
      const saleData = {
        ...sale,
        enrollment_payment_date: format(sale.enrollment_payment_date, 'yyyy-MM-dd'),
        material_payment_date: format(sale.material_payment_date, 'yyyy-MM-dd'),
        first_monthly_fee_date: format(sale.first_monthly_fee_date, 'yyyy-MM-dd')
      }

      const { error } = await supabase
        .from('sales')
        .insert(saleData)

      if (error) throw error

      console.log('Venda registrada com sucesso:', sale)
    } catch (error) {
      console.error('Erro ao registrar venda:', error)
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
