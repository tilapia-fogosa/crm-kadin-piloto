/**
 * Edge Function: send-whatsapp-message
 * 
 * Log: Função para enviar mensagens WhatsApp via webhook externo
 * Etapas:
 * 1. Recebe payload com telefone, nome do usuário e mensagem
 * 2. Valida campos obrigatórios
 * 3. Envia dados para webhook configurado (WHATSAPP_WEBHOOK_URL)
 * 4. Retorna sucesso ou erro com logs detalhados
 * 
 * Nota: O salvamento no historico_comercial é feito pelo webhook externo
 */

import { corsHeaders } from '../_shared/cors.ts'

interface SendMessagePayload {
  phone_number: string;
  user_name: string;
  message: string;
  client_id: string;
  profile_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('send-whatsapp-message: Requisição OPTIONS recebida');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('send-whatsapp-message: Recebendo requisição');
    
    const payload: SendMessagePayload = await req.json();
    console.log('send-whatsapp-message: Payload recebido:', {
      phone_number: payload.phone_number,
      client_id: payload.client_id,
      message_length: payload.message?.length
    });

    // Validar campos obrigatórios
    if (!payload.phone_number || !payload.user_name || !payload.message || !payload.client_id || !payload.profile_id) {
      console.error('send-whatsapp-message: Campos obrigatórios faltando');
      return new Response(
        JSON.stringify({ 
          error: 'Campos obrigatórios: phone_number, user_name, message, client_id, profile_id' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const webhookUrl = Deno.env.get('WHATSAPP_WEBHOOK_URL');
    if (!webhookUrl) {
      console.error('send-whatsapp-message: WHATSAPP_WEBHOOK_URL não configurada');
      return new Response(
        JSON.stringify({ error: 'Webhook URL não configurada' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Criar payload para o webhook
    const webhookPayload = {
      phone_number: payload.phone_number,
      user_name: payload.user_name,
      message: payload.message,
      client_id: payload.client_id,
      profile_id: payload.profile_id,
      sent_at: new Date().toISOString()
    };

    console.log('send-whatsapp-message: Enviando para webhook:', webhookUrl);

    // Enviar para webhook externo
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('send-whatsapp-message: Erro ao enviar para webhook:', {
        status: webhookResponse.status,
        error: errorText
      });
      throw new Error(`Webhook retornou status ${webhookResponse.status}: ${errorText}`);
    }

    console.log('send-whatsapp-message: Webhook respondeu com sucesso');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mensagem enviada com sucesso' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('send-whatsapp-message: Erro geral:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao enviar mensagem' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
