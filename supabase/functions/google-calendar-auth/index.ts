
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!

// Configuração do cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { path, code, error } = await req.json()

    // Tratamento de erros do OAuth
    if (error) {
      console.error('Erro na autenticação OAuth:', error)
      return new Response(
        JSON.stringify({ error: 'Erro na autenticação do Google' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Rota para iniciar o fluxo OAuth
    if (path === 'init') {
      const redirectUri = `${req.headers.get('origin')}/auth/callback`
      const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar')
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`
      
      return new Response(
        JSON.stringify({ url: authUrl }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Rota para processar o callback do OAuth
    if (path === 'callback' && code) {
      const redirectUri = `${req.headers.get('origin')}/auth/callback`
      
      // Trocar o código por tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      })

      const tokens = await tokenResponse.json()

      if (tokens.error) {
        console.error('Erro ao obter tokens:', tokens.error)
        return new Response(
          JSON.stringify({ error: 'Falha ao obter tokens do Google' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      // Obter informações do usuário autenticado no Supabase
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Não autorizado' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401 
          }
        )
      }

      // Salvar os tokens no banco de dados
      const { data: userSettings, error: upsertError } = await supabase
        .from('user_calendar_settings')
        .upsert({
          user_id: authHeader.split(' ')[1], // Token JWT contém o user_id
          google_refresh_token: tokens.refresh_token,
          sync_enabled: true,
          last_sync: new Date().toISOString(),
        })
        .select()
        .single()

      if (upsertError) {
        console.error('Erro ao salvar configurações:', upsertError)
        return new Response(
          JSON.stringify({ error: 'Erro ao salvar configurações' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          message: 'Autenticação concluída com sucesso',
          data: userSettings 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Rota inválida' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )

  } catch (err) {
    console.error('Erro interno:', err)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
