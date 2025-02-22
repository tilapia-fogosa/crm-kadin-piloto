
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cliente Supabase com service_role para bypass RLS
const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: userError } = await adminSupabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Obter as configurações do calendário do usuário
    const { data: settings, error: settingsError } = await adminSupabase
      .from('user_calendar_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsError || !settings?.google_refresh_token) {
      throw new Error('Configurações do calendário não encontradas')
    }

    // Configurar cliente OAuth2
    const oauth2Client = new OAuth2Client({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      tokenUri: "https://oauth2.googleapis.com/token"
    });

    // Configurar refresh token
    const tokens = await oauth2Client.refreshToken.refresh(settings.google_refresh_token);
    const accessToken = tokens.accessToken;

    // Parse da URL para obter o path e query params
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    switch (path) {
      case 'calendars':
        if (req.method === 'GET') {
          // Listar calendários disponíveis
          const response = await fetch(
            'https://www.googleapis.com/calendar/v3/users/me/calendarList',
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          
          if (!response.ok) {
            throw new Error('Erro ao buscar calendários');
          }
          
          const data = await response.json();
          const calendars = data.items || [];

          // Atualizar metadados no banco
          await adminSupabase
            .from('user_calendar_settings')
            .update({
              calendars_metadata: calendars.reduce((acc, cal) => ({
                ...acc,
                [cal.id]: {
                  name: cal.summary,
                  primary: cal.primary || false,
                  backgroundColor: cal.backgroundColor
                }
              }), {})
            })
            .eq('user_id', user.id)

          return new Response(
            JSON.stringify({ 
              calendars: calendars.map(cal => ({
                id: cal.id,
                name: cal.summary,
                primary: cal.primary || false,
                selected: (settings.selected_calendars || []).includes(cal.id),
                backgroundColor: cal.backgroundColor
              }))
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else if (req.method === 'POST') {
          // Atualizar calendários selecionados
          const { selectedIds } = await req.json()
          
          if (!Array.isArray(selectedIds)) {
            throw new Error('selectedIds deve ser um array')
          }

          await adminSupabase
            .from('user_calendar_settings')
            .update({
              selected_calendars: selectedIds,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)

          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break

      case 'events':
        if (req.method === 'GET') {
          const timeMin = url.searchParams.get('timeMin') || new Date().toISOString()
          const timeMax = url.searchParams.get('timeMax') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

          // Buscar eventos de todos os calendários selecionados
          const selectedCalendars = settings.selected_calendars || []
          const allEvents = await Promise.all(
            selectedCalendars.map(calendarId =>
              fetch(
                `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              ).then(response => response.json())
            )
          )

          const events = allEvents.flatMap(response => 
            (response.items || []).map(event => ({
              id: event.id,
              calendarId: event.calendarId,
              title: event.summary,
              start: event.start?.dateTime || event.start?.date,
              end: event.end?.dateTime || event.end?.date,
              description: event.description
            }))
          )

          return new Response(
            JSON.stringify({ events }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break
    }

    // Rota não encontrada
    return new Response(
      JSON.stringify({ error: 'Rota não encontrada' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
