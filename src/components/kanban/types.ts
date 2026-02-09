
export type KanbanColumn = {
  id: string
  title: string
  cards: KanbanCard[]
}

export type KanbanCard = {
  id: string
  clientName: string
  leadSource: string
  phoneNumber: string
  email?: string
  createdAt: string
  nextContactDate?: string
  scheduledDate?: string
  activities?: string[]
  labels?: string[]
  original_ad?: string
  original_adset?: string
  observations?: string
  valorizationConfirmed?: boolean
  registrationName?: string
  unitId?: string
  unitName?: string
  lastUpdated?: string // Timestamp da última atualização
  quantidadeCadastros?: number // Contador de cadastros duplicados
  historicoCadastros?: string // Histórico de datas dos cadastros duplicados
}

export type ContactAttempt = {
  type: 'phone' | 'whatsapp' | 'whatsapp-call' | 'presencial'
  nextContactDate: Date
  cardId: string
  notes?: string
}

export type EffectiveContact = {
  type: 'phone' | 'whatsapp' | 'whatsapp-call' | 'presencial'
  contactDate: Date
  notes: string
  observations: string
  cardId: string
  nextContactDate?: Date
}

export type Scheduling = {
  scheduledDate: Date
  notes: string
  cardId: string
  valorizacaoDiaAnterior: boolean
  nextContactDate?: Date
  type: 'phone' | 'whatsapp' | 'whatsapp-call' | 'presencial'
  unitId: string // Adicionado campo unitId
}

export type Attendance = {
  result: 'matriculado' | 'negociacao' | 'perdido'
  cardId: string
  qualityScore?: string
  selectedReasons?: string[]
  observations?: string
  nextContactDate?: Date
  notes?: string // Novo campo para o descritivo
  studentName?: string // Nome completo do aluno (obrigatório quando matriculado)
}

export type PaymentMethod = 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'recorrencia';
export type DueDay = '5' | '10' | '15' | '20' | '25';
export type SaleType = 'matricula' | 'outros';

export interface Sale {
  id: string
  client_id: string
  student_id?: string
  sale_type: SaleType
  student_name: string
  important_info?: string
  attendance_activity_id: string
  enrollment_amount: number
  enrollment_payment_method: PaymentMethod
  enrollment_installments: number
  enrollment_payment_date: string
  material_amount: number
  material_payment_method: PaymentMethod
  material_installments: number
  material_payment_date: string
  monthly_fee_amount: number
  monthly_fee_payment_method: PaymentMethod
  first_monthly_fee_date: string
  monthly_fee_due_day?: DueDay
  student_photo_url?: string
  student_photo_thumbnail_url?: string
  photo_url?: string
  photo_thumbnail_url?: string
  unit_id: string
  created_by?: string
  created_at: string
  updated_at: string
  active: boolean
}

export interface ScheduledAppointment {
  id: string
  client_name: string
  scheduled_date: string
  status: string
  unit_id: string
  unit_name?: string
}
