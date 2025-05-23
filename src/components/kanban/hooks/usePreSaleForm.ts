
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
    material_installments: 1,
    enrollment_amount: 0,
    material_amount: 0,
    monthly_fee_amount: 0
  })

  const handleSubmit = async () => {
    console.log('Tentando submeter formulário de pré-venda:', formData)
    
    try {
      // Validar campos obrigatórios
      if (!formData.enrollment_payment_method || 
          !formData.material_payment_method || 
          !formData.monthly_fee_payment_method ||
          !formData.enrollment_payment_date ||
          !formData.material_payment_date ||
          !formData.first_monthly_fee_date ||
          !formData.student_name) {
        throw new Error('Todos os campos são obrigatórios')
      }

      setIsLoading(true)

      // Buscar unit_id do cliente
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('unit_id')
        .eq('id', clientId)
        .single()

      if (clientError) throw clientError
      if (!clientData?.unit_id) throw new Error('Cliente sem unidade associada')
      
      // Construir objeto completo para inserção
      const saleData = {
        ...formData,
        client_id: clientId,
        attendance_activity_id: activityId,
        unit_id: clientData.unit_id,
        active: true,
        student_name: formData.student_name,
        enrollment_amount: formData.enrollment_amount || 0,
        material_amount: formData.material_amount || 0,
        monthly_fee_amount: formData.monthly_fee_amount || 0,
        enrollment_payment_method: formData.enrollment_payment_method,
        material_payment_method: formData.material_payment_method,
        monthly_fee_payment_method: formData.monthly_fee_payment_method,
        enrollment_payment_date: formData.enrollment_payment_date,
        material_payment_date: formData.material_payment_date,
        first_monthly_fee_date: formData.first_monthly_fee_date,
        enrollment_installments: formData.enrollment_installments || 1,
        material_installments: formData.material_installments || 1
      } as const

      const { data: sale, error } = await supabase
        .from('sales')
        .insert(saleData)
        .select()
        .single()

      if (error) throw error

      console.log('Venda registrada com sucesso:', sale)
      
      // Toast de sucesso removido
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
