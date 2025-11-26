/**
 * Edge Function para inicializar status do WhatsApp
 * 
 * Log: Função administrativa para criar registro inicial de status
 * Etapas:
 * 1. Verifica se já existe o registro
 * 2. Se não existir, cria com status 'close'
 * 3. Retorna o status atual
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  console.log('init-whatsapp-status: Iniciando função');
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('init-whatsapp-status: Verificando se registro existe');

    const { data: existing } = await supabase
      .from('dados_importantes')
      .select('*')
      .eq('key', 'status_whatapp_comercial')
      .single();

    if (existing) {
      console.log('init-whatsapp-status: Registro já existe');
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Registro já existe',
          status: existing.data
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('init-whatsapp-status: Criando registro inicial');

    const { data, error } = await supabase
      .from('dados_importantes')
      .insert({
        key: 'status_whatapp_comercial',
        data: 'close'
      })
      .select()
      .single();

    if (error) {
      console.error('init-whatsapp-status: Erro ao criar registro:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao criar registro',
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('init-whatsapp-status: Registro criado com sucesso');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Registro criado com sucesso',
        data
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
    );

  } catch (error) {
    console.error('init-whatsapp-status: Erro na função:', (error as Error).message);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno',
        message: (error as Error).message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
