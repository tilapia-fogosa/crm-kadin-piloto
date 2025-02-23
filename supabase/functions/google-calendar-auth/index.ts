
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { OAuth2 } from "https://googleapis.deno.dev/v1/oauth2:v2.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[OAuth] Iniciando processamento da requisição')
    
    // Criar cliente Supabase com service_role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Validar configuração
    if (!Deno.env.get('GOOGLE_CLIENT_ID') || !Deno.env.get('GOOGLE_CLIENT_SECRET')) {
      console.error('[OAuth] Erro: Credenciais do Google não configuradas')
      throw new Error('Google credentials not configured')
    }

    // Obter o token de autenticação do usuário
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('[OAuth] Erro: Header de autorização ausente')
      throw new Error('No authorization header')
    }

    // Validar o usuário atual usando o token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (userError || !user) {
      console.error('[OAuth] Erro ao validar usuário:', userError)
      throw new Error('User not authenticated')
    }

    console.log('[OAuth] Usuário autenticado:', user.id)

    const { path, code } = await req.json()

    if (path === 'init') {
      console.log('[OAuth] Iniciando fluxo de autenticação Google')
      
      const redirectUri = `${req.headers.get('origin')}/auth/callback`
      const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events')
      
      const googleAuthUrl = 
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${Deno.env.get('GOOGLE_CLIENT_ID')}` +
        `&redirect_uri=${redirectUri}` +
        `&response_type=code` +
        `&scope=${scope}` +
        `&access_type=offline` +
        `&prompt=consent`

      console.log('[OAuth] URL de autenticação gerada:', googleAuthUrl)

      return new Response(
        JSON.stringify({ url: googleAuthUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (path === 'callback') {
      if (!code) {
        console.error('[OAuth] Erro: Código não fornecido no callback')
        throw new Error('No code provided')
      }

      console.log('[OAuth] Processando callback com código:', code)

      const redirectUri = `${req.headers.get('origin')}/auth/callback`

      // Trocar código por tokens
      console.log('[OAuth] Trocando código por tokens')
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        console.error('[OAuth] Erro na resposta do token:', await tokenResponse.text())
        throw new Error('Failed to exchange code for tokens')
      }

      const tokens = await tokenResponse.json()
      
      console.log('[OAuth] Tokens obtidos:', { 
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiryDate: tokens.expiry_date
      })

      // Obter informações do usuário usando o access token
      console.log('[OAuth] Obtendo informações do usuário Google')
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const userInfo = await userInfoResponse.json();
      
      console.log('[OAuth] Informações obtidas:', {
        hasEmail: !!userInfo.email,
        emailVerified: userInfo.verified_email
      });

      if (!userInfo.email) {
        throw new Error('User email not found in Google response');
      }

      // Salvar configurações
      console.log('[OAuth] Salvando configurações do usuário')
      const { error: insertError } = await supabaseAdmin
        .from('user_calendar_settings')
        .upsert({
          user_id: user.id,
          google_refresh_token: tokens.refresh_token,
          google_account_email: userInfo.email,
          sync_enabled: true,
          selected_calendars: [],
          calendars_metadata: [],
          updated_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('[OAuth] Erro ao salvar tokens:', insertError)
        throw new Error('Failed to store refresh token')
      }

      console.log('[OAuth] Configurações salvas com sucesso')

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid path')

  } catch (error) {
    console.error('[OAuth] Erro na Edge Function:', error)
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
