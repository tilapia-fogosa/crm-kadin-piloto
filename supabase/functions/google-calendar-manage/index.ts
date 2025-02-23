
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { calendar_v3 } from "https://googleapis.deno.dev/v1/calendar:v3.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { path, calendars = [] } = await req.json();

    // Get JWT token from request header
    const authHeader = req.headers.get('Authorization')!;
    const jwt = authHeader.replace('Bearer ', '');

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${jwt}` } } }
    );

    // Get user calendar settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('user_calendar_settings')
      .select('*')
      .single();

    if (settingsError || !settings?.google_refresh_token) {
      throw new Error('Configurações do calendário não encontradas');
    }

    switch (path) {
      case 'list-calendars':
        const calendarList = await listCalendars(settings.google_refresh_token);
        return new Response(
          JSON.stringify({ calendars: calendarList }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'sync-events':
        const events = await syncEvents(settings.google_refresh_token, calendars, supabaseClient);
        return new Response(
          JSON.stringify({ events }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        throw new Error('Path não suportado');
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function getGoogleClient(refreshToken: string): Promise<calendar_v3.Calendar> {
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const { access_token } = await tokenResponse.json();

  return new calendar_v3.Calendar({
    auth: access_token,
  });
}

async function listCalendars(refreshToken: string) {
  const googleCalendar = await getGoogleClient(refreshToken);
  const response = await googleCalendar.calendarList.list();
  
  return response.items?.map(calendar => ({
    id: calendar.id,
    summary: calendar.summary,
    backgroundColor: calendar.backgroundColor,
  })) || [];
}

async function syncEvents(refreshToken: string, calendarIds: string[], supabaseClient: any) {
  const googleCalendar = await getGoogleClient(refreshToken);
  const now = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth(), 1);
  const timeMax = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Buscar eventos para cada calendário selecionado
  for (const calendarId of calendarIds) {
    const response = await googleCalendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    if (!response.items) continue;

    // Buscar dados do calendário
    const calendarInfo = await googleCalendar.calendarList.get({ calendarId });

    // Processar cada evento
    for (const event of response.items) {
      if (!event.id || !event.start?.dateTime || !event.end?.dateTime) continue;

      const eventData = {
        user_id: user.id,
        google_event_id: event.id,
        title: event.summary || 'Sem título',
        description: event.description,
        start_time: event.start.dateTime,
        end_time: event.end.dateTime,
        calendar_id: calendarId,
        calendar_name: calendarInfo.summary,
        calendar_background_color: calendarInfo.backgroundColor,
        is_recurring: !!event.recurrence,
        recurring_rule: event.recurrence?.[0],
        last_synced_at: new Date().toISOString(),
        sync_status: 'synced'
      };

      // Upsert do evento
      await supabaseClient
        .from('calendar_events')
        .upsert(
          eventData,
          { 
            onConflict: 'google_event_id',
            ignoreDuplicates: false 
          }
        );
    }
  }

  return { success: true };
}
