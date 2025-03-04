
import { useState } from 'react'
import { PreSaleFormData } from '../types/pre-sale.types'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'

export function usePreSaleForm(clientId: string, activityId: string) {
  console.log('Iniciando hook usePreSaleForm para cliente:', clientId)
  
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<PreSaleFormData>>({
    sale_type: 'matricula',
    enrollment_installments: 1,
    material_installments: 1
  })

  const handleSubmit = async () => {
    console.log('Tentando submeter formulário de pré-venda:', formData)
    
    try {
      setIsLoading(true)

      // Buscar unit_id do cliente
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('unit_id')
        .eq('id', clientId)
        .single()

      if (clientError) throw clientError
      if (!clientData?.unit_id) throw new Error('Cliente sem unidade associada')
      
      const saleData = {
        ...formData,
        client_id: clientId,
        attendance_activity_id: activityId,
        unit_id: clientData.unit_id,
        active: true
      }

      const { data: sale, error } = await supabase
        .from('sales')
        .insert(saleData)
        .select()
        .single()

      if (error) throw error

      console.log('Venda registrada com sucesso:', sale)
      toast.success('Pré-venda registrada com sucesso!')
      return sale
      
    } catch (error) {
      console.error('Erro ao registrar pré-venda:', error)
      toast.error('Erro ao registrar pré-venda')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateForm = (updates: Partial<PreSaleFormData>) => {
    console.log('Atualizando formulário com:', updates)
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const validateForm = (): boolean => {
    console.log('Validando formulário:', formData)
    
    const requiredFields: (keyof PreSaleFormData)[] = [
      'student_name',
      'enrollment_amount',
      'enrollment_payment_method',
      'enrollment_payment_date',
      'material_amount',
      'material_payment_method',
      'material_payment_date',
      'monthly_fee_amount',
      'monthly_fee_payment_method',
      'first_monthly_fee_date'
    ]

    const missingFields = requiredFields.filter(field => !formData[field])
    
    if (missingFields.length > 0) {
      console.log('Campos obrigatórios faltando:', missingFields)
      return false
    }

    const needsDueDay = formData.monthly_fee_payment_method === 'recorrencia'
    if (needsDueDay && !formData.monthly_fee_due_day) {
      console.log('Dia de vencimento obrigatório para recorrência')
      return false
    }

    return true
  }

  return {
    formData,
    isLoading,
    updateForm,
    handleSubmit,
    validateForm
  }
}
