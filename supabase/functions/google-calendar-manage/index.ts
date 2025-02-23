
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { google } from "https://googleapis.deno.dev/v1/calendar/v3/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

serve(async (req) => {
  // Sempre responder a requisições OPTIONS com os headers CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[google-calendar-manage] Iniciando processamento da requisição');
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

    console.log('[google-calendar-manage] Configurações recuperadas:', settings);

    if (settingsError || !settings?.google_refresh_token) {
      console.error('[google-calendar-manage] Erro ao buscar configurações:', settingsError);
      throw new Error('Configurações do calendário não encontradas');
    }

    // Configurar cliente do Google Calendar
    const tokens = await refreshGoogleToken(settings.google_refresh_token);
    const calendar = google.calendar({ version: 'v3', auth: tokens.access_token });

    switch (path) {
      case 'list-calendars':
        console.log('[google-calendar-manage] Listando calendários');
        const calendarList = await calendar.calendarList.list();
        return new Response(
          JSON.stringify({ calendars: calendarList.items }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'sync-events':
        console.log('[google-calendar-manage] Sincronizando eventos');
        const now = new Date();
        const timeMin = new Date(now.getFullYear(), now.getMonth(), 1);
        const timeMax = new Date(now.getFullYear(), now.getMonth() + 2, 0);
        
        const events = [];
        for (const calendarId of calendars) {
          const response = await calendar.events.list({
            calendarId,
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
          });

          if (response.items) {
            events.push(...response.items);
          }
        }

        return new Response(
          JSON.stringify({ events }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        throw new Error('Path não suportado');
    }
  } catch (error) {
    console.error('[google-calendar-manage] Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function refreshGoogleToken(refreshToken: string): Promise<{ access_token: string }> {
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

  if (!tokenResponse.ok) {
    throw new Error('Falha ao atualizar token do Google');
  }

  return tokenResponse.json();
}

