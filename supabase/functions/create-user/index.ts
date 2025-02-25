
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, fullName, role, unitIds } = await req.json()

    // Validação básica
    if (!email || !fullName || !role || !unitIds || !Array.isArray(unitIds) || unitIds.length === 0) {
      throw new Error('Dados inválidos')
    }

    // Criar usuário usando a função RPC do banco
    const { data: userId, error: createError } = await supabaseClient.rpc(
      'create_unit_user',
      {
        p_email: email,
        p_full_name: fullName,
        p_unit_ids: unitIds,
        p_role: role
      }
    )

    if (createError) throw createError

    return new Response(
      JSON.stringify({ userId }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
