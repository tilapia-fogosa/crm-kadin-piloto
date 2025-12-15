
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'

// Configuração de CORS para permitir solicitações da aplicação
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Definir limite de rate para evitar sobrecarga de requisições
const MAX_WEBHOOK_REQUESTS_PER_BATCH = 20

// Variáveis de ambiente do projeto Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

// Criar cliente Supabase com função de administrador
const supabase = createClient(supabaseUrl, serviceRoleKey)

// Função principal para processar webhooks pendentes
async function processPendingWebhooks() {
  console.log('Iniciando processamento de webhooks de clientes pendentes')

  try {
    // Buscar webhooks pendentes limitados pelo MAX_WEBHOOK_REQUESTS_PER_BATCH
    const { data: pendingLogs, error } = await supabase
      .from('client_webhook_logs')
      .select(`
        id,
        webhook_id,
        client_id,
        payload,
        attempt_count,
        client_webhooks(url)
      `)
      .eq('status', 'pending')
      .is('last_attempt', null)
      .order('created_at', { ascending: true })
      .limit(MAX_WEBHOOK_REQUESTS_PER_BATCH)

    if (error) {
      throw new Error(`Erro ao buscar webhooks pendentes: ${error.message}`)
    }

    console.log(`Encontrados ${pendingLogs?.length || 0} webhooks pendentes para processamento`)

    if (!pendingLogs || pendingLogs.length === 0) {
      return { processedCount: 0 }
    }

    // Processar cada webhook pendente
    const results = await Promise.all(
      pendingLogs.map(async (log) => {
        try {
          const webhookUrl = (log.client_webhooks as { url: string } | null)?.url;
          console.log(`Processando webhook ID: ${log.id}, URL: ${webhookUrl}`)
          
          // Atualizar o log com a tentativa atual
          await supabase
            .from('client_webhook_logs')
            .update({
              last_attempt: new Date().toISOString(),
              attempt_count: log.attempt_count + 1
            })
            .eq('id', log.id)

          // Enviar o webhook para a URL configurada
          const response = await fetch(webhookUrl!, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(log.payload)
          })

          if (!response.ok) {
            throw new Error(`Resposta não-OK: ${response.status} ${response.statusText}`)
          }

          // Webhook enviado com sucesso
          await supabase
            .from('client_webhook_logs')
            .update({
              status: 'success'
            })
            .eq('id', log.id)

          // Atualizar timestamp de sucesso do webhook
          await supabase
            .from('client_webhooks')
            .update({
              last_success: new Date().toISOString()
            })
            .eq('id', log.webhook_id)

          return { id: log.id, success: true }
        } catch (error) {
          console.error(`Erro no webhook ${log.id}:`, error)
          
          // Calcular próxima tentativa com base no número de tentativas
          let nextRetry = null
          if (log.attempt_count < 3) {
            // Estratégia de retry: 1h, 6h, 24h
            const retryHours = log.attempt_count === 0 ? 1 : log.attempt_count === 1 ? 6 : 24
            nextRetry = new Date()
            nextRetry.setHours(nextRetry.getHours() + retryHours)
          }

          // Atualizar o log de falha
          await supabase
            .from('client_webhook_logs')
            .update({
              status: 'failure',
              error_message: `${error}`.substring(0, 500), // Limitar tamanho da mensagem de erro
              next_retry: nextRetry?.toISOString() || null
            })
            .eq('id', log.id)
          
          // Atualizar timestamp de falha do webhook
          await supabase
            .from('client_webhooks')
            .update({
              last_failure: new Date().toISOString()
            })
            .eq('id', log.webhook_id)
            
          return { id: log.id, success: false, error: `${error}` }
        }
      })
    )

    const successCount = results.filter(r => r.success).length
    const failureCount = results.length - successCount

    console.log(`Processamento finalizado: ${successCount} sucesso, ${failureCount} falhas`)
    return { 
      processedCount: results.length,
      successCount,
      failureCount
    }
  } catch (error) {
    console.error('Erro no processamento geral de webhooks:', error)
    throw error
  }
}

// Criar endpoint HTTP para processar webhooks pendentes
Deno.serve(async (req) => {
  // Lidar com solicitações CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verificar autenticação
    if (req.method === 'POST') {
      // Para invocações manuais ou agendadas
      const result = await processPendingWebhooks()
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    // Método HTTP não suportado
    return new Response(JSON.stringify({ error: 'Método não suportado' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405
    })
  } catch (error) {
    console.error('Erro na execução da função:', error)
    return new Response(JSON.stringify({ error: `${error}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
