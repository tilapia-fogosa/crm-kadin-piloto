
import { useState } from "react"
import { Sale } from "../types"
import { supabase } from "@/integrations/supabase/client"

export function useSale() {
  const [isLoading, setIsLoading] = useState(false)

  const registerSale = async (sale: Sale) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('sales')
        .insert([sale])

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

