
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { oauth2_v2 } from "https://googleapis.deno.dev/v1/oauth2:v2.ts"

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
    console.log('[OAuth] Iniciando processamento da requisição')
    
    // Criar cliente Supabase com service_role key
    const supabaseAdmin = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    )

    // Validar configuração
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
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
        `client_id=${GOOGLE_CLIENT_ID}` +
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

      // Inicializar cliente OAuth2
      const oauth2Client = new oauth2_v2.OAuth2({
        clientId: GOOGLE_CLIENT_ID!,
        clientSecret: GOOGLE_CLIENT_SECRET!,
        redirectUri: redirectUri,
      });

      try {
        // Trocar código por tokens
        console.log('[OAuth] Trocando código por tokens')
        const { tokens } = await oauth2Client.getToken(code);
        
        console.log('[OAuth] Tokens obtidos:', { 
          hasAccessToken: !!tokens.access_token,
          hasRefreshToken: !!tokens.refresh_token,
          expiryDate: tokens.expiry_date
        });

        // Configurar tokens no cliente
        oauth2Client.setCredentials(tokens);

        // Obter informações do usuário
        console.log('[OAuth] Obtendo informações do usuário Google')
        const userInfo = await oauth2Client.userinfo.get();
        
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
      } catch (error) {
        console.error('[OAuth] Erro ao processar tokens:', error)
        throw error
      }
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

