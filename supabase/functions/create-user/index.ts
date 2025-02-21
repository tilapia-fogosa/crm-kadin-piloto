
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string
  fullName: string
  role: 'consultor' | 'franqueado' | 'admin'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, fullName, role } = await req.json() as CreateUserRequest

    // Criar usuário com senha padrão
    const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: 'Mudar@123',
      email_confirm: true,
    })

    if (createError) throw createError

    // Usar a nova função simplificada para criar usuário e associar à unidade
    const { data, error: dbError } = await supabase
      .rpc('create_unit_user_simple', {
        p_email: email,
        p_full_name: fullName,
        p_role: role,
      })

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({ message: 'Usuário criado com sucesso' }),
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
