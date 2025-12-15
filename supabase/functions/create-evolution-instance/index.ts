/**
 * Edge Function: create-evolution-instance
 * 
 * Log: Cria nova instância Evolution API via webhook N8N
 * Etapas:
 * 1. Recebe telefone do frontend
 * 2. Valida formato do telefone
 * 3. Chama webhook N8N com payload { phone, instanceName: "maringacomercial" }
 * 4. Retorna resposta (QR Code ou status da conexão)
 * 
 * Utiliza: EVOLUTION_WEBHOOK_URL secret
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  phone: string;
}

interface WebhookPayload {
  phone: string;
  instanceName: string;
}

serve(async (req) => {
  console.log('[create-evolution-instance] Função iniciada');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('[create-evolution-instance] Requisição CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Obter URL do webhook das secrets
    const webhookUrl = Deno.env.get('EVOLUTION_WEBHOOK_URL');
    console.log('[create-evolution-instance] Webhook URL configurada:', !!webhookUrl);

    if (!webhookUrl) {
      console.error('[create-evolution-instance] EVOLUTION_WEBHOOK_URL não configurada');
      throw new Error('Webhook URL não configurada. Verifique as secrets do projeto.');
    }

    // Parsear body da requisição
    const body: RequestBody = await req.json();
    console.log('[create-evolution-instance] Body recebido:', { phone: body.phone });

    // Validar telefone
    if (!body.phone || body.phone.trim() === '') {
      console.error('[create-evolution-instance] Telefone não fornecido');
      throw new Error('Número de telefone é obrigatório');
    }

    // Limpar telefone (remover caracteres não numéricos exceto +)
    const cleanPhone = body.phone.replace(/[^\d+]/g, '');
    console.log('[create-evolution-instance] Telefone limpo:', cleanPhone);

    // Validar formato do telefone brasileiro
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      console.error('[create-evolution-instance] Formato de telefone inválido:', cleanPhone);
      throw new Error('Formato de telefone inválido. Use o formato: +55 (DDD) 99999-9999');
    }

    // Montar payload para o webhook N8N
    const webhookPayload: WebhookPayload = {
      phone: cleanPhone,
      instanceName: "maringacomercial"
    };
    console.log('[create-evolution-instance] Payload para webhook:', webhookPayload);

    // Chamar webhook N8N
    console.log('[create-evolution-instance] Chamando webhook N8N...');
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    console.log('[create-evolution-instance] Status da resposta do webhook:', webhookResponse.status);

    // Verificar se a resposta foi bem sucedida
    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('[create-evolution-instance] Erro no webhook:', errorText);
      throw new Error(`Erro ao chamar webhook: ${webhookResponse.status} - ${errorText}`);
    }

    // Parsear resposta do webhook
    let webhookData;
    const contentType = webhookResponse.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      webhookData = await webhookResponse.json();
      console.log('[create-evolution-instance] Resposta JSON do webhook:', webhookData);
    } else {
      webhookData = { message: await webhookResponse.text() };
      console.log('[create-evolution-instance] Resposta texto do webhook:', webhookData);
    }

    // Retornar sucesso
    console.log('[create-evolution-instance] Operação concluída com sucesso');
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Instância Evolution criada/atualizada com sucesso',
        data: webhookData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[create-evolution-instance] Erro:', errorMessage);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
