/**
 * SERVIÇO CENTRALIZADO DE WEBHOOKS
 * 
 * Centraliza toda a lógica de envio de webhooks para atividades
 * Garante consistência e facilita manutenção
 */

import { supabase } from "@/integrations/supabase/client"
import { ActivityWebhookPayload, WebhookResult } from "../types/webhook.types"

/**
 * Log detalhado para debugging
 */
const logWebhook = (operation: string, payload: ActivityWebhookPayload) => {
  console.log(`📤 [WebhookService] ${operation}:`, {
    activity_id: payload.activity_id,
    client_id: payload.client_id,
    tipo_atividade: payload.tipo_atividade,
    tipo_contato: payload.tipo_contato,
    operacao: payload.operacao,
    scheduled_date: payload.scheduled_date,
    scheduled_date_anterior: payload.scheduled_date_anterior,
    tipo_mudanca_agendamento: payload.tipo_mudanca_agendamento,
    has_scheduled_date_change: !!(payload.scheduled_date_anterior || payload.tipo_mudanca_agendamento)
  })
}

/**
 * Função utilitária para buscar dados do cliente
 */
export const fetchClientData = async (clientId: string) => {
  const { data: clientData, error } = await supabase
    .from('clients')
    .select('unit_id, status, scheduled_date')
    .eq('id', clientId)
    .single()

  if (error) throw error
  if (!clientData?.unit_id) throw new Error('Client has no unit_id')
  
  return clientData
}

/**
 * Função principal para envio de webhook unificado
 */
export const sendActivityWebhook = async (payload: ActivityWebhookPayload): Promise<WebhookResult> => {
  try {
    logWebhook('Enviando webhook unificado', payload)
    
    const { data: response, error } = await supabase.functions.invoke('activity-webhook', {
      body: payload
    })
    
    if (error) {
      console.error('❌ [WebhookService] Erro no webhook:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ [WebhookService] Webhook enviado com sucesso:', response)
    return { success: true }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('⚠️ [WebhookService] Falha no webhook:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Wrapper para webhooks não-bloqueantes
 * Garante que falhas de webhook não afetem o fluxo principal
 */
export const sendActivityWebhookSafe = async (payload: ActivityWebhookPayload): Promise<void> => {
  try {
    await sendActivityWebhook(payload)
  } catch (error) {
    console.warn('⚠️ [WebhookService] Webhook falhou (não-bloqueante):', error)
  }
}

/**
 * Helper para determinar tipo de mudança de agendamento
 */
export const getScheduleChangeType = (
  previousScheduledDate: string | null | undefined,
  newScheduledDate: string | null | undefined
): 'agendamento_criado' | 'reagendamento' | 'agendamento_cancelado' | undefined => {
  if (!previousScheduledDate && newScheduledDate) {
    return 'agendamento_criado'
  }
  if (previousScheduledDate && newScheduledDate) {
    return 'reagendamento'
  }
  if (previousScheduledDate && !newScheduledDate) {
    return 'agendamento_cancelado'
  }
  return undefined
}