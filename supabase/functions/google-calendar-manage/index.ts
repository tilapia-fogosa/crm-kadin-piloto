
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

async function getGoogleAccessToken(refresh_token: string): Promise<string> {
  console.log('Tentando obter novo access token...');
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      refresh_token: refresh_token,
      grant_type: 'refresh_token',
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    console.error('Erro ao obter access token:', data);
    throw new Error(`Failed to refresh token: ${data.error}`)
  }

  console.log('Novo access token obtido com sucesso');
  return data.access_token
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_ANON_KEY!
    )

    // Get auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get session
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) {
      throw new Error('Error fetching user')
    }

    // Get user's calendar settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_calendar_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsError || !settings?.google_refresh_token) {
      console.error('Erro ao buscar configurações:', settingsError);
      throw new Error('Calendar not connected')
    }

    const { path } = await req.json()

    // Get fresh access token
    const accessToken = await getGoogleAccessToken(settings.google_refresh_token)

    if (path === 'list-calendars') {
      console.log('Listando calendários...');
      
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      const data = await response.json()
      if (!response.ok) {
        console.error('Erro ao buscar calendários:', data);
        throw new Error('Failed to fetch calendars')
      }

      // Update calendars metadata
      await supabase
        .from('user_calendar_settings')
        .update({
          calendars_metadata: data.items,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      console.log(`${data.items?.length || 0} calendários encontrados`);
      
      return new Response(
        JSON.stringify({ calendars: data.items }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (path === 'sync-events') {
      console.log('Iniciando sincronização de eventos...');
      
      // Validar selected_calendars
      if (!Array.isArray(settings.selected_calendars) || settings.selected_calendars.length === 0) {
        console.log('Nenhum calendário selecionado para sincronização');
        return new Response(
          JSON.stringify({ events: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const now = new Date()
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      const oneMonthAhead = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())

      console.log(`Buscando eventos entre ${oneMonthAgo.toISOString()} e ${oneMonthAhead.toISOString()}`);
      
      const promises = settings.selected_calendars.map(async (calId: string) => {
        try {
          console.log(`Buscando eventos do calendário ${calId}...`);
          
          const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?` +
            `timeMin=${oneMonthAgo.toISOString()}&` +
            `timeMax=${oneMonthAhead.toISOString()}&` +
            `singleEvents=true`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          )

          if (!response.ok) {
            console.error(`Erro ao buscar eventos do calendário ${calId}:`, await response.text());
            return [];
          }

          const data = await response.json()
          console.log(`${data.items?.length || 0} eventos encontrados no calendário ${calId}`);
          return data.items || []
        } catch (error) {
          console.error(`Erro ao processar calendário ${calId}:`, error);
          return [];
        }
      })

      const allEvents = await Promise.all(promises)
      const flatEvents = allEvents.flat()

      console.log(`Total de ${flatEvents.length} eventos sincronizados`);

      // Update last sync time
      await supabase
        .from('user_calendar_settings')
        .update({
          last_sync: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      return new Response(
        JSON.stringify({ events: flatEvents }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid path')

  } catch (error) {
    console.error('Erro na Edge Function:', error);
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
