import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body and validate path
    const { path, calendars, syncToken } = await req.json();
    if (!path) throw new Error('Path is required');

    // Get JWT token from request header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');
    
    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) throw new Error('Invalid user token');

    // Get user's Google refresh token
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('user_calendar_settings')
      .select('google_refresh_token')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.google_refresh_token) {
      throw new Error('Google Calendar not connected');
    }

    // Get new access token from Google
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: Deno.env.get('GOOGLE_CLIENT_ID'),
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET'),
        refresh_token: settings.google_refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token response:', await tokenResponse.text());
      throw new Error('Failed to get Google access token');
    }

    const { access_token } = await tokenResponse.json();
    if (!access_token) throw new Error('No access token received');

    // Handle different paths
    switch (path) {
      case 'list-calendars': {
        console.log('Fetching calendars list');
        const calResponse = await fetch(`${CALENDAR_API_URL}/users/me/calendarList`, {
          headers: { 'Authorization': `Bearer ${access_token}` },
        });

        if (!calResponse.ok) {
          console.error('Calendar response:', await calResponse.text());
          throw new Error('Failed to fetch calendars');
        }

        const calendars = await calResponse.json();
        return new Response(JSON.stringify({ calendars: calendars.items }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'sync-events': {
        console.log('Sincronizando eventos dos calendários:', calendars);
        
        if (!Array.isArray(calendars) || calendars.length === 0) {
          throw new Error('No calendars selected for sync');
        }

        const timeMin = new Date();
        timeMin.setMonth(timeMin.getMonth() - 1); // último mês
        const timeMax = new Date();
        timeMax.setMonth(timeMax.getMonth() + 3); // próximos 3 meses

        let allEvents = [];
        let nextSyncToken = null;

        // Buscar eventos de cada calendário
        for (const calendarId of calendars) {
          console.log(`Buscando eventos do calendário: ${calendarId}`);
          
          const params = new URLSearchParams({
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            singleEvents: 'true',
            orderBy: 'startTime',
          });

          if (syncToken) {
            params.set('syncToken', syncToken);
          }

          const eventsResponse = await fetch(
            `${CALENDAR_API_URL}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
            { headers: { 'Authorization': `Bearer ${access_token}` } }
          );

          if (!eventsResponse.ok) {
            console.error(`Erro ao buscar eventos do calendário ${calendarId}:`, await eventsResponse.text());
            continue;
          }

          const eventsData = await eventsResponse.json();
          nextSyncToken = eventsData.nextSyncToken;

          const calendarResponse = await fetch(
            `${CALENDAR_API_URL}/calendars/${encodeURIComponent(calendarId)}`,
            { headers: { 'Authorization': `Bearer ${access_token}` } }
          );
          
          const calendarData = await calendarResponse.json();

          // Mapear eventos com metadados do calendário
          const eventsWithMetadata = eventsData.items.map(event => ({
            id: event.id,
            google_event_id: event.id,
            calendar_id: calendarId,
            calendar_name: calendarData.summary,
            calendar_background_color: calendarData.backgroundColor,
            title: event.summary || 'Sem título',
            description: event.description,
            start_time: event.start.dateTime || event.start.date,
            end_time: event.end.dateTime || event.end.date,
            is_recurring: !!event.recurringEventId,
            recurring_rule: event.recurrence?.join('; '),
            user_id: user.id,
            active: true,
            sync_status: 'synced'
          }));

          allEvents = allEvents.concat(eventsWithMetadata);
        }

        // Atualizar eventos no banco
        if (allEvents.length > 0) {
          const { error: upsertError } = await supabaseAdmin
            .from('calendar_events')
            .upsert(allEvents, { 
              onConflict: 'unique_google_event_user',
              ignoreDuplicates: false 
            });

          if (upsertError) {
            console.error('Erro ao salvar eventos:', upsertError);
            throw new Error('Failed to save events');
          }
        }

        // Atualizar sync token
        if (nextSyncToken) {
          const { error: updateError } = await supabaseAdmin
            .from('user_calendar_settings')
            .update({ 
              sync_token: nextSyncToken,
              last_sync: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (updateError) {
            console.error('Erro ao atualizar sync token:', updateError);
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            events: allEvents.length,
            nextSyncToken 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown path: ${path}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
