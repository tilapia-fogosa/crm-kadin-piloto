
import { Button } from "@/components/ui/button"
import { usePreSaleForm } from "./hooks/usePreSaleForm"
import { StudentInfo } from "./components/sale-form/StudentInfo"
import { ImportantInfo } from "./components/sale-form/ImportantInfo"
import { PaymentSection } from "./components/sale-form/PaymentSection"
import { MonthlyFeeSection } from "./components/sale-form/MonthlyFeeSection"
import { PhotoUpload } from "./components/sale-form/PhotoUpload"
import { MatriculationMessage } from "./components/attendance/MatriculationMessage"
import { format } from "date-fns"

interface PreSaleFormProps {
  clientId: string
  clientName: string
  activityId: string
  onComplete: () => void
}

export function PreSaleForm({ clientId, clientName, activityId, onComplete }: PreSaleFormProps) {
  console.log('Renderizando PreSaleForm para cliente:', clientName)
  
  const {
    formData,
    isLoading,
    updateForm,
    handleSubmit,
    validateForm
  } = usePreSaleForm(clientId, activityId)

  const handleFormSubmit = async () => {
    console.log('Tentando submeter formulário')
    
    if (!validateForm()) {
      console.log('Formulário inválido')
      return
    }

    try {
      await handleSubmit()
      onComplete()
    } catch (error) {
      console.error('Erro ao finalizar pré-venda:', error)
    }
  }

  const setTodayDate = (field: 'enrollment_payment_date' | 'material_payment_date' | 'first_monthly_fee_date') => {
    const today = format(new Date(), 'yyyy-MM-dd')
    updateForm({ [field]: today })
  }

  return (
    <div className="space-y-6 py-4">
      <MatriculationMessage clientName={clientName} />
      
      <StudentInfo
        value={formData.student_name || ''}
        onChange={value => updateForm({ student_name: value })}
      />

      <ImportantInfo
        value={formData.important_info || ''}
        onChange={value => updateForm({ important_info: value })}
      />

      <PhotoUpload 
        onPhotoUploaded={urls => updateForm({
          student_photo_url: urls.student_photo_url,
          student_photo_thumbnail_url: urls.student_photo_thumbnail_url
        })} 
      />

      <div className="grid grid-cols-2 gap-4">
        <PaymentSection
          title="Matrícula"
          amount={formData.enrollment_amount || 0}
          paymentMethod={formData.enrollment_payment_method}
          installments={formData.enrollment_installments || 1}
          paymentDate={formData.enrollment_payment_date || ''}
          onAmountChange={value => updateForm({ enrollment_amount: value })}
          onPaymentMethodChange={value => updateForm({ enrollment_payment_method: value })}
          onInstallmentsChange={value => updateForm({ enrollment_installments: value })}
          onPaymentDateChange={value => updateForm({ enrollment_payment_date: value })}
          onTodayClick={() => setTodayDate('enrollment_payment_date')}
          showInstallments={formData.enrollment_payment_method === 'cartao_credito'}
        />

        <PaymentSection
          title="Material Didático"
          amount={formData.material_amount || 0}
          paymentMethod={formData.material_payment_method}
          installments={formData.material_installments || 1}
          paymentDate={formData.material_payment_date || ''}
          onAmountChange={value => updateForm({ material_amount: value })}
          onPaymentMethodChange={value => updateForm({ material_payment_method: value })}
          onInstallmentsChange={value => updateForm({ material_installments: value })}
          onPaymentDateChange={value => updateForm({ material_payment_date: value })}
          onTodayClick={() => setTodayDate('material_payment_date')}
          showInstallments={formData.material_payment_method === 'cartao_credito'}
        />
      </div>

      <MonthlyFeeSection
        amount={formData.monthly_fee_amount || 0}
        paymentMethod={formData.monthly_fee_payment_method}
        dueDay={formData.monthly_fee_due_day}
        firstPaymentDate={formData.first_monthly_fee_date || ''}
        onAmountChange={value => updateForm({ monthly_fee_amount: value })}
        onPaymentMethodChange={value => updateForm({ monthly_fee_payment_method: value })}
        onDueDayChange={value => updateForm({ monthly_fee_due_day: value })}
        onFirstPaymentDateChange={value => updateForm({ first_monthly_fee_date: value })}
      />

      <Button 
        onClick={handleFormSubmit}
        className="w-full"
        disabled={!validateForm() || isLoading}
      >
        {isLoading ? 'Cadastrando...' : 'Cadastrar Pré-Venda'}
      </Button>
    </div>
  )
}
