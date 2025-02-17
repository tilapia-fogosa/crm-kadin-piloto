
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sale, PaymentMethod, DueDay } from "./types"
import { ImportantInfo } from "./components/sale-form/ImportantInfo"
import { PaymentSection } from "./components/sale-form/PaymentSection"
import { MonthlyFeeSection } from "./components/sale-form/MonthlyFeeSection"

interface SaleFormProps {
  onSubmit: (sale: Sale) => Promise<void>
  clientId: string
  activityId: string
}

export function SaleForm({ onSubmit, clientId, activityId }: SaleFormProps) {
  const [sale, setSale] = useState<Partial<Sale>>({
    client_id: clientId,
    attendance_activity_id: activityId,
    enrollment_installments: 1,
    material_installments: 1
  })

  const handlePaymentMethodChange = (field: 'enrollment_payment_method' | 'material_payment_method' | 'monthly_fee_payment_method', value: PaymentMethod) => {
    const updates: Partial<Sale> = {
      [field]: value
    }

    if (field === 'enrollment_payment_method') {
      updates.enrollment_installments = 1
    } else if (field === 'material_payment_method') {
      updates.material_installments = 1
    }

    setSale(prev => ({
      ...prev,
      ...updates
    }))
  }

  const setTodayDate = (field: keyof Sale) => {
    setSale(prev => ({
      ...prev,
      [field]: new Date()
    }))
  }

  const handleSubmit = async () => {
    if (!isFormValid()) return
    await onSubmit(sale as Sale)
  }

  const isFormValid = () => {
    const requiredFields: (keyof Sale)[] = [
      'enrollment_amount',
      'enrollment_payment_method',
      'enrollment_installments',
      'enrollment_payment_date',
      'material_amount',
      'material_payment_method',
      'material_installments',
      'material_payment_date',
      'monthly_fee_amount',
      'monthly_fee_payment_method',
      'first_monthly_fee_date'
    ]

    const hasAllRequired = requiredFields.every(field => {
      const value = sale[field]
      return value !== undefined && value !== null && value !== ''
    })

    const needsDueDay = sale.monthly_fee_payment_method === 'recorrencia'
    const hasDueDay = sale.monthly_fee_due_day !== undefined

    return hasAllRequired && (!needsDueDay || hasDueDay)
  }

  return (
    <div className="space-y-6 py-4">
      <ImportantInfo
        value={sale.important_info || ''}
        onChange={value => setSale(prev => ({ ...prev, important_info: value }))}
      />

      <div className="grid grid-cols-2 gap-4">
        <PaymentSection
          title="Matrícula"
          amount={sale.enrollment_amount}
          paymentMethod={sale.enrollment_payment_method}
          installments={sale.enrollment_installments || 1}
          paymentDate={sale.enrollment_payment_date}
          onAmountChange={value => setSale(prev => ({ ...prev, enrollment_amount: value }))}
          onPaymentMethodChange={value => handlePaymentMethodChange('enrollment_payment_method', value)}
          onInstallmentsChange={value => setSale(prev => ({ ...prev, enrollment_installments: value }))}
          onPaymentDateChange={value => setSale(prev => ({ ...prev, enrollment_payment_date: value }))}
          onTodayClick={() => setTodayDate('enrollment_payment_date')}
          showInstallments={sale.enrollment_payment_method === 'cartao_credito'}
        />

        <PaymentSection
          title="Material Didático"
          amount={sale.material_amount}
          paymentMethod={sale.material_payment_method}
          installments={sale.material_installments || 1}
          paymentDate={sale.material_payment_date}
          onAmountChange={value => setSale(prev => ({ ...prev, material_amount: value }))}
          onPaymentMethodChange={value => handlePaymentMethodChange('material_payment_method', value)}
          onInstallmentsChange={value => setSale(prev => ({ ...prev, material_installments: value }))}
          onPaymentDateChange={value => setSale(prev => ({ ...prev, material_payment_date: value }))}
          onTodayClick={() => setTodayDate('material_payment_date')}
          showInstallments={sale.material_payment_method === 'cartao_credito' || sale.material_payment_method === 'boleto'}
        />
      </div>

      <MonthlyFeeSection
        amount={sale.monthly_fee_amount}
        paymentMethod={sale.monthly_fee_payment_method}
        dueDay={sale.monthly_fee_due_day}
        firstPaymentDate={sale.first_monthly_fee_date}
        onAmountChange={value => setSale(prev => ({ ...prev, monthly_fee_amount: value }))}
        onPaymentMethodChange={value => handlePaymentMethodChange('monthly_fee_payment_method', value)}
        onDueDayChange={value => setSale(prev => ({ ...prev, monthly_fee_due_day: value }))}
        onFirstPaymentDateChange={value => setSale(prev => ({ ...prev, first_monthly_fee_date: value }))}
      />

      <Button 
        onClick={handleSubmit}
        className="w-full"
        disabled={!isFormValid()}
      >
        Cadastrar Venda
      </Button>
    </div>
  )
}
