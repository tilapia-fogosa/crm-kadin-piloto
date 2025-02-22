
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { google } from "https://deno.land/x/google_oauth2_api/mod.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!

// Cliente Supabase para autenticação
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Cliente Supabase com service_role para bypass RLS
const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  const url = new URL(req.url)
  
  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: userError } = await adminSupabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse do body da requisição
    const { path, code } = await req.json()

    // OAuth2 client do Google
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      `${SUPABASE_URL}/functions/v1/google-calendar-auth`
    )

    switch (path) {
      case 'init': {
        // Gerar URL de autorização
        const scopes = [
          'https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/calendar.events',
          'https://www.googleapis.com/auth/userinfo.email'
        ]

        const url = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: scopes,
          prompt: 'consent'
        })

        return new Response(
          JSON.stringify({ url }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      }

      case 'callback': {
        if (!code) {
          throw new Error('Código de autorização não fornecido')
        }

        // Trocar código por tokens
        const { tokens } = await oauth2Client.getToken(code)
        oauth2Client.setCredentials(tokens)

        if (!tokens.refresh_token) {
          throw new Error('Refresh token não recebido')
        }

        // Obter informações do usuário Google
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
        const userInfo = await oauth2.userinfo.get()
        
        console.log('Informações do usuário Google:', userInfo.data)

        // Usar adminSupabase para bypass RLS
        console.log('Tentando salvar configurações com service_role')
        const { data: userSettings, error: upsertError } = await adminSupabase
          .from('user_calendar_settings')
          .upsert({
            user_id: user.id,
            google_refresh_token: tokens.refresh_token,
            sync_enabled: true,
            google_account_email: userInfo.data.email,
            last_sync: new Date().toISOString()
          })
          .select()
          .single()

        if (upsertError) {
          console.error('Erro ao salvar configurações:', upsertError)
          throw new Error(
            'Erro ao salvar configurações: ' + 
            (upsertError?.message || 'Erro desconhecido')
          )
        }

        console.log('Configurações salvas com sucesso:', userSettings)
        return new Response(
          JSON.stringify({ 
            message: 'Autenticação concluída com sucesso',
            email: userInfo.data.email
          }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Path inválido' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message === 'Unauthorized' ? 401 : 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
