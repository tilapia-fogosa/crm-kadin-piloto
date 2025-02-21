
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

    // Obter o token de autenticação do cabeçalho
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header missing')
    }

    console.log('Auth Header recebido:', authHeader)

    // Verificar se o usuário que fez a requisição é admin
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Erro ao verificar usuário')
    }

    // Verificar se o usuário é admin em alguma unidade
    const { data: adminCheck, error: adminError } = await supabase
      .from('unit_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .eq('active', true)
      .limit(1)

    if (adminError) {
      throw new Error('Erro ao verificar permissões de admin')
    }

    if (!adminCheck || adminCheck.length === 0) {
      throw new Error('Apenas administradores podem criar usuários')
    }

    const { email, fullName, role } = await req.json() as CreateUserRequest

    // Criar usuário usando a função RPC
    const { data, error: createError } = await supabase
      .rpc('create_unit_user_simple', {
        p_email: email,
        p_full_name: fullName,
        p_role: role,
      })

    if (createError) throw createError

    return new Response(
      JSON.stringify({ message: 'Usuário criado com sucesso' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Erro na função create-user:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
