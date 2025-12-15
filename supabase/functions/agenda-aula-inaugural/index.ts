/**
 * LOG: Edge Function para agendamento de aula inaugural
 * Envia dados para webhook N8N ao invés de salvar diretamente no banco
 * O webhook externo fará a persistência dos dados via API
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AgendaAulaInauguralRequest {
  activity_id: string;
  full_name: string;
  data_aula_inaugural: string; // ISO date string (YYYY-MM-DD)
  horario_inicio: string; // HH:MM
  professor_id: string;
  professor_nome: string;
}

serve(async (req) => {
  // LOG: Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('LOG: CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('LOG: Iniciando agendamento de aula inaugural');

    // LOG: Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('LOG: Requisição sem autorização');
      throw new Error('Autorização necessária');
    }

    // LOG: Parsear body
    const body: AgendaAulaInauguralRequest = await req.json();
    console.log('LOG: Dados recebidos:', {
      activity_id: body.activity_id,
      full_name: body.full_name,
      data_aula_inaugural: body.data_aula_inaugural,
      horario_inicio: body.horario_inicio,
      professor_nome: body.professor_nome
    });

    // LOG: Validar campos obrigatórios
    if (!body.activity_id || !body.full_name || !body.data_aula_inaugural || 
        !body.horario_inicio || !body.professor_id || !body.professor_nome) {
      console.error('LOG: Campos obrigatórios ausentes');
      throw new Error('Campos obrigatórios ausentes');
    }

    // LOG: Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // LOG: Buscar dados adicionais da atividade
    console.log('LOG: Buscando dados da atividade:', body.activity_id);
    const { data: activity, error: activityError } = await supabaseClient
      .from('atividade_pos_venda')
      .select('client_id, full_name')
      .eq('id', body.activity_id)
      .single();

    if (activityError || !activity) {
      console.error('LOG: Erro ao buscar atividade:', activityError);
      throw new Error('Atividade não encontrada');
    }

    console.log('LOG: Atividade encontrada, client_id:', activity.client_id);

    // LOG: Preparar payload para webhook
    const webhookPayload = {
      nome_completo: body.full_name,
      data: body.data_aula_inaugural,
      horario: body.horario_inicio,
      professor: body.professor_nome,
      activity_id: body.activity_id,
      client_id: activity.client_id
    };

    console.log('LOG: Payload para webhook:', webhookPayload);

    // LOG: Enviar para webhook N8N
    const webhookUrl = 'https://webhookn8n.agenciakadin.com.br/webhook/agenda-aula-inaugural';
    console.log('LOG: Enviando para webhook:', webhookUrl);

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('LOG: Erro na resposta do webhook:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        body: errorText
      });
      throw new Error(`Webhook falhou: ${webhookResponse.status} - ${errorText}`);
    }

    const webhookResult = await webhookResponse.json();
    console.log('LOG: Resposta do webhook:', webhookResult);

    // LOG: Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Aula inaugural agendada com sucesso',
        webhook_result: webhookResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('LOG: Erro no agendamento de aula inaugural:', errorMessage);
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
