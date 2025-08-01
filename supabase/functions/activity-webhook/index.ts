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
  tipo_atividade: string
  tipo_contato: string
  scheduled_date?: string
  notes?: string
  unit_id: string
  created_by: string
  operacao?: 'criado' | 'atualizado' | 'excluido'
  // Novos campos para mudança de agendamento
  scheduled_date_anterior?: string | null
  tipo_mudanca_agendamento?: 'agendamento_criado' | 'reagendamento' | 'agendamento_cancelado'
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

    // Construir payload do webhook
    const webhookPayload = {
      activity_id: payload.activity_id,
      tipo_atividade: payload.tipo_atividade,
      tipo_contato: payload.tipo_contato,
      tipo_operacao: payload.tipo_atividade === 'Agendamento' ? 'agendamento' : 'atendimento',
      operacao: payload.operacao || 'criado', // Padrão é 'criado'
      scheduled_date: payload.scheduled_date,
      client_name: clientData.name,
      phone_number: clientData.phone_number,
      observations: clientData.observations,
      unit_name: unitData.name,
      notes: payload.notes,
      created_at: new Date().toISOString(),
      // Campos de mudança de agendamento (se aplicável)
      ...(payload.scheduled_date_anterior !== undefined && {
        scheduled_date_anterior: payload.scheduled_date_anterior,
        tipo_mudanca_agendamento: payload.tipo_mudanca_agendamento
      })
    }

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

  } catch (error) {
    console.error('❌ [Activity Webhook] Erro:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }