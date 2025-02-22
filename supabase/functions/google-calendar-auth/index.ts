
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";

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
    const oauth2Client = new OAuth2Client({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      authorizationEndpointUri: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUri: "https://oauth2.googleapis.com/token",
      redirectUri: `${SUPABASE_URL}/functions/v1/google-calendar-auth`,
      defaults: {
        scope: ["https://www.googleapis.com/auth/calendar.readonly", 
                "https://www.googleapis.com/auth/calendar.events",
                "https://www.googleapis.com/auth/userinfo.email"]
      }
    });

    switch (path) {
      case 'init': {
        // Gerar URL de autorização
        const url = await oauth2Client.code.getAuthorizationUri({
          access_type: "offline",
          prompt: "consent"
        });

        return new Response(
          JSON.stringify({ url: url.toString() }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      }

      case 'callback': {
        if (!code) {
          throw new Error('Código de autorização não fornecido')
        }

        // Trocar código por tokens
        const tokens = await oauth2Client.code.getToken(code);
        
        if (!tokens.refreshToken) {
          throw new Error('Refresh token não recebido')
        }

        // Obter informações do usuário Google
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v2/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          }
        );
        const userInfo = await userInfoResponse.json();
        
        console.log('Informações do usuário Google:', userInfo)

        // Usar adminSupabase para bypass RLS
        console.log('Tentando salvar configurações com service_role')
        const { data: userSettings, error: upsertError } = await adminSupabase
          .from('user_calendar_settings')
          .upsert({
            user_id: user.id,
            google_refresh_token: tokens.refreshToken,
            sync_enabled: true,
            google_account_email: userInfo.email,
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
            email: userInfo.email
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
