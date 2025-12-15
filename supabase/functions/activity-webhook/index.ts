import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
}

interface WebhookPayload {
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
  
  // Campos de mudança de agendamento (SEMPRE incluir para auditoria)
  scheduled_date_anterior?: string | null
  tipo_mudanca_agendamento?: 'agendamento_criado' | 'reagendamento' | 'agendamento_cancelado'
  
  // Contexto adicional
  previous_status?: string
  new_status?: string
  
  // Campos especiais para eventos de mudança
  tipo_evento?: 'scheduled_date_change'
  tipo_mudanca?: string
  scheduled_date_novo?: string | null
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 [Activity Webhook] Iniciando processamento')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const payload: WebhookPayload = await req.json()
    console.log('📋 [Activity Webhook] Payload recebido:', payload)

    // Buscar URL do webhook
    const { data: webhookData, error: webhookError } = await supabase
      .from('dados_importantes')
      .select('data')
      .eq('id', 11)
      .single()

    if (webhookError || !webhookData?.data) {
      console.log('⚠️ [Activity Webhook] Webhook URL não configurada')
      return new Response(
        JSON.stringify({ success: false, message: 'Webhook URL não configurada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const webhookUrl = webhookData.data
    console.log('🔗 [Activity Webhook] URL do webhook:', webhookUrl)

    // Buscar dados do cliente
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('name, phone_number, observations')
      .eq('id', payload.client_id)
      .single()

    if (clientError) {
      console.error('❌ [Activity Webhook] Erro ao buscar cliente:', clientError)
      throw new Error('Erro ao buscar dados do cliente')
    }

    // Buscar dados da unidade
    const { data: unitData, error: unitError } = await supabase
      .from('units')
      .select('name')
      .eq('id', payload.unit_id)
      .single()

    if (unitError) {
      console.error('❌ [Activity Webhook] Erro ao buscar unidade:', unitError)
      throw new Error('Erro ao buscar dados da unidade')
    }

    // Helper function para determinar tipo de operação
    function getOperationType(tipoAtividade: string): string {
      switch (tipoAtividade) {
        case 'Agendamento':
          return 'agendamento'
        case 'Atendimento':
        case 'Matrícula':
          return 'atendimento'
        case 'Tentativa de Contato':
        case 'Contato Efetivo':
          return 'contato'
        default:
          return 'atividade'
      }
    }

    // Log detalhado de validação de campos
    console.log('🔍 [Activity Webhook] Validação de campos obrigatórios:', {
      activity_id: payload.activity_id,
      client_id: payload.client_id,
      tipo_atividade: payload.tipo_atividade,
      tipo_contato: payload.tipo_contato,
      unit_id: payload.unit_id,
      created_by: payload.created_by,
      operacao: payload.operacao,
      scheduled_date_anterior: payload.scheduled_date_anterior,
      tipo_mudanca_agendamento: payload.tipo_mudanca_agendamento,
      previous_status: payload.previous_status,
      new_status: payload.new_status
    })

    // Construir payload unificado do webhook
    const webhookPayload = {
      activity_id: payload.activity_id,
      tipo_atividade: payload.tipo_atividade,
      tipo_contato: payload.tipo_contato,
      tipo_operacao: getOperationType(payload.tipo_atividade),
      operacao: payload.operacao,
      scheduled_date: payload.scheduled_date,
      client_name: clientData.name,
      phone_number: clientData.phone_number,
      observations: clientData.observations,
      unit_name: unitData.name,
      notes: payload.notes,
      created_at: new Date().toISOString(),
      
      // SEMPRE incluir campos de mudança de agendamento para auditoria completa
      scheduled_date_anterior: payload.scheduled_date_anterior,
      tipo_mudanca_agendamento: payload.tipo_mudanca_agendamento,
      
      // Contexto adicional se disponível
      previous_status: payload.previous_status,
      new_status: payload.new_status,
      
      // Campos especiais para eventos de mudança de scheduled_date
      ...(payload.tipo_evento === 'scheduled_date_change' && {
        tipo_evento: payload.tipo_evento,
        tipo_mudanca: payload.tipo_mudanca,
        scheduled_date_novo: payload.scheduled_date_novo
      })
    }
    
    console.log('📊 [Activity Webhook] Auditoria completa de agendamento:', {
      scheduled_date_anterior: payload.scheduled_date_anterior,
      tipo_mudanca_agendamento: payload.tipo_mudanca_agendamento,
      scheduled_date_atual: payload.scheduled_date,
      tipo_evento: payload.tipo_evento,
      operacao: payload.operacao,
      contexto_completo: true
    })

    console.log('📤 [Activity Webhook] Enviando payload:', webhookPayload)

    // Enviar webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    })

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      console.error('❌ [Activity Webhook] Erro na resposta do webhook:', errorText)
      throw new Error(`Webhook falhou: ${webhookResponse.status} - ${errorText}`)
    }

    console.log('✅ [Activity Webhook] Webhook enviado com sucesso')

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook enviado com sucesso' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ [Activity Webhook] Erro:', errorMessage)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})