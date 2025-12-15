/**
 * Edge Function temporária para atualizar created_by em historico_comercial
 * 
 * Log: Função administrativa para popular created_by nas mensagens existentes
 * Etapas:
 * 1. Recebe o user_id como parâmetro
 * 2. Usa service role key para bypassar RLS
 * 3. Atualiza todas as linhas com created_by NULL
 * 4. Retorna quantidade de registros atualizados
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Log de início
  console.log('update-historico-created-by: Iniciando função');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse do body
    const { user_id } = await req.json();
    
    console.log('update-historico-created-by: user_id recebido:', user_id);

    if (!user_id) {
      console.error('update-historico-created-by: user_id não fornecido');
      return new Response(
        JSON.stringify({ error: 'user_id é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Inicializar cliente Supabase com service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('update-historico-created-by: Executando UPDATE');

    // Executar UPDATE
    const { data, error, count } = await supabase
      .from('historico_comercial')
      .update({ created_by: user_id })
      .is('created_by', null)
      .select('id');

    if (error) {
      console.error('update-historico-created-by: Erro ao executar UPDATE:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao atualizar registros',
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`update-historico-created-by: ${count || 0} registros atualizados com sucesso`);

    return new Response(
      JSON.stringify({ 
        success: true,
        updated_count: count || 0,
        message: `${count || 0} registros atualizados com sucesso`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('update-historico-created-by: Erro na função:', (error as Error).message);
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
