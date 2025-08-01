/**
 * TYPES PARA UNIFICAÇÃO DE WEBHOOKS
 * 
 * Interface unificada para todos os webhooks de atividade
 * Garante consistência entre agendamentos, atendimentos e perdas
 */

export interface ActivityWebhookPayload {
  // Campos básicos obrigatórios
  activity_id: string
  client_id: string
  tipo_atividade: 'Agendamento' | 'Atendimento' | 'Matrícula' | 'Tentativa de Contato' | 'Contato Efetivo'
  tipo_contato: 'phone' | 'whatsapp' | 'whatsapp-call' | 'presencial'
  unit_id: string
  created_by: string
  operacao: 'criado' | 'atualizado' | 'excluido'
  
  // Campos opcionais
  scheduled_date?: string
  notes?: string
  
  // Campos de mudança de agendamento (sempre incluir para auditoria)
  scheduled_date_anterior?: string | null
  tipo_mudanca_agendamento?: 'agendamento_criado' | 'reagendamento' | 'agendamento_cancelado'
  
  // Contexto adicional para debug
  previous_status?: string
  new_status?: string
}

export interface WebhookResult {
  success: boolean
  error?: string
}