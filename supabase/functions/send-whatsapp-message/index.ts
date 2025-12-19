/**
 * Edge Function: send-whatsapp-message
 * 
 * Log: Função para enviar mensagens WhatsApp via webhook externo
 * Etapas:
 * 1. Recebe payload com telefone, nome do usuário, mensagem e profile_id
 * 2. Valida campos obrigatórios (aceita 'message' ou 'mensagem' para compatibilidade)
 * 3. Envia dados para webhook configurado (WHATSAPP_WEBHOOK_URL)
 * 4. Salva mensagem no historico_comercial com from_me = true e created_by
 * 5. Retorna sucesso ou erro com logs detalhados
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'
import { corsHeaders } from '../_shared/cors.ts'

interface SendMessagePayload {
  phone_number: string;
  user_name: string;
  message?: string;       // Campo usado pelo frontend atual
  mensagem?: string;      // Campo alternativo para compatibilidade
  audio?: string;         // Base64 do áudio (opcional)
  imagem?: string;        // Base64 da imagem (opcional)
  video?: string;         // Base64 do vídeo (opcional)
  client_id: string | null;
  profile_id: string;
  unit_id?: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('send-whatsapp-message: Requisição OPTIONS recebida');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('send-whatsapp-message: Iniciando processamento da requisição');
    
    const payload: SendMessagePayload = await req.json();
    
    // Log detalhado do payload recebido para debug
    console.log('send-whatsapp-message: Payload recebido:', {
      phone_number: payload.phone_number,
      user_name: payload.user_name,
      hasMessage: !!payload.message,
      hasMensagem: !!payload.mensagem,
      messageLength: payload.message?.length || 0,
      mensagemLength: payload.mensagem?.length || 0,
      hasAudio: !!payload.audio,
      hasImagem: !!payload.imagem,
      hasVideo: !!payload.video,
      client_id: payload.client_id,
      profile_id: payload.profile_id,
      unit_id: payload.unit_id
    });

    // Aceitar tanto 'message' quanto 'mensagem' para compatibilidade
    const messageContent = payload.message || payload.mensagem;
    const hasTextMessage = !!messageContent?.trim();
    const hasAudio = !!payload.audio;
    const hasImagem = !!payload.imagem;
    const hasVideo = !!payload.video;
    const hasAnyContent = hasTextMessage || hasAudio || hasImagem || hasVideo;

    console.log('send-whatsapp-message: Análise de conteúdo:', {
      hasTextMessage,
      hasAudio,
      hasImagem,
      hasVideo,
      hasAnyContent,
      messageContent: messageContent?.substring(0, 50) // Primeiros 50 chars para debug
    });

    // Validar campos obrigatórios
    if (!payload.phone_number) {
      console.error('send-whatsapp-message: phone_number não fornecido');
      return new Response(
        JSON.stringify({ error: 'Campo obrigatório: phone_number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.user_name) {
      console.error('send-whatsapp-message: user_name não fornecido');
      return new Response(
        JSON.stringify({ error: 'Campo obrigatório: user_name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.profile_id) {
      console.error('send-whatsapp-message: profile_id não fornecido');
      return new Response(
        JSON.stringify({ error: 'Campo obrigatório: profile_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!hasAnyContent) {
      console.error('send-whatsapp-message: Nenhum conteúdo para enviar (message, mensagem, audio, imagem ou video)');
      return new Response(
        JSON.stringify({ error: 'Nenhum conteúdo para enviar. Envie message, audio, imagem ou video.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const webhookUrl = Deno.env.get('WHATSAPP_WEBHOOK_URL');
    if (!webhookUrl) {
      console.error('send-whatsapp-message: WHATSAPP_WEBHOOK_URL não configurada');
      return new Response(
        JSON.stringify({ error: 'Webhook URL não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar payload para o webhook com campo padronizado 'mensagem'
    const webhookPayload: Record<string, unknown> = {
      phone_number: payload.phone_number,
      user_name: payload.user_name,
      client_id: payload.client_id,
      profile_id: payload.profile_id,
      unit_id: payload.unit_id,
      sent_at: new Date().toISOString()
    };

    // Adicionar conteúdo disponível ao payload do webhook
    if (hasTextMessage) {
      webhookPayload.mensagem = messageContent; // Padronizar para 'mensagem' no webhook
      webhookPayload.message = messageContent;  // Manter compatibilidade
    }
    if (hasAudio) webhookPayload.audio = payload.audio;
    if (hasImagem) webhookPayload.imagem = payload.imagem;
    if (hasVideo) webhookPayload.video = payload.video;

    console.log('send-whatsapp-message: Enviando para webhook:', {
      url: webhookUrl,
      payloadKeys: Object.keys(webhookPayload)
    });

    // Enviar para webhook externo
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    const webhookResponseText = await webhookResponse.text();
    console.log('send-whatsapp-message: Resposta do webhook:', {
      status: webhookResponse.status,
      ok: webhookResponse.ok,
      responsePreview: webhookResponseText.substring(0, 200)
    });

    if (!webhookResponse.ok) {
      console.error('send-whatsapp-message: Erro ao enviar para webhook:', {
        status: webhookResponse.status,
        error: webhookResponseText
      });
      throw new Error(`Webhook retornou status ${webhookResponse.status}: ${webhookResponseText}`);
    }

    console.log('send-whatsapp-message: Webhook respondeu com sucesso');

    // Inicializar cliente Supabase para salvar no histórico
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('send-whatsapp-message: Salvando mensagem no historico_comercial');

    // Preparar dados para inserção no histórico
    const historyData: Record<string, unknown> = {
      from_me: true,
      created_by: payload.profile_id,
      created_at: new Date().toISOString(),
      lida: true,
      lida_em: new Date().toISOString(),
      unit_id: payload.unit_id
    };

    // Adicionar conteúdo ao histórico
    if (hasTextMessage) {
      historyData.mensagem = messageContent;
    }
    // TODO: Adicionar suporte para salvar audio/imagem/video no histórico se necessário

    // Adicionar client_id ou telefone dependendo do caso
    if (payload.client_id) {
      historyData.client_id = payload.client_id;
      console.log('send-whatsapp-message: Salvando com client_id:', payload.client_id);
    } else {
      historyData.client_id = null;
      historyData.telefone = payload.phone_number;
      console.log('send-whatsapp-message: Salvando com telefone (sem cadastro):', payload.phone_number);
    }

    // Salvar mensagem no historico_comercial
    const { error: insertError } = await supabase
      .from('historico_comercial')
      .insert(historyData);

    if (insertError) {
      console.error('send-whatsapp-message: Erro ao salvar no histórico:', insertError);
      // Não falhar a requisição por erro no histórico, apenas logar
      console.warn('send-whatsapp-message: Mensagem enviada mas não salva no histórico');
    } else {
      console.log('send-whatsapp-message: Mensagem salva com sucesso no histórico');
    }

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

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar mensagem';
    console.error('send-whatsapp-message: Erro geral:', errorMessage);
    return new Response(
      JSON.stringify({ 
        error: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
