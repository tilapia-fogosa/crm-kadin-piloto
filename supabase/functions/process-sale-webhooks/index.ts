
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  sale: {
    id: string
    created_at: string
    student_name: string
    enrollment_amount: number
    material_amount: number
    monthly_fee_amount: number
    payment_info: {
      enrollment: { method: string; installments: number }
      material: { method: string; installments: number }
      monthly_fee: { method: string; due_day?: number }
    }
  }
  client: {
    id: string
    name: string
    phone_number: string
    lead_source: string
  }
  unit: {
    id: string
    name: string
    unit_number: number
    trading_name: string
  }
  created_by: {
    id: string
    name: string
    email: string
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { sale_id } = await req.json()
    console.log('Processando webhooks para venda:', sale_id)

    // Buscar dados da venda
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select(`
        *,
        clients (*),
        units (
          id,
          name,
          unit_number,
          trading_name
        ),
        profiles (
          id,
          full_name,
          email
        )
      `)
      .eq('id', sale_id)
      .single()

    if (saleError || !sale) {
      console.error('Erro ao buscar venda:', saleError)
      throw new Error('Venda não encontrada')
    }

    // Buscar webhooks ativos
    const { data: webhooks, error: webhooksError } = await supabase
      .from('sale_webhooks')
      .select('*')
      .eq('active', true)
      .or(`unit_id.eq.${sale.unit_id},unit_id.is.null`)

    if (webhooksError) {
      console.error('Erro ao buscar webhooks:', webhooksError)
      throw new Error('Erro ao buscar webhooks')
    }

    // Preparar payload
    const payload: WebhookPayload = {
      sale: {
        id: sale.id,
        created_at: sale.created_at,
        student_name: sale.student_name,
        enrollment_amount: sale.enrollment_amount,
        material_amount: sale.material_amount,
        monthly_fee_amount: sale.monthly_fee_amount,
        payment_info: {
          enrollment: {
            method: sale.enrollment_payment_method,
            installments: sale.enrollment_installments
          },
          material: {
            method: sale.material_payment_method,
            installments: sale.material_installments
          },
          monthly_fee: {
            method: sale.monthly_fee_payment_method,
            due_day: sale.monthly_fee_due_day
          }
        }
      },
      client: {
        id: sale.client_id,
        name: sale.clients.name,
        phone_number: sale.clients.phone_number,
        lead_source: sale.clients.lead_source
      },
      unit: {
        id: sale.units.id,
        name: sale.units.name,
        unit_number: sale.units.unit_number,
        trading_name: sale.units.trading_name || sale.units.name
      },
      created_by: {
        id: sale.profiles.id,
        name: sale.profiles.full_name,
        email: sale.profiles.email
      }
    }

    // Processar cada webhook
    const results = await Promise.all(webhooks.map(async (webhook) => {
      try {
        console.log(`Enviando para webhook ${webhook.id}: ${webhook.url}`)
        
        // Criar log inicial
        const { data: log, error: logError } = await supabase
          .from('webhook_logs')
          .insert({
            webhook_id: webhook.id,
            sale_id: sale_id,
            status: 'pending',
            payload: payload
          })
          .select()
          .single()

        if (logError) {
          console.error('Erro ao criar log:', logError)
          throw logError
        }

        // Enviar webhook
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })

        const success = response.ok
        const errorMessage = success ? null : await response.text()

        // Atualizar log e webhook
        await Promise.all([
          supabase
            .from('webhook_logs')
            .update({
              status: success ? 'success' : 'failure',
              attempt_count: 1,
              error_message: errorMessage,
              last_attempt: new Date().toISOString()
            })
            .eq('id', log.id),
          
          supabase
            .from('sale_webhooks')
            .update(success 
              ? { last_success: new Date().toISOString() }
              : { last_failure: new Date().toISOString() }
            )
            .eq('id', webhook.id)
        ])

        return { webhook_id: webhook.id, success }
      } catch (error) {
        console.error(`Erro ao processar webhook ${webhook.id}:`, error)
        return { webhook_id: webhook.id, success: false, error }
      }
    }))

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro ao processar webhooks:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
