
import { PaymentMethod, DueDay, SaleType } from "@/integrations/supabase/types"

export interface PreSaleFormData {
  // Informações do Aluno
  student_name: string
  important_info?: string
  student_photo_url?: string
  student_photo_thumbnail_url?: string
  
  // Informações da Venda
  sale_type: SaleType
  
  // Matrícula
  enrollment_amount: number
  enrollment_payment_method: PaymentMethod
  enrollment_installments: number
  enrollment_payment_date: string
  
  // Material
  material_amount: number
  material_payment_method: PaymentMethod
  material_installments: number
  material_payment_date: string
  
  // Mensalidade
  monthly_fee_amount: number
  monthly_fee_payment_method: PaymentMethod
  first_monthly_fee_date: string
  monthly_fee_due_day?: DueDay
}

export interface PaymentSectionProps {
  title: string
  amount: number
  paymentMethod: PaymentMethod | undefined
  installments: number
  paymentDate: string
  onAmountChange: (value: number) => void
  onPaymentMethodChange: (value: PaymentMethod) => void
  onInstallmentsChange: (value: number) => void
  onPaymentDateChange: (value: string) => void
  showInstallments?: boolean
}

export interface MonthlyFeeSectionProps {
  amount: number
  paymentMethod: PaymentMethod | undefined
  dueDay: DueDay | undefined
  firstPaymentDate: string
  onAmountChange: (value: number) => void
  onPaymentMethodChange: (value: PaymentMethod) => void
  onDueDayChange: (value: DueDay) => void
  onFirstPaymentDateChange: (value: string) => void
}
