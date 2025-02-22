
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { calendar_v3 } from "https://googleapis.deno.dev/v1/calendar:v3.ts"
import { oauth2_v2 } from "https://googleapis.deno.dev/v1/oauth2:v2.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Criar cliente Supabase com service_role key
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Autenticar usuário
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (userError || !user) {
      console.error('Erro ao validar usuário:', userError)
      throw new Error('User not authenticated')
    }

    console.log('Usuário autenticado:', user.id)

    // Buscar configurações do calendário do usuário
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('user_calendar_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsError || !settings?.google_refresh_token) {
      console.error('Erro ao buscar configurações:', settingsError)
      throw new Error('Calendar not connected')
    }

    // Criar cliente do Google Calendar
    const { path } = await req.json()

    if (path === 'list-calendars') {
      console.log('Listando calendários do usuário')

      // Criar cliente do Google Calendar
      const calendar = new calendar_v3.Calendar({
        auth: settings.google_refresh_token,
      })

      try {
        const response = await calendar.calendarList.list()
        console.log(`${response.items?.length || 0} calendários encontrados`)

        // Atualizar metadata dos calendários
        if (response.items && response.items.length > 0) {
          await supabaseAdmin
            .from('user_calendar_settings')
            .update({
              calendars_metadata: response.items,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
        }

        return new Response(
          JSON.stringify({ calendars: response.items }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Erro ao listar calendários:', error)
        throw new Error('Failed to list calendars')
      }
    }

    if (path === 'sync-events') {
      console.log('Sincronizando eventos')

      if (!Array.isArray(settings.selected_calendars) || settings.selected_calendars.length === 0) {
        console.log('Nenhum calendário selecionado para sincronização')
        return new Response(
          JSON.stringify({ events: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const calendar = new calendar_v3.Calendar({
        auth: settings.google_refresh_token,
      })

      const now = new Date()
      const timeMin = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString()
      const timeMax = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString()

      console.log(`Buscando eventos entre ${timeMin} e ${timeMax}`)

      try {
        const allEvents = []

        for (const calendarId of settings.selected_calendars) {
          console.log(`Buscando eventos do calendário ${calendarId}`)
          
          const response = await calendar.events.list({
            calendarId,
            timeMin,
            timeMax,
            singleEvents: true,
          })

          if (response.items) {
            allEvents.push(...response.items)
          }
        }

        console.log(`Total de ${allEvents.length} eventos encontrados`)

        // Atualizar última sincronização
        await supabaseAdmin
          .from('user_calendar_settings')
          .update({
            last_sync: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        return new Response(
          JSON.stringify({ events: allEvents }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Erro ao sincronizar eventos:', error)
        throw new Error('Failed to sync events')
      }
    }

    throw new Error('Invalid path')

  } catch (error) {
    console.error('Erro na Edge Function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
