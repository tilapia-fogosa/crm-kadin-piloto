/**
 * Edge Function: whatsapp-webhook-comercial
 * 
 * Descrição: Processa e envia mensagens do WhatsApp comercial para webhook externo
 * 
 * Funcionalidades:
 * - Recebe mensagens de texto, áudio, imagem e vídeo
 * - Valida campos obrigatórios
 * - Envia para webhook externo (WHATSAPP_WEBHOOK_COMERCIAL)
 * - Registra no histórico_comercial (Supabase)
 * - Logs detalhados em cada etapa
 * 
 * Payload esperado:
 * {
 *   phone_number: string       // Número do destinatário (obrigatório)
 *   message?: string           // Texto da mensagem
 *   audio?: string             // Base64 do áudio
 *   imagem?: string            // Base64 da imagem
 *   video?: string             // Base64 do vídeo
 *   client_id?: string         // ID do cliente
 *   profile_id?: string        // ID do perfil do usuário
 *   user_name?: string         // Nome do usuário
 *   unit_id?: string           // ID da unidade
 * }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configuração CORS para requisições web
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

// Interface do payload recebido
interface WebhookPayload {
  phone_number: string;
  message?: string;
  mensagem?: string;  // Compatibilidade com campo alternativo
  audio?: string;
  imagem?: string;
  video?: string;
  client_id?: string;
  profile_id?: string;
  user_name?: string;
  unit_id?: string;
}

// Interface do payload enviado para o webhook externo
interface ExternalWebhookPayload {
  phone_number: string;
  message?: string;
  audio?: string;
  imagem?: string;
  video?: string;
  client_id?: string;
  profile_id?: string;
  user_name?: string;
  unit_id?: string;
  timestamp: string;
  source: string;
}

serve(async (req) => {
  const requestId = crypto.randomUUID().slice(0, 8);
  const timestamp = new Date().toISOString();
  
  console.log('='.repeat(60));
  console.log(`[${requestId}] whatsapp-webhook-comercial: INÍCIO`);
  console.log(`[${requestId}] Timestamp: ${timestamp}`);
  console.log(`[${requestId}] Method: ${req.method}`);
  console.log('='.repeat(60));

  // Handler para preflight CORS
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] Requisição OPTIONS (CORS preflight)`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Passo 1: Ler e parsear o body
    console.log(`[${requestId}] Passo 1: Lendo body da requisição...`);
    const rawBody = await req.text();
    console.log(`[${requestId}] Raw body length: ${rawBody.length} caracteres`);
    console.log(`[${requestId}] Raw body (primeiros 500 chars): ${rawBody.slice(0, 500)}`);

    let payload: WebhookPayload;
    try {
      payload = JSON.parse(rawBody);
      console.log(`[${requestId}] Payload parseado com sucesso`);
    } catch (parseError) {
      console.error(`[${requestId}] ERRO ao parsear JSON:`, parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'JSON inválido no body da requisição',
          requestId 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Passo 2: Log detalhado do payload
    console.log(`[${requestId}] Passo 2: Analisando payload...`);
    console.log(`[${requestId}] Payload completo:`, JSON.stringify(payload, null, 2));
    
    // Detectar conteúdo presente
    const hasMessage = !!(payload.message || payload.mensagem);
    const hasAudio = !!payload.audio;
    const hasImagem = !!payload.imagem;
    const hasVideo = !!payload.video;
    const hasPhoneNumber = !!payload.phone_number;
    
    console.log(`[${requestId}] Conteúdo detectado:`);
    console.log(`[${requestId}]   - phone_number: ${hasPhoneNumber} (${payload.phone_number || 'N/A'})`);
    console.log(`[${requestId}]   - message: ${hasMessage} (${(payload.message || payload.mensagem)?.slice(0, 50) || 'N/A'}...)`);
    console.log(`[${requestId}]   - audio: ${hasAudio} (${payload.audio?.slice(0, 30) || 'N/A'}...)`);
    console.log(`[${requestId}]   - imagem: ${hasImagem} (${payload.imagem?.slice(0, 30) || 'N/A'}...)`);
    console.log(`[${requestId}]   - video: ${hasVideo} (${payload.video?.slice(0, 30) || 'N/A'}...)`);
    console.log(`[${requestId}]   - client_id: ${payload.client_id || 'N/A'}`);
    console.log(`[${requestId}]   - profile_id: ${payload.profile_id || 'N/A'}`);
    console.log(`[${requestId}]   - user_name: ${payload.user_name || 'N/A'}`);
    console.log(`[${requestId}]   - unit_id: ${payload.unit_id || 'N/A'}`);

    // Passo 3: Validações
    console.log(`[${requestId}] Passo 3: Validando campos obrigatórios...`);
    
    if (!hasPhoneNumber) {
      console.error(`[${requestId}] ERRO: phone_number não fornecido`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'phone_number é obrigatório',
          requestId 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!hasMessage && !hasAudio && !hasImagem && !hasVideo) {
      console.error(`[${requestId}] ERRO: Nenhum conteúdo para enviar`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Pelo menos um tipo de conteúdo é obrigatório (message, audio, imagem ou video)',
          requestId 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${requestId}] Validações OK`);

    // Passo 4: Verificar configuração do webhook
    console.log(`[${requestId}] Passo 4: Verificando configuração do webhook...`);
    const webhookUrl = Deno.env.get('WHATSAPP_WEBHOOK_COMERCIAL');
    
    if (!webhookUrl) {
      console.error(`[${requestId}] ERRO: WHATSAPP_WEBHOOK_COMERCIAL não configurado`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Webhook não configurado. Configure a variável WHATSAPP_WEBHOOK_COMERCIAL.',
          requestId 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[${requestId}] Webhook URL configurada: ${webhookUrl.slice(0, 50)}...`);

    // Passo 5: Preparar payload para webhook externo
    console.log(`[${requestId}] Passo 5: Preparando payload para webhook externo...`);
    
    const externalPayload: ExternalWebhookPayload = {
      phone_number: payload.phone_number,
      message: payload.message || payload.mensagem,
      audio: payload.audio,
      imagem: payload.imagem,
      video: payload.video,
      client_id: payload.client_id,
      profile_id: payload.profile_id,
      user_name: payload.user_name,
      unit_id: payload.unit_id,
      timestamp: timestamp,
      source: 'lovable-whatsapp-comercial'
    };

    // Remover campos undefined
    Object.keys(externalPayload).forEach(key => {
      if (externalPayload[key as keyof ExternalWebhookPayload] === undefined) {
        delete externalPayload[key as keyof ExternalWebhookPayload];
      }
    });

    console.log(`[${requestId}] Payload externo preparado:`, JSON.stringify({
      ...externalPayload,
      audio: externalPayload.audio ? '[BASE64_AUDIO]' : undefined,
      imagem: externalPayload.imagem ? '[BASE64_IMAGEM]' : undefined,
      video: externalPayload.video ? '[BASE64_VIDEO]' : undefined,
    }, null, 2));

    // Passo 6: Enviar para webhook externo
    console.log(`[${requestId}] Passo 6: Enviando para webhook externo...`);
    console.log(`[${requestId}] URL: ${webhookUrl}`);
    
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(externalPayload),
    });

    const webhookStatus = webhookResponse.status;
    const webhookStatusText = webhookResponse.statusText;
    
    console.log(`[${requestId}] Webhook response status: ${webhookStatus} ${webhookStatusText}`);
    
    let webhookResponseData;
    try {
      const responseText = await webhookResponse.text();
      console.log(`[${requestId}] Webhook response body (raw): ${responseText.slice(0, 500)}`);
      webhookResponseData = responseText ? JSON.parse(responseText) : null;
      console.log(`[${requestId}] Webhook response data:`, JSON.stringify(webhookResponseData, null, 2));
    } catch (e) {
      console.log(`[${requestId}] Não foi possível parsear resposta do webhook como JSON`);
      webhookResponseData = null;
    }

    if (!webhookResponse.ok) {
      console.error(`[${requestId}] ERRO: Webhook retornou status ${webhookStatus}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Webhook retornou erro: ${webhookStatus} ${webhookStatusText}`,
          webhookResponse: webhookResponseData,
          requestId 
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Passo 7: Registrar no histórico (opcional, se tiver client_id)
    console.log(`[${requestId}] Passo 7: Verificando registro no histórico...`);
    
    if (payload.client_id && payload.profile_id) {
      console.log(`[${requestId}] Registrando no histórico_comercial...`);
      
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          const messageContent = payload.message || payload.mensagem || 
            (hasAudio ? '[Áudio]' : '') +
            (hasImagem ? '[Imagem]' : '') +
            (hasVideo ? '[Vídeo]' : '');
          
          const { data: insertData, error: insertError } = await supabase
            .from('historico_comercial')
            .insert({
              client_id: payload.client_id,
              profile_id: payload.profile_id,
              tipo: 'mensagem_enviada',
              conteudo: messageContent,
              metadata: {
                source: 'whatsapp-webhook-comercial',
                has_audio: hasAudio,
                has_imagem: hasImagem,
                has_video: hasVideo,
                timestamp: timestamp
              }
            });
          
          if (insertError) {
            console.warn(`[${requestId}] Aviso: Erro ao registrar histórico:`, insertError);
          } else {
            console.log(`[${requestId}] Histórico registrado com sucesso`);
          }
        } else {
          console.log(`[${requestId}] Supabase não configurado, pulando registro de histórico`);
        }
      } catch (historyError) {
        console.warn(`[${requestId}] Aviso: Erro ao registrar histórico:`, historyError);
      }
    } else {
      console.log(`[${requestId}] Sem client_id/profile_id, pulando registro de histórico`);
    }

    // Passo 8: Resposta de sucesso
    console.log('='.repeat(60));
    console.log(`[${requestId}] whatsapp-webhook-comercial: SUCESSO`);
    console.log(`[${requestId}] Mensagem enviada para: ${payload.phone_number}`);
    console.log(`[${requestId}] Tipo de conteúdo: ${hasMessage ? 'texto' : ''}${hasAudio ? ' áudio' : ''}${hasImagem ? ' imagem' : ''}${hasVideo ? ' vídeo' : ''}`);
    console.log('='.repeat(60));

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mensagem enviada com sucesso',
        requestId,
        webhookResponse: webhookResponseData,
        sentTo: payload.phone_number,
        contentType: {
          message: hasMessage,
          audio: hasAudio,
          imagem: hasImagem,
          video: hasVideo
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('='.repeat(60));
    console.error(`[${requestId}] whatsapp-webhook-comercial: ERRO CRÍTICO`);
    console.error(`[${requestId}] Erro:`, error);
    console.error(`[${requestId}] Stack:`, error.stack);
    console.error('='.repeat(60));
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor',
        requestId 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
