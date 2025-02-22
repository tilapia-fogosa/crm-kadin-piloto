
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Criar cliente Supabase com service_role key
    const supabaseAdmin = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    )

    // Obter o token de autenticação do usuário
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Validar o usuário atual usando o token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (userError || !user) {
      console.error('Erro ao validar usuário:', userError)
      throw new Error('User not authenticated')
    }

    console.log('Usuário autenticado:', user.id)

    const { path, code } = await req.json()

    if (path === 'init') {
      console.log('Iniciando fluxo de autenticação Google')
      
      const redirectUri = `${req.headers.get('origin')}/auth/callback`
      const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events')
      
      const googleAuthUrl = 
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${redirectUri}` +
        `&response_type=code` +
        `&scope=${scope}` +
        `&access_type=offline` +
        `&prompt=consent`

      return new Response(
        JSON.stringify({ url: googleAuthUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (path === 'callback') {
      if (!code) {
        throw new Error('No code provided')
      }

      console.log('Processando callback com código:', code)

      const redirectUri = `${req.headers.get('origin')}/auth/callback`

      // Trocar código por tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID!,
          client_secret: GOOGLE_CLIENT_SECRET!,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      })

      const tokenData = await tokenResponse.json()
      
      if (!tokenResponse.ok) {
        console.error('Erro ao trocar código por tokens:', tokenData)
        throw new Error('Failed to exchange code')
      }

      // Obter informações do usuário Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      })

      const userInfo = await userInfoResponse.json()
      if (!userInfoResponse.ok) {
        console.error('Erro ao obter informações do usuário:', userInfo)
        throw new Error('Failed to get user info')
      }

      console.log('Salvando tokens e email do usuário')

      // Usar o cliente admin para salvar as configurações
      const { error: insertError } = await supabaseAdmin
        .from('user_calendar_settings')
        .upsert({
          user_id: user.id,
          google_refresh_token: tokenData.refresh_token,
          google_account_email: userInfo.email,
          sync_enabled: true,
          updated_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('Erro ao salvar tokens:', insertError)
        throw new Error('Failed to store refresh token')
      }

      console.log('Configurações salvas com sucesso')

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid path')

  } catch (error) {
    console.error('Erro na Edge Function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
